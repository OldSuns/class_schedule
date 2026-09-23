import { useEffect, useRef } from "react";
import { STORAGE_KEYS } from "../../config/constants.js";
import { getItem, setItem } from "../../../storage.js";
import {
  hasElapsed,
  isRemoteCheckSuccessful
} from "../../utils/schedule/dateUtils.js";
import { useAppForeground } from "../ui/useAppForeground.js";

const CHECK_INTERVAL_MS = 8 * 60 * 60 * 1000;
const FOREGROUND_CHECK_INTERVAL_MS = 10 * 60 * 1000;
const ERROR_RETRY_INTERVAL_MS = 3 * 60 * 1000;

const shouldCheck = async (reason) => {
  const now = Date.now();
  const [lastCheckRaw, lastForegroundCheckRaw, lastErrorRaw, skippedUpdateRaw] =
    await Promise.all([
      getItem(STORAGE_KEYS.REMOTE_LAST_CHECK_AT),
      getItem(STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT),
      getItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT),
      getItem(STORAGE_KEYS.REMOTE_SKIPPED_UPDATE)
    ]);

  const lastCheck = Number(lastCheckRaw);
  const lastForegroundCheck = Number(lastForegroundCheckRaw);
  const lastError = Number(lastErrorRaw);
  let skippedAt = 0;
  if (skippedUpdateRaw) {
    try {
      skippedAt = Number(JSON.parse(skippedUpdateRaw)?.skippedAt) || 0;
    } catch {
      skippedAt = 0;
    }
  }

  if (!hasElapsed(lastError, ERROR_RETRY_INTERVAL_MS, now)) {
    return false;
  }

  if (reason === "startup") {
    if (!skippedUpdateRaw) return true;
    return hasElapsed(skippedAt || lastCheck, CHECK_INTERVAL_MS, now);
  }

  if (reason === "foreground") {
    return hasElapsed(lastForegroundCheck, FOREGROUND_CHECK_INTERVAL_MS, now);
  }

  return hasElapsed(lastCheck, CHECK_INTERVAL_MS, now);
};

const persistCheckState = async (result, reason) => {
  const status = result?.status || "";
  const now = String(Date.now());

  if (isRemoteCheckSuccessful(status)) {
    const writes = [
      setItem(STORAGE_KEYS.REMOTE_LAST_CHECK_AT, now),
      setItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT, "")
    ];
    if (reason === "foreground") {
      writes.push(setItem(STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT, now));
    }
    await Promise.all(writes);
    return;
  }

  if (status === "error") {
    await setItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT, now);
  }
};

/**
 * 远端课表自动检查：启动时、每 8 小时、回到前台时（10 分钟节流）各触发一次；
 * 检查到更新时调用 onUpdateAvailable。仅前台可见时执行。
 */
export const useRemoteScheduleAutoCheck = ({
  enabled,
  softUpdateSchedule,
  hasPendingRemoteSnapshot,
  onUpdateAvailable
}) => {
  const softUpdateRef = useRef(softUpdateSchedule);
  const hasPendingRef = useRef(hasPendingRemoteSnapshot);
  const onUpdateAvailableRef = useRef(onUpdateAvailable);
  const checkRef = useRef(null);

  useEffect(() => {
    softUpdateRef.current = softUpdateSchedule;
  }, [softUpdateSchedule]);
  useEffect(() => {
    hasPendingRef.current = hasPendingRemoteSnapshot;
  }, [hasPendingRemoteSnapshot]);
  useEffect(() => {
    onUpdateAvailableRef.current = onUpdateAvailable;
  }, [onUpdateAvailable]);

  const isForeground = useAppForeground(() => {
    checkRef.current?.("foreground");
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let inFlight = false;

    const checkRemoteSchedule = async (reason = "interval") => {
      if (cancelled || inFlight) return;
      if (!isForeground()) return;
      if (hasPendingRef.current) return;

      inFlight = true;
      try {
        const ok = await shouldCheck(reason);
        if (!ok) return;
        const result = await softUpdateRef.current({ trigger: "auto" });
        await persistCheckState(result, reason);
        if (!cancelled && result?.status === "update-available") {
          onUpdateAvailableRef.current?.(result);
        }
      } finally {
        inFlight = false;
      }
    };

    checkRef.current = checkRemoteSchedule;
    checkRemoteSchedule("startup");
    const timer = setInterval(
      () => checkRemoteSchedule("interval"),
      CHECK_INTERVAL_MS
    );

    return () => {
      cancelled = true;
      checkRef.current = null;
      clearInterval(timer);
    };
  }, [enabled, isForeground]);
};
