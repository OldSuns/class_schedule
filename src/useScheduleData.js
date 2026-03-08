import { useCallback, useEffect, useRef, useState } from "react";
import * as storage from "../storage";
import { DEFAULT_SCHEDULE_VERSION, STORAGE_KEYS } from "./constants";
import { scheduleData as defaultScheduleData } from "./scheduleData";
import { normalizeSchedule } from "./scheduleUtils";
import {
  buildScheduleSignature,
  fetchRemoteSchedule
} from "./remoteSchedule";

const STORAGE_VERSION = 1;
const DEFAULT_SCHEDULE_SIGNATURE = buildScheduleSignature(
  normalizeSchedule(defaultScheduleData)
);

const parseRemoteSnapshot = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.schedule)) return null;
    const schedule = normalizeSchedule(parsed.schedule);
    const signature =
      typeof parsed.signature === "string"
        ? parsed.signature
        : buildScheduleSignature(schedule);
    return {
      version: Number(parsed.version) || 1,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      schedule,
      signature
    };
  } catch (error) {
    console.warn("远端课表缓存解析失败:", error);
    return null;
  }
};

const parseRemoteMeta = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      etag: typeof parsed.etag === "string" ? parsed.etag : "",
      lastModified:
        typeof parsed.lastModified === "string" ? parsed.lastModified : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      signature: typeof parsed.signature === "string" ? parsed.signature : "",
      sourceUrl: typeof parsed.sourceUrl === "string" ? parsed.sourceUrl : ""
    };
  } catch (error) {
    console.warn("远端课表元信息解析失败:", error);
    return null;
  }
};

const persistRemoteSnapshot = async (snapshot) => {
  if (!snapshot) return;
  await storage.setItem(
    STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT,
    JSON.stringify(snapshot)
  );
};

const persistRemoteMeta = async (meta) => {
  if (!meta) return;
  await storage.setItem(
    STORAGE_KEYS.REMOTE_SCHEDULE_META,
    JSON.stringify(meta)
  );
};

