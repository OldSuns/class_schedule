package com.oldsun.classschedule;

import android.appwidget.AppWidgetManager;

import java.lang.reflect.Method;

/**
 * Compatibility helper to avoid direct calls to deprecated AppWidgetManager APIs.
 */
final class WidgetAppWidgetManagerCompat {
    private WidgetAppWidgetManagerCompat() {}

    static void notifyAppWidgetViewDataChanged(
        AppWidgetManager manager,
        int[] appWidgetIds,
        int viewId
    ) {
        if (manager == null || appWidgetIds == null || appWidgetIds.length == 0) return;
        try {
            Method method =
                AppWidgetManager.class.getMethod(
                    "notifyAppWidgetViewDataChanged",
                    int[].class,
                    int.class
                );
            method.invoke(manager, appWidgetIds, viewId);
        } catch (Exception ignore) {
            // Best-effort: if notify fails, the list may update on the next full widget update.
        }
    }
}

