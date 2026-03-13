package com.oldsun.classschedule;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

final class WidgetUpdateScheduler {
    private WidgetUpdateScheduler() {}

    private static final int REQUEST_CODE = 61010;
    private static final long MIN_DELAY_MS = 1_000L;
    private static final long WINDOW_LENGTH_MS = 2L * 60L * 1000L;

    static void scheduleNext(Context context) {
        scheduleNext(context, System.currentTimeMillis(), 0L);
    }

    static void scheduleNext(Context context, long nowMillis, long triggerAtMillis) {
        if (context == null) return;

        long now = nowMillis > 0L ? nowMillis : System.currentTimeMillis();
        long triggerAt = triggerAtMillis;

        if (triggerAt <= 0L) {
            WidgetTodayCoursesCalculator.Result result = WidgetTodayCoursesCalculator.compute(context, now);
            triggerAt = (result != null ? result.nextRefreshAtMillis : 0L);
        }

        if (triggerAt <= 0L || triggerAt <= now) {
            triggerAt = now + MIN_DELAY_MS;
        }

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        PendingIntent pi = buildPendingIntent(context);
        alarmManager.cancel(pi);

        boolean canExact = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            canExact = alarmManager.canScheduleExactAlarms();
        }

        if (canExact) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
            alarmManager.setWindow(AlarmManager.RTC_WAKEUP, triggerAt, WINDOW_LENGTH_MS, pi);
        }
    }

    static void cancel(Context context) {
        if (context == null) return;
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;
        PendingIntent pi = buildPendingIntent(context);
        alarmManager.cancel(pi);
    }

    private static PendingIntent buildPendingIntent(Context context) {
        Intent intent = new Intent(context, WidgetAlarmReceiver.class);
        return PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