export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useState(() =>
    normalizeSchedule(defaultScheduleData)
  );
  const [isScheduleLoaded, setIsScheduleLoaded] = useState(false);
  const [hasCustomSchedule, setHasCustomSchedule] = useState(false);
  const [remoteSnapshot, setRemoteSnapshot] = useState(null);
  const [remoteMeta, setRemoteMeta] = useState(null);
  const [isCheckingRemote, setIsCheckingRemote] = useState(false);
  const [pendingRemoteSnapshot, setPendingRemoteSnapshot] = useState(null);
  const [pendingRemoteSourceUrl, setPendingRemoteSourceUrl] = useState("");
  const [builtInUpdateNotice, setBuiltInUpdateNotice] = useState("");
  const hasUserChangedScheduleRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadSchedule = async () => {
      const [
        saved,
        remoteRaw,
        remoteMetaRaw,
        storedDefaultVersionRaw,
        storedDefaultSignatureRaw
      ] = await Promise.all([
        storage.getItem(STORAGE_KEYS.CUSTOM_SCHEDULE),
        storage.getItem(STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT),
        storage.getItem(STORAGE_KEYS.REMOTE_SCHEDULE_META),
        storage.getItem(STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION),
        storage.getItem(STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE)
      ]);

      if (cancelled) return;

      const parsedRemoteSnapshot = parseRemoteSnapshot(remoteRaw);
      const parsedRemoteMeta = parseRemoteMeta(remoteMetaRaw);
      setRemoteSnapshot(parsedRemoteSnapshot);
      setRemoteMeta(parsedRemoteMeta);

      const storedDefaultVersion = storedDefaultVersionRaw ?? "";
      const storedDefaultSignature = storedDefaultSignatureRaw ?? "";
      const hasStoredDefaultInfo =
        storedDefaultVersionRaw != null || storedDefaultSignatureRaw != null;
      const defaultChanged =
        hasStoredDefaultInfo &&
        (storedDefaultVersion !== String(DEFAULT_SCHEDULE_VERSION) ||
          storedDefaultSignature !== DEFAULT_SCHEDULE_SIGNATURE);

      if (!hasStoredDefaultInfo || defaultChanged) {
        await Promise.all([
          storage.setItem(
            STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION,
            String(DEFAULT_SCHEDULE_VERSION)
          ),
          storage.setItem(
            STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE,
            DEFAULT_SCHEDULE_SIGNATURE
          )
        ]);
      }

      let parsedCustomSchedule = null;
      let hasSavedCustom = false;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.version === STORAGE_VERSION && Array.isArray(parsed.schedule)) {
            parsedCustomSchedule = normalizeSchedule(parsed.schedule);
            hasSavedCustom = true;
          } else if (Array.isArray(parsed)) {
            parsedCustomSchedule = normalizeSchedule(parsed);
            hasSavedCustom = true;
          }
        } catch (error) {
          console.warn("自定义课表解析失败，已回退默认数据", error);
        }
      }

      if (defaultChanged && hasSavedCustom) {
        setBuiltInUpdateNotice("内置课表已更新，可在设置中重置");
      }

      if (hasUserChangedScheduleRef.current) {
        setIsScheduleLoaded(true);
        return;
      }

      if (hasSavedCustom) {
        setScheduleData(parsedCustomSchedule);
        setHasCustomSchedule(true);
      } else if (parsedRemoteSnapshot) {
        setScheduleData(parsedRemoteSnapshot.schedule);
        setHasCustomSchedule(false);
      } else {
        setHasCustomSchedule(false);
      }
      if (!cancelled) {
        setIsScheduleLoaded(true);
      }
    };

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateScheduleData = useCallback((updater) => {
    hasUserChangedScheduleRef.current = true;
    setHasCustomSchedule(true);
    setScheduleData((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const applyRemoteSchedule = useCallback((snapshot) => {
    if (!snapshot?.schedule) return;
    hasUserChangedScheduleRef.current = true;
    setHasCustomSchedule(false);
    setScheduleData(snapshot.schedule);
  }, []);

  const confirmRemoteUpdate = useCallback(() => {
    if (!pendingRemoteSnapshot) return null;
    applyRemoteSchedule(pendingRemoteSnapshot);
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    return {
      status: "updated",
      message: "课表已更新",
      updatedAt: pendingRemoteSnapshot.updatedAt,
      sourceUrl: pendingRemoteSourceUrl
    };
  }, [applyRemoteSchedule, pendingRemoteSnapshot, pendingRemoteSourceUrl]);

  const cancelRemoteUpdate = useCallback(() => {
    if (!pendingRemoteSnapshot) return null;
    const updatedAt = pendingRemoteSnapshot.updatedAt;
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    return {
      status: "skipped",
      message: "已暂不更新",
      updatedAt,
      sourceUrl: pendingRemoteSourceUrl
    };
  }, [pendingRemoteSnapshot, pendingRemoteSourceUrl]);

  useEffect(() => {
    if (!isScheduleLoaded) return;
    if (!hasCustomSchedule) {
      storage.removeItem(STORAGE_KEYS.CUSTOM_SCHEDULE);
      return;
    }
    const payload = JSON.stringify({
      version: STORAGE_VERSION,
      schedule: scheduleData
    });
    storage.setItem(STORAGE_KEYS.CUSTOM_SCHEDULE, payload);
  }, [scheduleData, hasCustomSchedule, isScheduleLoaded]);

  const resetSchedule = async () => {
    hasUserChangedScheduleRef.current = true;
    setHasCustomSchedule(false);
    setScheduleData(normalizeSchedule(defaultScheduleData));
    setRemoteSnapshot(null);
    setRemoteMeta(null);
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    await storage.removeItem(STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT);
    await storage.removeItem(STORAGE_KEYS.REMOTE_SCHEDULE_META);
  };

  const softUpdateSchedule = useCallback(async () => {
    if (isCheckingRemote) {
      return { status: "busy", message: "正在检查更新，请稍后" };
    }
    setIsCheckingRemote(true);
    try {
      const result = await fetchRemoteSchedule({ meta: remoteMeta });
      const checkedSourceUrl = result?.meta?.sourceUrl || result?.sourceUrl || "";

      let nextSnapshot = remoteSnapshot;
      let nextMeta = remoteMeta;

      if (result.status === "updated") {
        nextSnapshot = {
          ...result.snapshot,
          signature: result.meta?.signature
        };
        nextMeta = result.meta;
        await persistRemoteSnapshot(nextSnapshot);
        await persistRemoteMeta(nextMeta);
        setRemoteSnapshot(nextSnapshot);
        setRemoteMeta(nextMeta);
      } else if (result.status === "not-modified") {
        if (!nextSnapshot) {
          return { status: "error", message: "未获取到远端课表" };
        }
      } else if (result.status === "error") {
        return { status: "error", message: result.message || "课表更新失败" };
      }

      if (!nextSnapshot) {
        return { status: "error", message: "未获取到远端课表" };
      }

      const currentSignature = buildScheduleSignature(scheduleData);
      const remoteSignature =
        nextSnapshot.signature || buildScheduleSignature(nextSnapshot.schedule);

      if (currentSignature === remoteSignature) {
        return {
          status: "latest",
          message: "已是最新课表",
          updatedAt: nextSnapshot.updatedAt,
          sourceUrl: checkedSourceUrl
        };
      }

      setPendingRemoteSourceUrl(checkedSourceUrl);
      setPendingRemoteSnapshot(nextSnapshot);
      return {
        status: "update-available",
        message: "检测到远端课表更新",
        updatedAt: nextSnapshot.updatedAt,
        sourceUrl: checkedSourceUrl
      };
    } catch (error) {
      console.error("课表软更新失败:", error);
      return { status: "error", message: "课表更新失败，请稍后重试" };
    } finally {
      setIsCheckingRemote(false);
    }
  }, [
    isCheckingRemote,
    remoteMeta,
    remoteSnapshot,
    scheduleData
  ]);

  return {
    scheduleData,
    setScheduleData: updateScheduleData,
    isScheduleLoaded,
    resetSchedule,
    softUpdateSchedule,
    confirmRemoteUpdate,
    cancelRemoteUpdate,
    pendingRemoteSnapshot,
    isCheckingRemote,
    remoteUpdatedAt: remoteSnapshot?.updatedAt || remoteMeta?.updatedAt || "",
    builtInUpdateNotice
  };
};
