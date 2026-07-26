import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

// 系统栏几何由原生布局负责，这里只同步外观和可见性。
export const useStatusBar = (theme) => {
  useEffect(() => {
    const setupStatusBar = async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        await StatusBar.setStyle({ style: Style.Light });
        if (Capacitor.getPlatform() === "android") {
          const bgColor = theme === "minimal" ? "#FFFFFF" : "#FFFBFE";
          await StatusBar.setBackgroundColor({ color: bgColor });
        }
        await StatusBar.show();
      } catch (error) {
        console.error("状态栏配置失败:", error);
      }
    };

    setupStatusBar();
  }, [theme]);
};
