import { Capacitor, registerPlugin } from "@capacitor/core";

const WidgetBridge = registerPlugin("WidgetBridge");

export const refreshWidget = async () => {
  if (!Capacitor.isNativePlatform()) return;
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await WidgetBridge.refresh();
  } catch (error) {
    // Best-effort: widget refresh is optional and should never break app flows.
    console.warn("Widget refresh failed:", error);
  }
};

