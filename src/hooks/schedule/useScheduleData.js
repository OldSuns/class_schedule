import { useCallback, useEffect, useRef, useState } from "react";
import * as storage from "../../../storage";
import {
  DEFAULT_SCHEDULE_VERSION,
  SCHEDULE_RESET_KEYS,
  STORAGE_KEYS
} from "../../config/constants";
import { scheduleData as defaultScheduleData } from "../../data/scheduleData";
import {
  buildWidgetScheduleSnapshot,
  normalizeSchedulePayload
} from "../../utils/schedule/eventUtils";
import {
  buildScheduleSignature,
  fetchRemoteSchedule,
  isScheduleNewer
} from "../../services/schedule/remoteSchedule";
import { refreshWidget } from "../../services/platform/widgetBridge";

const WIDGET_SNAPSHOT_VERSION = 4;
const WIDGET_SNAPSHOT_FORCE_REWRITE_DELAY_MS = 2000;
const SCHEDULE_SOURCES = {
  BUILTIN: "builtin",
  REMOTE: "remote",
  MANUAL: "manual"
};

const isValidScheduleSource = (value) => Object.values(SCHEDULE_SOURCES).includes(value);
const createDefaultSchedule = () => normalizeSchedulePayload(defaultScheduleData);
const DEFAULT_SCHEDULE_SIGNATURE = buildScheduleSignature(createDefaultSchedule());

export const resolveStoredSchedule = ({ custom, remote, source, builtIn }) => {
  const remoteIsNewer = Boolean(
    remote && isScheduleNewer(remote.payload, builtIn)
  );
  const shouldClearRemoteState =
    Boolean(remote && !remoteIsNewer) ||
    (source === SCHEDULE_SOURCES.REMOTE && !remote);

  if (custom) {
    return {
      payload: custom,
      source: SCHEDULE_SOURCES.MANUAL,
      shouldClearRemoteState
    };
  }
  const useRemote = source === SCHEDULE_SOURCES.REMOTE && remoteIsNewer;
  return {
    payload: useRemote ? remote.payload : builtIn,
    source: useRemote ? SCHEDULE_SOURCES.REMOTE : SCHEDULE_SOURCES.BUILTIN,
    shouldClearRemoteState
  };
};

const parseJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const parseStoredSchedule = (raw) => {
  const parsed = parseJson(raw);
  if (!parsed) return null;
  try {
    return normalizeSchedulePayload(parsed);
  } catch {
    return null;
  }
};

const parseRemoteSnapshot = (raw) => {
  const parsed = parseJson(raw);
  if (!parsed?.payload) return null;
  try {
    const payload = normalizeSchedulePayload(parsed.payload);
    return {
      payload,
      signature: buildScheduleSignature(payload)
    };
  } catch {
    return null;
  }
};

const parseRemoteMeta = (raw) => {
  const parsed = parseJson(raw);
  if (!parsed || typeof parsed !== "object") return null;
  return {
    etag: typeof parsed.etag === "string" ? parsed.etag : "",
    lastModified: typeof parsed.lastModified === "string" ? parsed.lastModified : "",
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    signature: typeof parsed.signature === "string" ? parsed.signature : "",
    sourceUrl: typeof parsed.sourceUrl === "string" ? parsed.sourceUrl : ""
  };
};

const parseSkippedRemoteUpdate = (raw) => {
  const parsed = parseJson(raw);
  if (!parsed || typeof parsed.signature !== "string" || !parsed.signature) return null;
  return {
    signature: parsed.signature,
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    sourceUrl: typeof parsed.sourceUrl === "string" ? parsed.sourceUrl : "",
    skippedAt: Number(parsed.skippedAt) || 0
  };
};

const hasCurrentWidgetSnapshotVersion = (raw) => {
  const parsed = parseJson(raw);
  return Number(parsed?.version) === WIDGET_SNAPSHOT_VERSION;
};

