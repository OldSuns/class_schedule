import { useCallback, useEffect, useState } from "react";
import * as storage from "../storage";
import { STORAGE_KEYS } from "./constants";
import { scheduleData as defaultScheduleData } from "./scheduleData";
import { normalizeSchedule } from "./scheduleUtils";

const STORAGE_VERSION = 1;

export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useState(() =>
    normalizeSchedule(defaultScheduleData)
  );
  const [isScheduleLoaded, setIsScheduleLoaded] = useState(false);
  const [hasCustomSchedule, setHasCustomSchedule] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      const saved = await storage.getItem(STORAGE_KEYS.CUSTOM_SCHEDULE);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.version === STORAGE_VERSION && Array.isArray(parsed.schedule)) {
            setScheduleData(normalizeSchedule(parsed.schedule));
            setHasCustomSchedule(true);
          } else if (Array.isArray(parsed)) {
            setScheduleData(normalizeSchedule(parsed));
            setHasCustomSchedule(true);
          } else {
            setHasCustomSchedule(false);
          }
        } catch (error) {
          console.warn("自定义课表解析失败，已回退默认数据", error);
          setHasCustomSchedule(false);
        }
      } else {
        setHasCustomSchedule(false);
      }
      setIsScheduleLoaded(true);
    };

    loadSchedule();
  }, []);

  const updateScheduleData = useCallback((updater) => {
    setHasCustomSchedule(true);
    setScheduleData((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

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
    setHasCustomSchedule(false);
    setScheduleData(normalizeSchedule(defaultScheduleData));
  };

  return {
    scheduleData,
    setScheduleData: updateScheduleData,
    isScheduleLoaded,
    resetSchedule
  };
};
