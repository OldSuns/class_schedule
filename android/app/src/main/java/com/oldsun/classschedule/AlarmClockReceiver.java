package com.oldsun.classschedule;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import org.json.JSONObject;

public class AlarmClockReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmClockReceiver";
    public static final String EXTRA_NOTIFICATION_ID = "alarm_notification_id";
    private static final String DEFAULT_CHANNEL_ID = "course-reminders";
    private static final String DEFAULT_CHANNEL_NAME = "课程提醒";
    private static final String DEFAULT_CHANNEL_DESC = "上课前提醒";

    @Override
    public void onReceive(Context context, Intent intent) {
        int id = intent.getIntExtra(EXTRA_NOTIFICATION_ID, Integer.MIN_VALUE);
        if (id == Integer.MIN_VALUE) {
            Log.w(TAG, "No valid notification id in intent");
            return;
        }

        AlarmClockStorage storage = new AlarmClockStorage(context);
        JSONObject data = storage.load(id);
        if (data == null) {
            Log.w(TAG, "No stored data for notification id=" + id);
            return;
        }

        String title = data.optString("title", "上课提醒");
        String body = data.optString("body", "");
        String channelId = data.optString("channelId", DEFAULT_CHANNEL_ID);

        ensureChannel(context, channelId);

        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent contentIntent = null;
        if (launchIntent != null) {
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            contentIntent = PendingIntent.getActivity(
                context, id, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
        }

        Notification notification = new NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setContentIntent(contentIntent)
            .build();

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(id, notification);
        }

        storage.remove(id);
    }

    private void ensureChannel(Context context, String channelId) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;
        if (manager.getNotificationChannel(channelId) != null) return;

        NotificationChannel channel = new NotificationChannel(
            channelId, DEFAULT_CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription(DEFAULT_CHANNEL_DESC);
        manager.createNotificationChannel(channel);
    }
}
