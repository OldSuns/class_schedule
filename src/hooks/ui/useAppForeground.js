import { useCallback, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

/**
 * 前台恢复监听：原生端监听 appStateChange，Web 端监听 visibilitychange。
 * 回到前台时调用 onForeground，并返回一个 isForeground() 查询函数。
 */
export const useAppForeground = (onForeground) => {
  const callbackRef = useRef(onForeground);
  const isActiveRef = useRef(true);

  useEffect(() => {
    callbackRef.current = onForeground;
  }, [onForeground]);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    let listenerHandle = null;

    if (isNative) {
      CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        isActiveRef.current = isActive;
        if (isActive) {
          callbackRef.current?.();
        }
      }).then((handle) => {
        listenerHandle = handle;
      });
      return () => {
        listenerHandle?.remove();
      };
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        callbackRef.current?.();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return useCallback(() => {
    if (Capacitor.isNativePlatform()) {
      return isActiveRef.current;
    }
    return document.visibilityState === "visible";
  }, []);
};
