package com.oldsun.classschedule;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.text.TextUtils;

import org.json.JSONObject;

public class WidgetRescheduleReceiver extends BroadcastReceiver {
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_WIDGET_SCHEDULE_SNAPSHOT = "widgetScheduleSnapshot";
    private static final int REQUIRED_WIDGET_SNAPSHOT_VERSION = 3;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context != null) {
            clearLegacyWidgetSnapshotIfNeeded(context);
        }
        TodayCoursesWidgetProvider.requestRefresh(context);
    }

    private void clearLegacyWidgetSnapshotIfNeeded(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY_WIDGET_SCHEDULE_SNAPSHOT, null);
        if (TextUtils.isEmpty(raw)) return;
        try {
            JSONObject obj = new JSONObject(raw);
            int version = obj.optInt("version", 0);
            if (version >= REQUIRED_WIDGET_SNAPSHOT_VERSION) return;
        } catch (Exception ignore) {
            // Treat invalid JSON as legacy.
        }
        prefs.edit().remove(KEY_WIDGET_SCHEDULE_SNAPSHOT).apply();
    }
}
