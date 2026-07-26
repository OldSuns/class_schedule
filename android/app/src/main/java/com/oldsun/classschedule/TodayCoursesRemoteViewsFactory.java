package com.oldsun.classschedule;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class TodayCoursesRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
    private final Context context;
    private final int appWidgetId;
    private List<WidgetTodayCoursesCalculator.Item> items = Collections.emptyList();
    private long lastNowMillis = 0L;
    private static final int COUNTDOWN_THRESHOLD_MINUTES = 30;

    TodayCoursesRemoteViewsFactory(Context context, Intent intent) {
        this.context = context;
        this.appWidgetId = intent != null
            ? intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
            : AppWidgetManager.INVALID_APPWIDGET_ID;
    }

    @Override
    public void onCreate() {
        // no-op
    }

    @Override
    public void onDataSetChanged() {
        long nowMillis = System.currentTimeMillis();
        lastNowMillis = nowMillis;
        WidgetTodayCoursesCalculator.Result result =
            WidgetTodayCoursesCalculator.compute(context, nowMillis);
        if (result != null && result.items != null) {
            this.items = new ArrayList<>(result.items);
        } else {
            this.items = Collections.emptyList();
        }
    }

    @Override
    public void onDestroy() {
        items = Collections.emptyList();
    }

    @Override
    public int getCount() {
        return items != null ? items.size() : 0;
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (items == null || position < 0 || position >= items.size()) {
            return null;
        }

        WidgetTodayCoursesCalculator.Item item = items.get(position);
        RemoteViews rv = new RemoteViews(context.getPackageName(), R.layout.widget_today_courses_item);
        rv.setTextViewText(R.id.widget_item_title, item.title);
        rv.setTextViewText(R.id.widget_item_subtitle, item.subtitle);

        String chipText = "";
        boolean showChip = false;

        if (position == 0) {
            if (item.ongoing) {
                chipText = context.getString(R.string.widget_today_courses_status_ongoing);
                showChip = true;
            } else {
                int minutes = minutesCeil(item.startMillis - lastNowMillis);
                if (minutes <= COUNTDOWN_THRESHOLD_MINUTES) {
                    chipText =
                        context.getString(R.string.widget_today_courses_countdown_until_start, minutes);
                    showChip = true;
                }
            }
        }

        rv.setViewVisibility(R.id.widget_item_status, showChip ? View.VISIBLE : View.GONE);
        if (showChip) {
            rv.setTextViewText(R.id.widget_item_status, chipText);
        }

        // Optional click handling: the widget root already opens the app.
        return rv;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        if (items == null || position < 0 || position >= items.size()) return position;
        WidgetTodayCoursesCalculator.Item item = items.get(position);
        long base = item.startMillis;
        return base != 0 ? base : position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }

    private static int minutesCeil(long diffMillis) {
        if (diffMillis <= 0L) return 0;
        return (int) ((diffMillis + 60_000L - 1L) / 60_000L);
    }
}
