package com.oldsun.classschedule;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;

import java.util.List;

public class TodayCoursesWidgetProvider extends AppWidgetProvider {
    public static void requestRefresh(Context context) {
        if (context == null) return;

        long nowMillis = System.currentTimeMillis();
        WidgetTodayCoursesCalculator.Result result =
            WidgetTodayCoursesCalculator.compute(context, nowMillis);

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, TodayCoursesWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        if (ids == null || ids.length == 0) {
            WidgetUpdateScheduler.cancel(context);
            return;
        }

        for (int id : ids) {
            updateAppWidget(context, manager, id, result, nowMillis);
        }

        // On Android 12+ we use RemoteCollectionItems which doesn't need this notify call.
        // For legacy RemoteViewsService-based lists, keep behavior without referencing deprecated APIs.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            WidgetAppWidgetManagerCompat.notifyAppWidgetViewDataChanged(
                manager,
                ids,
                R.id.widget_list
            );
        }
        WidgetUpdateScheduler.scheduleNext(
            context,
            nowMillis,
            result != null ? result.nextRefreshAtMillis : 0L
        );
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        requestRefresh(context);
    }

    @Override
    public void onEnabled(Context context) {
        requestRefresh(context);
    }

    @Override
    public void onDisabled(Context context) {
        WidgetUpdateScheduler.cancel(context);
    }

    private static void updateAppWidget(
        Context context,
        AppWidgetManager appWidgetManager,
        int appWidgetId,
        WidgetTodayCoursesCalculator.Result result,
        long nowMillis
    ) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_today_courses);

        if (result != null) {
            views.setTextViewText(R.id.widget_empty, result.emptyMessage);
        }

        final List<WidgetTodayCoursesCalculator.Item> items =
            result != null && result.items != null ? result.items : java.util.Collections.emptyList();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            TodayCoursesWidgetApi31.bindCollectionItems(context, views, items, nowMillis);
        } else {
            Intent serviceIntent = new Intent(context, TodayCoursesWidgetService.class);
            serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
            WidgetRemoteAdapterCompat.setRemoteAdapter(views, R.id.widget_list, serviceIntent);
        }
        views.setEmptyView(R.id.widget_list, R.id.widget_empty);

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent launchPendingIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, launchPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
