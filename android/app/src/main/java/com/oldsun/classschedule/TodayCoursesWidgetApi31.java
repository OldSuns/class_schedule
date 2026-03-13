package com.oldsun.classschedule;

import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import androidx.annotation.RequiresApi;

import java.util.Collections;
import java.util.List;

@RequiresApi(31)
final class TodayCoursesWidgetApi31 {
    private TodayCoursesWidgetApi31() {}

    private static final int COUNTDOWN_THRESHOLD_MINUTES = 30;

    static void bindCollectionItems(
        Context context,
        RemoteViews views,
        List<WidgetTodayCoursesCalculator.Item> items,
        long nowMillis
    ) {
        if (context == null || views == null) return;
        final List<WidgetTodayCoursesCalculator.Item> safeItems =
            items != null ? items : Collections.emptyList();

        RemoteViews.RemoteCollectionItems.Builder builder =
            new RemoteViews.RemoteCollectionItems.Builder()
                .setHasStableIds(true)
                .setViewTypeCount(1);

        for (int index = 0; index < safeItems.size(); index += 1) {
            WidgetTodayCoursesCalculator.Item item = safeItems.get(index);
            RemoteViews row =
                new RemoteViews(context.getPackageName(), R.layout.widget_today_courses_item);
            row.setTextViewText(R.id.widget_item_title, item.title);
            row.setTextViewText(R.id.widget_item_subtitle, item.subtitle);

            String chipText = "";
            boolean showChip = false;

            if (index == 0) {
                if (item.ongoing) {
                    chipText = context.getString(R.string.widget_today_courses_status_ongoing);
                    showChip = true;
                } else {
                    int minutes = minutesCeil(item.startMillis - nowMillis);
                    if (minutes <= COUNTDOWN_THRESHOLD_MINUTES) {
                        chipText =
                            context.getString(
                                R.string.widget_today_courses_countdown_until_start,
                                minutes
                            );
                        showChip = true;
                    }
                }
            }

            row.setViewVisibility(R.id.widget_item_status, showChip ? View.VISIBLE : View.GONE);
            if (showChip) {
                row.setTextViewText(R.id.widget_item_status, chipText);
            }

            long stableId = item.startMillis != 0L ? item.startMillis : index;
            builder.addItem(stableId, row);
        }

        views.setRemoteAdapter(R.id.widget_list, builder.build());
    }

    private static int minutesCeil(long diffMillis) {
        if (diffMillis <= 0L) return 0;
        return (int) ((diffMillis + 60_000L - 1L) / 60_000L);
    }
}