export const useScheduleData = () => {
  const [scheduleData, setScheduleDataState] = useState(createDefaultSchedule);
  const [isScheduleLoaded, setIsScheduleLoaded] = useState(false);
  const [scheduleSource, setScheduleSource] = useState(SCHEDULE_SOURCES.BUILTIN);
  const [hasManualScheduleChanges, setHasManualScheduleChanges] = useState(false);
  const [remoteSnapshot, setRemoteSnapshot] = useState(null);
  const [remoteMeta, setRemoteMeta] = useState(null);
  const [skippedRemoteUpdate, setSkippedRemoteUpdate] = useState(null);
  const [pendingRemoteSnapshot, setPendingRemoteSnapshot] = useState(null);
  const [pendingRemoteSourceUrl, setPendingRemoteSourceUrl] = useState("");
  const [isCheckingRemote, setIsCheckingRemote] = useState(false);
  const [builtInUpdateNotice, setBuiltInUpdateNotice] = useState("");
  const remoteCheckLockRef = useRef(false);

  const applySchedule = useCallback((payload, source) => {
    const normalized = normalizeSchedulePayload(payload);
    setScheduleDataState(normalized);
    setScheduleSource(source);
    setHasManualScheduleChanges(source === SCHEDULE_SOURCES.MANUAL);
    void storage.setItem(STORAGE_KEYS.SCHEDULE_SOURCE, source);
  }, []);

  const applyBuiltInSchedule = useCallback(() => {
    applySchedule(createDefaultSchedule(), SCHEDULE_SOURCES.BUILTIN);
  }, [applySchedule]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [customRaw, remoteRaw, metaRaw, skippedRaw, versionRaw, signatureRaw, sourceRaw] =
        await Promise.all([
          storage.getItem(STORAGE_KEYS.CUSTOM_SCHEDULE),
          storage.getItem(STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT),
          storage.getItem(STORAGE_KEYS.REMOTE_SCHEDULE_META),
          storage.getItem(STORAGE_KEYS.REMOTE_SKIPPED_UPDATE),
          storage.getItem(STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION),
          storage.getItem(STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE),
          storage.getItem(STORAGE_KEYS.SCHEDULE_SOURCE)
        ]);
      if (cancelled) return;

      const custom = parseStoredSchedule(customRaw);
      const remote = parseRemoteSnapshot(remoteRaw);
      const meta = parseRemoteMeta(metaRaw);
      const skipped = parseSkippedRemoteUpdate(skippedRaw);
      const source = isValidScheduleSource(sourceRaw) ? sourceRaw : SCHEDULE_SOURCES.BUILTIN;
      const builtIn = createDefaultSchedule();
      const resolved = resolveStoredSchedule({ custom, remote, source, builtIn });
      const defaultChanged =
        versionRaw != null &&
        (versionRaw !== String(DEFAULT_SCHEDULE_VERSION) ||
          signatureRaw !== DEFAULT_SCHEDULE_SIGNATURE);

      setRemoteSnapshot(resolved.shouldClearRemoteState ? null : remote);
      setRemoteMeta(resolved.shouldClearRemoteState ? null : meta);
      setSkippedRemoteUpdate(resolved.shouldClearRemoteState ? null : skipped);

      const writes = [
        storage.setItem(STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION, String(DEFAULT_SCHEDULE_VERSION)),
        storage.setItem(STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE, DEFAULT_SCHEDULE_SIGNATURE)
      ];
      if (resolved.shouldClearRemoteState) {
        writes.push(
          storage.removeItem(STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT),
          storage.removeItem(STORAGE_KEYS.REMOTE_SCHEDULE_META),
          storage.removeItem(STORAGE_KEYS.REMOTE_SKIPPED_UPDATE)
        );
      }
      await Promise.all(writes);
      if (cancelled) return;

      applySchedule(resolved.payload, resolved.source);
      if (custom && defaultChanged) {
        setBuiltInUpdateNotice("内置课表已更新，可在设置中重置");
      }
      setIsScheduleLoaded(true);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [applySchedule]);

  const setScheduleData = useCallback((updater) => {
    setBuiltInUpdateNotice("");
    setScheduleDataState((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return normalizeSchedulePayload(next);
    });
    setScheduleSource(SCHEDULE_SOURCES.MANUAL);
    setHasManualScheduleChanges(true);
    void storage.setItem(STORAGE_KEYS.SCHEDULE_SOURCE, SCHEDULE_SOURCES.MANUAL);
  }, []);

  useEffect(() => {
    if (!isScheduleLoaded) return;
    if (!hasManualScheduleChanges) {
      void storage.removeItem(STORAGE_KEYS.CUSTOM_SCHEDULE);
      return;
    }
    void storage.setItem(STORAGE_KEYS.CUSTOM_SCHEDULE, JSON.stringify(scheduleData));
  }, [hasManualScheduleChanges, isScheduleLoaded, scheduleData]);

  const persistWidgetSnapshot = useCallback(async () => {
    try {
      await storage.setItem(
        STORAGE_KEYS.WIDGET_SCHEDULE_SNAPSHOT,
        JSON.stringify(buildWidgetScheduleSnapshot(scheduleData))
      );
      await refreshWidget();
    } catch (error) {
      console.warn("小组件课表快照写入失败:", error);
    }
  }, [scheduleData]);

  useEffect(() => {
    if (isScheduleLoaded) void persistWidgetSnapshot();
  }, [isScheduleLoaded, persistWidgetSnapshot]);

  useEffect(() => {
    if (!isScheduleLoaded) return undefined;
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      const raw = await storage.getItem(STORAGE_KEYS.WIDGET_SCHEDULE_SNAPSHOT);
      if (!cancelled && !hasCurrentWidgetSnapshotVersion(raw)) {
        await persistWidgetSnapshot();
      }
    }, WIDGET_SNAPSHOT_FORCE_REWRITE_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isScheduleLoaded, persistWidgetSnapshot]);

  const resetSchedule = useCallback(async () => {
    setRemoteSnapshot(null);
    setRemoteMeta(null);
    setSkippedRemoteUpdate(null);
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    setBuiltInUpdateNotice("");
    await Promise.all(SCHEDULE_RESET_KEYS.map((key) => storage.removeItem(key)));
    applyBuiltInSchedule();
    await storage.setItem(STORAGE_KEYS.SCHEDULE_SOURCE, SCHEDULE_SOURCES.BUILTIN);
    return { status: "reset", message: "课表已恢复为内置数据" };
  }, [applyBuiltInSchedule]);

  const persistSkipped = useCallback(async (record) => {
    setSkippedRemoteUpdate(record);
    await storage.setItem(STORAGE_KEYS.REMOTE_SKIPPED_UPDATE, JSON.stringify(record));
  }, []);

  const clearSkipped = useCallback(async () => {
    setSkippedRemoteUpdate(null);
    await storage.removeItem(STORAGE_KEYS.REMOTE_SKIPPED_UPDATE);
  }, []);

  const confirmRemoteUpdate = useCallback(async () => {
    if (!pendingRemoteSnapshot) return null;
    applySchedule(pendingRemoteSnapshot, SCHEDULE_SOURCES.REMOTE);
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    await clearSkipped();
    return {
      status: "updated",
      message: "课表已更新",
      updatedAt: pendingRemoteSnapshot.updatedAt,
      sourceUrl: pendingRemoteSourceUrl
    };
  }, [applySchedule, clearSkipped, pendingRemoteSnapshot, pendingRemoteSourceUrl]);

  const cancelRemoteUpdate = useCallback(async () => {
    if (!pendingRemoteSnapshot) return null;
    const record = {
      signature: buildScheduleSignature(pendingRemoteSnapshot),
      updatedAt: pendingRemoteSnapshot.updatedAt,
      sourceUrl: pendingRemoteSourceUrl,
      skippedAt: Date.now()
    };
    setPendingRemoteSnapshot(null);
    setPendingRemoteSourceUrl("");
    await persistSkipped(record);
    return { status: "skipped", message: "已暂不更新", ...record };
  }, [pendingRemoteSnapshot, pendingRemoteSourceUrl, persistSkipped]);

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
      if (result.status === "error") return result;

      let nextPayload = remoteSnapshot?.payload ?? null;
      let nextMeta = remoteMeta;
      if (result.status === "updated") {
        nextPayload = result.snapshot;
        nextMeta = result.meta;
        const stored = { payload: nextPayload, signature: result.meta.signature };
        await Promise.all([
          storage.setItem(STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT, JSON.stringify(stored)),
          storage.setItem(STORAGE_KEYS.REMOTE_SCHEDULE_META, JSON.stringify(nextMeta))
        ]);
        setRemoteSnapshot(stored);
        setRemoteMeta(nextMeta);
      }
      if (!nextPayload) return { status: "error", message: "未获取到远端课表" };

      const remoteSignature = buildScheduleSignature(nextPayload);
      if (remoteSignature === buildScheduleSignature(scheduleData)) {
        setPendingRemoteSnapshot(null);
        return {
          status: "latest",
          message: "已是最新课表",
          updatedAt: nextPayload.updatedAt,
          sourceUrl: result.sourceUrl || nextMeta?.sourceUrl || ""
        };
      }
      if (
        trigger !== "manual" &&
        skippedRemoteUpdate?.signature === remoteSignature
      ) {
        return { status: "skipped-by-user", message: "该远端课表已暂不提醒" };
      }
      if (skippedRemoteUpdate?.signature && skippedRemoteUpdate.signature !== remoteSignature) {
        await clearSkipped();
      }
      const sourceUrl = result.sourceUrl || nextMeta?.sourceUrl || "";
      setPendingRemoteSnapshot(nextPayload);
      setPendingRemoteSourceUrl(sourceUrl);
      return {
        status: "update-available",
        message: "检测到远端课表更新",
        updatedAt: nextPayload.updatedAt,
        sourceUrl
      };
    } catch (error) {
      console.error("课表软更新失败:", error);
      return { status: "error", message: "课表更新失败，请稍后重试" };
    } finally {
      remoteCheckLockRef.current = false;
      setIsCheckingRemote(false);
    }
  }, [
    clearSkipped,
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
    setScheduleData,
    scheduleSource,
    hasManualScheduleChanges,
    isScheduleLoaded,
    resetSchedule,
    softUpdateSchedule,
    confirmRemoteUpdate,
    cancelRemoteUpdate,
    pendingRemoteSnapshot,
    isCheckingRemote,
    remoteUpdatedAt: remoteSnapshot?.payload?.updatedAt || remoteMeta?.updatedAt || "",
    builtInUpdateNotice
  };
};
