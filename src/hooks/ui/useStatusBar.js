import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

// 仅原生端启用透明叠加的状态栏，并把安卓状态栏高度写入 CSS 变量
export const useStatusBar = (theme) => {
  useEffect(() => {
    const setupStatusBar = async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setOverlaysWebView({ overlay: true });
        if (Capacitor.getPlatform() === "android") {
          const bgColor = theme === "minimal" ? "#FFFFFF" : "#FFFBFE";
          await StatusBar.setBackgroundColor({ color: bgColor });
          const info = await StatusBar.getInfo();
          const height = Number(info?.height);
          document.documentElement.style.setProperty(
            "--android-statusbar",
            Number.isFinite(height) && height > 0 ? `${height}px` : "0px"
          );
        }
        await StatusBar.show();
      } catch (error) {
        console.error("状态栏配置失败:", error);
      }
    };

    setupStatusBar();
  }, [theme]);
};
