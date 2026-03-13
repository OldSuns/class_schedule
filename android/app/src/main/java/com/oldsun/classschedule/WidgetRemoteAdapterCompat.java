package com.oldsun.classschedule;

import android.content.Intent;
import android.widget.RemoteViews;

import java.lang.reflect.Method;

/**
 * Compatibility helper to avoid direct calls to deprecated RemoteViews collection APIs.
 */
final class WidgetRemoteAdapterCompat {
    private WidgetRemoteAdapterCompat() {}

    static void setRemoteAdapter(RemoteViews views, int viewId, Intent intent) {
        if (views == null || intent == null) return;
        try {
            Method method = RemoteViews.class.getMethod("setRemoteAdapter", int.class, Intent.class);
            method.invoke(views, viewId, intent);
        } catch (Exception error) {
            // Best-effort: if binding fails, the widget will show the empty view.
        }
    }
}

