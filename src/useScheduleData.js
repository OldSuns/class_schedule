import { useCallback, useEffect, useRef, useState } from "react";
import * as storage from "../storage";
import { DEFAULT_SCHEDULE_VERSION, STORAGE_KEYS } from "./constants";
import { scheduleData as defaultScheduleData } from "./scheduleData";
import { normalizeSchedule } from "./scheduleUtils";
import {
  buildScheduleSignature,
  fetchRemoteSchedule
} from "./remoteSchedule";
import { refreshWidget } from "./widgetBridge";
import { GROUP_TYPES, getGroupType } from "./groupUtils";
import { getPeriodRangeMinutes } from "./timeUtils";
import { MAX_PERIOD, MAX_WEEK, MIN_PERIOD } from "./constants";

const STORAGE_VERSION = 1;
const WIDGET_SNAPSHOT_VERSION = 2;
const WIDGET_SNAPSHOT_FORCE_REWRITE_DELAY_MS = 2000;
const SCHEDULE_SOURCES = {
  BUILTIN: "builtin",
  REMOTE: "remote",
  MANUAL: "manual"
};
const createDefaultSchedule = () => normalizeSchedule(defaultScheduleData);
const DEFAULT_SCHEDULE_SIGNATURE = buildScheduleSignature(
  createDefaultSchedule()
);

const buildCourseEligibleGroups = (courseGroup) => {
  const type = getGroupType(courseGroup);
  if (type === GROUP_TYPES.ALL) return null;
  if (type === GROUP_TYPES.G6ALL) return [GROUP_TYPES.G6A, GROUP_TYPES.G6B];
  if (type === GROUP_TYPES.G7ALL) return [GROUP_TYPES.G7C, GROUP_TYPES.G7D];
  return [type];
};

const buildWidgetPeriodRanges = () => {
  const ranges = {};
  for (let period = MIN_PERIOD; period <= MAX_PERIOD; period += 1) {
    const range = getPeriodRangeMinutes(period);
    if (!range) continue;
    ranges[String(period)] = { startMin: range.startMin, endMin: range.endMin };
  }
  return ranges;
};

const buildWidgetScheduleSnapshot = (scheduleData) => {
  const list = Array.isArray(scheduleData) ? scheduleData : [];
  return list.map((day) => ({
    ...day,
    periods: Array.isArray(day?.periods)
      ? day.periods.map((periodEntry) => ({
          ...periodEntry,
          courses: Array.isArray(periodEntry?.courses)
            ? periodEntry.courses.map((course) => ({
                ...course,
                eligibleGroups: buildCourseEligibleGroups(course?.group)
              }))
            : []
        }))
      : []
  }));
};

const isWidgetSnapshotV2 = (raw) => {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return Number(parsed?.version) === WIDGET_SNAPSHOT_VERSION;
  } catch {
    return false;
  }
};

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

