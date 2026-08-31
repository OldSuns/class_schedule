package com.oldsun.classschedule;

import android.app.AlarmManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import java.util.List;

final class SummerScheduleMigration {
    private static final String TAG = "SummerScheduleMigration";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String SOURCE_VERSION_KEY = "summerScheduleDefaultVersion";
    private static final String SOURCE_KEY = "summerScheduleSource";
    private static final String MIGRATION_VERSION_KEY = "summerScheduleMigrationVersion";
    private static final String MIGRATION_VERSION = "1";
    private static final String SUMMER_THEME_KEY = "summerTheme";
    private static final String THEME_KEY = "theme";

    private static final String[] RESET_KEYS = new String[] {
        "semesterStartDate",
        "notificationsLastScheduledAt",
        "notificationsLastReconciledAt",
        "notificationPlanSnapshot",
        "userGroup",
        "selectedElectives",
        "displayMode",
        "widgetScheduleSnapshot",
        "customSchedule",
        "scheduleSource",
        "remoteScheduleSnapshot",
        "remoteScheduleMeta",
        "remoteSkippedUpdate",
        "defaultScheduleVersion",
        "defaultScheduleSignature",
        "remoteScheduleLastCheckAt",
        "remoteScheduleLastForegroundCheckAt",
        "remoteScheduleLastErrorAt",
        "userExams",
        "summerNotificationsLastScheduledAt",
        "summerNotificationsLastReconciledAt",
        "summerNotificationPlanSnapshot",
        "summerWidgetScheduleSnapshot",
        "summerScheduleCustom",
        "summerScheduleSource",
        "summerScheduleRemoteSnapshot",
        "summerScheduleRemoteMeta",
        "summerScheduleRemoteSkippedUpdate",
        "summerScheduleDefaultSignature",
        "summerScheduleRemoteLastCheckAt",
        "summerScheduleRemoteLastForegroundCheckAt",
        "summerScheduleRemoteLastErrorAt",
        SOURCE_VERSION_KEY,
        SUMMER_THEME_KEY,
        THEME_KEY
    };

    private SummerScheduleMigration() {}

    static boolean ensureMigrated(Context context) {
        if (context == null) return false;

        SharedPreferences preferences =
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (MIGRATION_VERSION.equals(preferences.getString(MIGRATION_VERSION_KEY, null))) {
            return true;
        }
        if (!preferences.contains(SOURCE_VERSION_KEY) && !preferences.contains(SOURCE_KEY)) {
            return true;
        }

        String summerTheme = preferences.getString(SUMMER_THEME_KEY, null);
        cancelScheduledNotifications(context);

        SharedPreferences.Editor editor = preferences.edit();
        for (String key : RESET_KEYS) {
            editor.remove(key);
        }
        if ("m3".equals(summerTheme) || "minimal".equals(summerTheme)) {
            editor.putString(THEME_KEY, summerTheme);
        }
        editor.putString(MIGRATION_VERSION_KEY, MIGRATION_VERSION);

        boolean migrated = editor.commit();
        if (!migrated) {
            Log.e(TAG, "Failed to persist summer schedule migration");
        }
        return migrated;
    }

    private static void cancelScheduledNotifications(Context context) {
        AlarmClockStorage storage = new AlarmClockStorage(context);
        AlarmManager alarmManager =
            (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        List<Integer> ids = storage.getAllPendingIds();
        if (alarmManager != null) {
            for (int id : ids) {
                AlarmClockSchedulerPlugin.cancelAlarm(context, alarmManager, id);
            }
        }
        storage.clear();
    }
}
