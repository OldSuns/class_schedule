package com.oldsun.classschedule;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationManagerCompat;
import com.capacitorjs.plugins.localnotifications.LocalNotification;
import com.capacitorjs.plugins.localnotifications.LocalNotificationManager;
import com.capacitorjs.plugins.localnotifications.NotificationStorage;
import com.capacitorjs.plugins.localnotifications.TimedNotificationPublisher;
import com.getcapacitor.CapConfig;
import com.getcapacitor.JSObject;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TimeZone;
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

        List<LocalNotification> notifications = readNotificationsFromSnapshot(context);
        if (notifications.isEmpty()) {
            return;
        }

        NotificationStorage storage = new NotificationStorage(context);
        CapConfig config = CapConfig.loadDefault(context);
        LocalNotificationManager manager = new LocalNotificationManager(storage, null, context, config);

        try {
            pruneStaleScheduledNotifications(context, storage, notifications);
            manager.schedule(null, notifications);
            storage.appendNotifications(notifications);
        } catch (Exception error) {
            Log.w(TAG, "Failed to restore local notifications", error);
        }
    }

    private List<LocalNotification> readNotificationsFromSnapshot(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String rawSnapshot = prefs.getString(SNAPSHOT_KEY, null);
        ArrayList<LocalNotification> notifications = new ArrayList<>();
        if (rawSnapshot == null || rawSnapshot.trim().isEmpty()) {
            return notifications;
        }

        long now = System.currentTimeMillis();
        try {
            JSONObject snapshot = new JSONObject(rawSnapshot);
            JSONArray items = snapshot.optJSONArray("notifications");
            if (items == null) {
                return notifications;
            }

            for (int index = 0; index < items.length(); index += 1) {
                JSONObject item = items.optJSONObject(index);
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

                JSObject schedule = new JSObject();
                schedule.put("at", formatUtc(at));
                schedule.put("allowWhileIdle", true);

                JSObject extra = new JSObject();
                extra.put("planSignature", item.optString("signature", ""));

                JSObject notificationJson = new JSObject();
                notificationJson.put("id", id);
                notificationJson.put("title", item.optString("title", "上课提醒"));
                notificationJson.put("body", item.optString("body", ""));
                notificationJson.put("channelId", channelId);
                notificationJson.put("schedule", schedule);
                notificationJson.put("extra", extra);

                try {
                    notifications.add(LocalNotification.buildNotificationFromJSObject(notificationJson));
                } catch (ParseException parseError) {
                    Log.w(TAG, "Skip invalid notification payload", parseError);
                }
            }
        } catch (JSONException error) {
            Log.w(TAG, "Failed to parse notification snapshot", error);
        }

        return notifications;
    }

    private void pruneStaleScheduledNotifications(
        Context context,
        NotificationStorage storage,
        List<LocalNotification> desiredNotifications
    ) {
        Set<String> desiredIds = new HashSet<>();
        for (LocalNotification notification : desiredNotifications) {
            if (notification.getId() != null) {
                desiredIds.add(notification.getId().toString());
            }
        }

        List<String> existingIds = storage.getSavedNotificationIds();
        for (String id : existingIds) {
            if (desiredIds.contains(id)) continue;

            storage.deleteNotification(id);
            Integer notificationId = parseNotificationId(id);
            if (notificationId == null) continue;

            cancelTimer(context, notificationId);
            NotificationManagerCompat.from(context).cancel(notificationId);
        }
    }

    private void cancelTimer(Context context, int notificationId) {
        Intent intent = new Intent(context, TimedNotificationPublisher.class);
        int flags = PendingIntent.FLAG_NO_CREATE;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags = flags | PendingIntent.FLAG_MUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, notificationId, intent, flags);
        if (pendingIntent == null) return;

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            alarmManager.cancel(pendingIntent);
        }
        pendingIntent.cancel();
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

    private String formatUtc(long timestamp) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        return sdf.format(new Date(timestamp));
    }

    private Integer parseNotificationId(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException error) {
            return null;
        }
    }
}