const parseSkippedRemoteUpdate = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const signature =
      typeof parsed.signature === "string" ? parsed.signature : "";
    if (!signature) return null;
    return {
      signature,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      sourceUrl: typeof parsed.sourceUrl === "string" ? parsed.sourceUrl : "",
      skippedAt: Number(parsed.skippedAt) || 0
    };
  } catch (error) {
    console.warn("已跳过远端课表记录解析失败:", error);
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
  const [scheduleData, setScheduleData] = useState(() => createDefaultSchedule());
  const [isScheduleLoaded, setIsScheduleLoaded] = useState(false);
  const [scheduleSource, setScheduleSource] = useState(SCHEDULE_SOURCES.BUILTIN);
  const [hasManualScheduleChanges, setHasManualScheduleChanges] = useState(false);
  const [remoteSnapshot, setRemoteSnapshot] = useState(null);
  const [remoteMeta, setRemoteMeta] = useState(null);
  const [skippedRemoteUpdate, setSkippedRemoteUpdate] = useState(null);
  const [isCheckingRemote, setIsCheckingRemote] = useState(false);
  const [pendingRemoteSnapshot, setPendingRemoteSnapshot] = useState(null);
  const [pendingRemoteSourceUrl, setPendingRemoteSourceUrl] = useState("");
  const [builtInUpdateNotice, setBuiltInUpdateNotice] = useState("");
  const hasUserChangedScheduleRef = useRef(false);
  const remoteCheckLockRef = useRef(false);

  const clearPendingRemoteUpdate = useCallback(() => {
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
  }, []);

  const clearRemoteScheduleStorage = useCallback(async () => {
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT),
      storage.removeItem(STORAGE_KEYS.REMOTE_SCHEDULE_META)
    ]);
  }, []);

  const persistSkippedRemoteUpdate = useCallback(async (record) => {
    setSkippedRemoteUpdate(record);
    await storage.setItem(
      STORAGE_KEYS.REMOTE_SKIPPED_UPDATE,
      JSON.stringify(record)
    );
  }, []);

  const clearSkippedRemoteUpdate = useCallback(async () => {
    setSkippedRemoteUpdate(null);
    await storage.removeItem(STORAGE_KEYS.REMOTE_SKIPPED_UPDATE);
  }, []);

  const clearRemoteScheduleState = useCallback(() => {
    setRemoteSnapshot(null);
    setRemoteMeta(null);
    clearPendingRemoteUpdate();
  }, [clearPendingRemoteUpdate]);

  const applyBuiltInSchedule = useCallback(() => {
    setScheduleSource(SCHEDULE_SOURCES.BUILTIN);
    setHasManualScheduleChanges(false);
    setScheduleData(createDefaultSchedule());
  }, []);

  const applyScheduleState = useCallback((nextSchedule, nextSource) => {
    setScheduleSource(nextSource);
    setHasManualScheduleChanges(nextSource === SCHEDULE_SOURCES.MANUAL);
    setScheduleData(nextSchedule);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSchedule = async () => {
      const [
        saved,
        remoteRaw,
        remoteMetaRaw,
        skippedRemoteUpdateRaw,
        storedDefaultVersionRaw,
        storedDefaultSignatureRaw
      ] = await Promise.all([
        storage.getItem(STORAGE_KEYS.CUSTOM_SCHEDULE),
        storage.getItem(STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT),
        storage.getItem(STORAGE_KEYS.REMOTE_SCHEDULE_META),
        storage.getItem(STORAGE_KEYS.REMOTE_SKIPPED_UPDATE),
        storage.getItem(STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION),
        storage.getItem(STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE)
      ]);

      if (cancelled) return;

      const parsedRemoteSnapshot = parseRemoteSnapshot(remoteRaw);
      const parsedRemoteMeta = parseRemoteMeta(remoteMetaRaw);
      const parsedSkippedRemoteUpdate =
        parseSkippedRemoteUpdate(skippedRemoteUpdateRaw);
      setRemoteSnapshot(parsedRemoteSnapshot);
      setRemoteMeta(parsedRemoteMeta);
      setSkippedRemoteUpdate(parsedSkippedRemoteUpdate);

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

      const shouldAutoUseBuiltInSchedule =
        defaultChanged &&
        !hasSavedCustom &&
        parsedRemoteSnapshot &&
        parsedRemoteSnapshot.signature !== DEFAULT_SCHEDULE_SIGNATURE;

      if (shouldAutoUseBuiltInSchedule) {
        await Promise.all([
          clearRemoteScheduleStorage(),
          clearSkippedRemoteUpdate()
        ]);
        if (cancelled) return;
        clearRemoteScheduleState();
        applyBuiltInSchedule();
        setBuiltInUpdateNotice("已自动更新为新版内置课表");
        setIsScheduleLoaded(true);
        return;
      }

      if (hasSavedCustom) {
        applyScheduleState(parsedCustomSchedule, SCHEDULE_SOURCES.MANUAL);
      } else if (parsedRemoteSnapshot) {
        applyScheduleState(parsedRemoteSnapshot.schedule, SCHEDULE_SOURCES.REMOTE);
      } else {
        applyBuiltInSchedule();
      }
      if (!cancelled) {
        setIsScheduleLoaded(true);
      }
    };

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [
    applyBuiltInSchedule,
    applyScheduleState,
    clearRemoteScheduleState,
    clearRemoteScheduleStorage,
    clearSkippedRemoteUpdate
  ]);

  const updateScheduleData = useCallback((updater) => {
    hasUserChangedScheduleRef.current = true;
    setBuiltInUpdateNotice("");
    setScheduleSource(SCHEDULE_SOURCES.MANUAL);
    setHasManualScheduleChanges(true);
    setScheduleData((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const applyRemoteSchedule = useCallback((snapshot) => {
    if (!snapshot?.schedule) return;
    hasUserChangedScheduleRef.current = true;
    setBuiltInUpdateNotice("");
    applyScheduleState(snapshot.schedule, SCHEDULE_SOURCES.REMOTE);
  }, [applyScheduleState]);

  const confirmRemoteUpdate = useCallback(async () => {
    if (!pendingRemoteSnapshot) return null;
    applyRemoteSchedule(pendingRemoteSnapshot);
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    await clearSkippedRemoteUpdate();
    return {
      status: "updated",
      message: "课表已更新",
      updatedAt: pendingRemoteSnapshot.updatedAt,
      sourceUrl: pendingRemoteSourceUrl
    };
  }, [
    applyRemoteSchedule,
    clearSkippedRemoteUpdate,
    pendingRemoteSnapshot,
    pendingRemoteSourceUrl
  ]);

  const cancelRemoteUpdate = useCallback(async () => {
    if (!pendingRemoteSnapshot) return null;
    const updatedAt = pendingRemoteSnapshot.updatedAt;
    const signature =
      pendingRemoteSnapshot.signature ||
      buildScheduleSignature(pendingRemoteSnapshot.schedule);
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    await persistSkippedRemoteUpdate({
      signature,
      updatedAt,
      sourceUrl: pendingRemoteSourceUrl,
      skippedAt: Date.now()
    });
    return {
      status: "skipped",
      message: "已暂不更新",
      updatedAt,
      sourceUrl: pendingRemoteSourceUrl
    };
  }, [
    pendingRemoteSnapshot,
    pendingRemoteSourceUrl,
    persistSkippedRemoteUpdate
  ]);

  useEffect(() => {
    if (!isScheduleLoaded) return;
    if (!hasManualScheduleChanges) {
      storage.removeItem(STORAGE_KEYS.CUSTOM_SCHEDULE);
      return;
    }
    const payload = JSON.stringify({
      version: STORAGE_VERSION,
      schedule: scheduleData
    });
    storage.setItem(STORAGE_KEYS.CUSTOM_SCHEDULE, payload);
  }, [scheduleData, hasManualScheduleChanges, isScheduleLoaded]);

  const persistWidgetSnapshot = useCallback(async () => {
    try {
      const payload = JSON.stringify({
        version: WIDGET_SNAPSHOT_VERSION,
        updatedAt: Date.now(),
        maxWeek: MAX_WEEK,
        periodRanges: buildWidgetPeriodRanges(),
        schedule: buildWidgetScheduleSnapshot(scheduleData)
      });
      await storage.setItem(STORAGE_KEYS.WIDGET_SCHEDULE_SNAPSHOT, payload);
      await refreshWidget();
    } catch (error) {
      console.warn("小组件课表快照写入失败:", error);
    }
  }, [scheduleData]);

  // Persist a normalized schedule snapshot for the Android home-screen widget.
  // Stored in Capacitor Preferences (SharedPreferences) so native code can read it.
  useEffect(() => {
    if (!isScheduleLoaded) return;
    void persistWidgetSnapshot();
  }, [isScheduleLoaded, persistWidgetSnapshot]);

  // Best-effort migration: if the user has an older snapshot version, rewrite once after a short delay
  // to cover first-launch races where schedule loads before preferences are ready.
  useEffect(() => {
    if (!isScheduleLoaded) return;

    let cancelled = false;
    let timeoutId = null;

    const scheduleRewriteIfNeeded = async () => {
      try {
        const raw = await storage.getItem(STORAGE_KEYS.WIDGET_SCHEDULE_SNAPSHOT);
        if (cancelled) return;
        if (isWidgetSnapshotV2(raw)) return;
        await persistWidgetSnapshot();
      } catch (error) {
        console.warn("小组件课表快照补写失败:", error);
      }
    };

    timeoutId = setTimeout(scheduleRewriteIfNeeded, WIDGET_SNAPSHOT_FORCE_REWRITE_DELAY_MS);

    return () => {
      cancelled = true;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
    };
  }, [isScheduleLoaded, persistWidgetSnapshot]);

  const resetSchedule = async () => {
    hasUserChangedScheduleRef.current = true;
    setBuiltInUpdateNotice("");
    applyBuiltInSchedule();
    clearRemoteScheduleState();
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.CUSTOM_SCHEDULE),
      clearRemoteScheduleStorage(),
      clearSkippedRemoteUpdate()
    ]);
    return {
      status: "reset",
      message: "课表已恢复为内置数据"
    };
  };

  const softUpdateSchedule = useCallback(async ({ trigger = "auto" } = {}) => {
    if (pendingRemoteSnapshot) {
      return {
        status: "update-available",
        message: "检测到远端课表更新",
        updatedAt: pendingRemoteSnapshot.updatedAt,
        sourceUrl: pendingRemoteSourceUrl
      };
    }

    if (remoteCheckLockRef.current || isCheckingRemote) {
      return { status: "busy", message: "正在检查更新，请稍后" };
    }

    remoteCheckLockRef.current = true;
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
        clearPendingRemoteUpdate();
        return {
          status: "latest",
          message: "已是最新课表",
          updatedAt: nextSnapshot.updatedAt,
          sourceUrl: checkedSourceUrl
        };
      }

      if (
        skippedRemoteUpdate?.signature &&
        skippedRemoteUpdate.signature === remoteSignature &&
        trigger !== "manual"
      ) {
        clearPendingRemoteUpdate();
        return {
          status: "skipped-by-user",
          message: "该远端课表已暂不提醒，等待内容变化后再提示",
          updatedAt: nextSnapshot.updatedAt,
          sourceUrl: checkedSourceUrl
        };
      }

      if (
        skippedRemoteUpdate?.signature &&
        skippedRemoteUpdate.signature !== remoteSignature
      ) {
        await clearSkippedRemoteUpdate();
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
      remoteCheckLockRef.current = false;
      setIsCheckingRemote(false);
    }
  }, [
    clearPendingRemoteUpdate,
    clearSkippedRemoteUpdate,
    isCheckingRemote,
    pendingRemoteSnapshot,
    pendingRemoteSourceUrl,
    remoteMeta,
    remoteSnapshot,
    scheduleData,
    skippedRemoteUpdate
  ]);

  return {
    scheduleData,
    setScheduleData: updateScheduleData,
    scheduleSource,
    hasManualScheduleChanges,
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
