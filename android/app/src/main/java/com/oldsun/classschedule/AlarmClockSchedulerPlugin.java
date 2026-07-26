package com.oldsun.classschedule;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "AlarmClockScheduler")
public class AlarmClockSchedulerPlugin extends Plugin {
    private static final String TAG = "AlarmClockScheduler";

    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray notifications = call.getArray("notifications");
        if (notifications == null) {
            call.reject("notifications array is required");
            return;
        }

        Context context = getContext();
        AlarmClockStorage storage = new AlarmClockStorage(context);
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        int scheduled = 0;

        try {
            for (int i = 0; i < notifications.length(); i++) {
                JSONObject item = notifications.getJSONObject(i);
                int id = item.getInt("id");
                String title = item.optString("title", "上课提醒");
                String body = item.optString("body", "");
                String channelId = item.optString("channelId", "course-reminders");
                long triggerAt = item.getLong("at");
                String extra = item.optString("extra", "");

                storage.save(id, title, body, channelId, triggerAt, extra);
                scheduleAlarmClock(context, alarmManager, id, triggerAt);
                scheduled++;
            }
        } catch (JSONException e) {
            call.reject("Invalid notification data", e);
            return;
        }

        JSObject result = new JSObject();
        result.put("scheduled", scheduled);
        call.resolve(result);
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        JSArray ids = call.getArray("ids");
        if (ids == null) {
            call.reject("ids array is required");
            return;
        }

        Context context = getContext();
        AlarmClockStorage storage = new AlarmClockStorage(context);
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        int canceled = 0;

        try {
            for (int i = 0; i < ids.length(); i++) {
                int id = ids.getInt(i);
                cancelAlarm(context, alarmManager, id);
                storage.remove(id);
                canceled++;
            }
        } catch (JSONException e) {
            call.reject("Invalid id data", e);
            return;
        }

        JSObject result = new JSObject();
        result.put("canceled", canceled);
        call.resolve(result);
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        Context context = getContext();
        AlarmClockStorage storage = new AlarmClockStorage(context);
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        List<Integer> ids = storage.getAllPendingIds();
        for (int id : ids) {
            cancelAlarm(context, alarmManager, id);
        }
        storage.clear();

        JSObject result = new JSObject();
        result.put("canceled", ids.size());
        call.resolve(result);
    }

    @PluginMethod
    public void getPending(PluginCall call) {
        AlarmClockStorage storage = new AlarmClockStorage(getContext());
        List<Integer> ids = storage.getAllPendingIds();

        JSArray arr = new JSArray();
        for (int id : ids) {
            JSONObject data = storage.load(id);
            JSObject item = new JSObject();
            item.put("id", id);
            if (data != null) {
                item.put("extra", data.optString("extra", ""));
            }
            arr.put(item);
        }

        JSObject result = new JSObject();
        result.put("notifications", arr);
        call.resolve(result);
    }

    public static void scheduleAlarmClock(Context context, AlarmManager alarmManager, int id, long triggerAt) {
        Intent intent = new Intent(context, AlarmClockReceiver.class);
        intent.putExtra(AlarmClockReceiver.EXTRA_NOTIFICATION_ID, id);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, intent, flags);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager.canScheduleExactAlarms()) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
        }
    }

    private void cancelAlarm(Context context, AlarmManager alarmManager, int id) {
        Intent intent = new Intent(context, AlarmClockReceiver.class);
        intent.putExtra(AlarmClockReceiver.EXTRA_NOTIFICATION_ID, id);

        int flags = PendingIntent.FLAG_NO_CREATE;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, intent, flags);
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
        }
    }
}
