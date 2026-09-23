package com.oldsun.classschedule;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class NotificationRestoreReceiver extends BroadcastReceiver {
    private static final String TAG = "NotificationRestore";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String SNAPSHOT_KEY = "notificationPlanSnapshot";
    private static final String DEFAULT_CHANNEL_ID = "course-reminders";
    private static final String DEFAULT_CHANNEL_NAME = "课程提醒";
    private static final String DEFAULT_CHANNEL_DESC = "上课前提醒";
    private static final long RECOVER_PAST_DELAY_MS = 15_000L;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return;
        }

        AlarmClockStorage storage = new AlarmClockStorage(context);
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        // Cancel all existing alarms first
        List<Integer> existingIds = storage.getAllPendingIds();
        for (int id : existingIds) {
            cancelAlarm(context, alarmManager, id);
        }
        storage.clear();

        // Read notifications from the JS-side snapshot
        JSONArray items = readNotificationsFromSnapshot(context);
        if (items == null || items.length() == 0) {
            return;
        }

        long now = System.currentTimeMillis();

        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null) continue;

            int id = item.optInt("id", Integer.MIN_VALUE);
            if (id == Integer.MIN_VALUE) continue;

            long at = item.optLong("at", -1L);
            if (at <= 0) continue;
            if (at <= now) {
                at = now + RECOVER_PAST_DELAY_MS;
            }

            String channelId = item.optString("channelId", DEFAULT_CHANNEL_ID);
            ensureNotificationChannel(context, channelId);

            String title = item.optString("title", "上课提醒");
            String body = item.optString("body", "");
            String signature = item.optString("signature", "");

            storage.save(id, title, body, channelId, at, signature);
            AlarmClockSchedulerPlugin.scheduleAlarmClock(context, alarmManager, id, at);
        }
    }

    private JSONArray readNotificationsFromSnapshot(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String rawSnapshot = prefs.getString(SNAPSHOT_KEY, null);
        if (rawSnapshot == null || rawSnapshot.trim().isEmpty()) {
            return null;
        }

        try {
            JSONObject snapshot = new JSONObject(rawSnapshot);
            return snapshot.optJSONArray("notifications");
        } catch (JSONException error) {
            Log.w(TAG, "Failed to parse notification snapshot", error);
            return null;
        }
    }

    private void cancelAlarm(Context context, AlarmManager alarmManager, int id) {
        Intent intent = new Intent(context, AlarmClockReceiver.class);
        intent.putExtra(AlarmClockReceiver.EXTRA_NOTIFICATION_ID, id);
        int flags = android.app.PendingIntent.FLAG_NO_CREATE | android.app.PendingIntent.FLAG_IMMUTABLE;
        android.app.PendingIntent pi = android.app.PendingIntent.getBroadcast(context, id, intent, flags);
        if (pi != null) {
            alarmManager.cancel(pi);
            pi.cancel();
        }
    }

    private void ensureNotificationChannel(Context context, String channelId) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;

        NotificationChannel channel = new NotificationChannel(
            channelId,
            DEFAULT_CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription(DEFAULT_CHANNEL_DESC);
        manager.createNotificationChannel(channel);
    }
}
