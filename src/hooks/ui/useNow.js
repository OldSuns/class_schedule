import { useCallback, useEffect, useState } from "react";
import { useAppForeground } from "./useAppForeground.js";

/**
 * 当前时间（分钟级）：每分钟刷新一次，回到前台时立即刷新，
 * 避免后台暂停导致进度条等展示停滞。
 */
export const useNow = () => {
  const [now, setNow] = useState(() => new Date());

  const refreshNow = useCallback(() => {
    setNow(new Date());
  }, []);

  useAppForeground(refreshNow);

  useEffect(() => {
    const timer = setInterval(refreshNow, 60000);
    return () => clearInterval(timer);
  }, [refreshNow]);

  return now;
};
