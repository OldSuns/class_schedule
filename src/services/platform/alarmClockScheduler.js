import { Capacitor, registerPlugin } from "@capacitor/core";

const AlarmClockScheduler = registerPlugin("AlarmClockScheduler");

export const scheduleNotifications = async (notifications) => {
  if (!Capacitor.isNativePlatform()) return { scheduled: 0 };
  return AlarmClockScheduler.schedule({ notifications });
};

export const cancelNotifications = async (ids) => {
  if (!Capacitor.isNativePlatform()) return { canceled: 0 };
  return AlarmClockScheduler.cancel({ ids });
};

export const cancelAllNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return { canceled: 0 };
  return AlarmClockScheduler.cancelAll();
};

export const getPendingNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return { notifications: [] };
  return AlarmClockScheduler.getPending();
};
