import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { GITHUB_RELEASES_URL } from "../../config/constants.js";

export const openUpdateTarget = async ({ apkUrl = "", releaseUrl = "" } = {}) => {
  const isAndroid =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  const target = isAndroid && apkUrl ? apkUrl : releaseUrl || GITHUB_RELEASES_URL;
  if (!target) return false;

  try {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: target });
      return true;
    }
  } catch (error) {
    console.error("打开更新页面失败:", error);
  }

  if (typeof window === "undefined") return false;
  window.open(target, "_blank", "noopener,noreferrer");
  return true;
};
