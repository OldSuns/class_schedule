package com.oldsun.classschedule;

import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

import org.json.JSONArray;
import org.json.JSONObject;

final class WidgetTodayCoursesCalculator {
    private WidgetTodayCoursesCalculator() {}

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_USER_GROUP = "userGroup";
    private static final String KEY_WIDGET_SCHEDULE_SNAPSHOT = "summerWidgetScheduleSnapshot";
    private static final int SNAPSHOT_VERSION = 4;
    private static final int MAX_WEEK = 8;
    private static final long DAY_MS = 24L * 60L * 60L * 1000L;
    private static final long MINUTE_MS = 60L * 1000L;
    private static final long RETRY_DELAY_MS = 60L * 1000L;
    private static final long SCHEDULE_DELAY_MS = 1_000L;
    private static final long COUNTDOWN_THRESHOLD_MS = 30L * MINUTE_MS;
    private static final String[] DAY_NAMES = {
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
    };

    static final class Item {
        final String title;
        final String subtitle;
        final boolean ongoing;
        final long startMillis;
        final long endMillis;
        final long stableId;

        Item(
            String title,
            String subtitle,
            boolean ongoing,
            long startMillis,
            long endMillis,
            long stableId
        ) {
            this.title = title != null ? title : "";
            this.subtitle = subtitle != null ? subtitle : "";
            this.ongoing = ongoing;
            this.startMillis = startMillis;
            this.endMillis = endMillis;
            this.stableId = stableId;
        }
    }

    static final class Result {
        final List<Item> items;
        final String emptyMessage;
        final long nextRefreshAtMillis;
        final String title;

        Result(List<Item> items, String emptyMessage, long nextRefreshAtMillis, String title) {
            this.items = items != null ? items : Collections.<Item>emptyList();
            this.emptyMessage = emptyMessage != null ? emptyMessage : "";
            this.nextRefreshAtMillis = nextRefreshAtMillis;
            this.title = title != null ? title : "";
        }
    }

    private enum DateStatus {
        OK,
        INVALID_START_DATE,
        BEFORE_START,
        WEEKEND,
        OUT_OF_RANGE
    }

    private static final class DateInfo {
        final int week;
        final String dayName;

        DateInfo(int week, String dayName) {
            this.week = week;
            this.dayName = dayName;
        }
    }

    private static final class DateInfoResult {
        final DateStatus status;
        final DateInfo info;

        DateInfoResult(DateStatus status, DateInfo info) {
            this.status = status;
            this.info = info;
        }
    }

    static Result compute(Context context, long nowMillis) {
        if (context == null) {
            return new Result(Collections.<Item>emptyList(), "", nowMillis + SCHEDULE_DELAY_MS, "");
        }

        String todayTitle = context.getString(R.string.widget_today_courses_title);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String rawSnapshot = prefs.getString(KEY_WIDGET_SCHEDULE_SNAPSHOT, null);
        String userGroup = normalizeUserGroup(prefs.getString(KEY_USER_GROUP, "1组"));
        if (TextUtils.isEmpty(rawSnapshot)) {
            return new Result(
                Collections.<Item>emptyList(),
                context.getString(R.string.widget_today_courses_empty_need_open_app),
                nowMillis + RETRY_DELAY_MS,
                todayTitle
            );
        }

        JSONObject root;
        JSONArray events;
        String semesterStartDate;
        try {
            root = new JSONObject(rawSnapshot);
            if (root.optInt("version", 0) != SNAPSHOT_VERSION) throw new IllegalArgumentException();
            semesterStartDate = root.optString("semesterStartDate", "");
            events = root.optJSONArray("events");
            if (TextUtils.isEmpty(semesterStartDate) || events == null) {
                throw new IllegalArgumentException();
            }
        } catch (Exception error) {
            return new Result(
                Collections.<Item>emptyList(),
                context.getString(R.string.widget_today_courses_empty_need_open_app),
                nowMillis + RETRY_DELAY_MS,
                todayTitle
            );
        }

        DateInfoResult today = calculateDateInfo(semesterStartDate, nowMillis);
        String emptyMessage = messageForDateStatus(context, today.status);
        if (today.status == DateStatus.OK && today.info != null) {
            List<Item> items = buildItems(events, today.info, nowMillis, nowMillis, userGroup);
            if (!items.isEmpty()) {
                return new Result(items, emptyMessage, computeNextRefresh(items, nowMillis), todayTitle);
            }
        }

        Calendar tomorrow = Calendar.getInstance();
        tomorrow.setTimeInMillis(nowMillis);
        truncateToMidnight(tomorrow);
        tomorrow.add(Calendar.DATE, 1);
        long tomorrowMillis = tomorrow.getTimeInMillis();
        DateInfoResult nextDay = calculateDateInfo(semesterStartDate, tomorrowMillis);
        if (nextDay.status == DateStatus.OK && nextDay.info != null) {
            List<Item> items = buildItems(events, nextDay.info, tomorrowMillis, nowMillis, userGroup);
            if (!items.isEmpty()) {
                return new Result(
                    items,
                    emptyMessage,
                    Math.min(computeNextRefresh(items, nowMillis), getNextDailyRefreshMillis(nowMillis)),
                    context.getString(R.string.widget_tomorrow_courses_title)
                );
            }
        }

        return new Result(
            Collections.<Item>emptyList(),
            emptyMessage,
            getNextDailyRefreshMillis(nowMillis),
            todayTitle
        );
    }

    private static List<Item> buildItems(
        JSONArray events,
        DateInfo info,
        long dayMillis,
        long nowMillis,
        String userGroup
    ) {
        List<Item> items = new ArrayList<>();
        Calendar day = Calendar.getInstance();
        day.setTimeInMillis(dayMillis);
        truncateToMidnight(day);
        long dayStart = day.getTimeInMillis();

        for (int index = 0; index < events.length(); index += 1) {
            JSONObject event = events.optJSONObject(index);
            if (event == null) continue;
            if (!info.dayName.equals(event.optString("day", ""))) continue;
            if (!eventOccursInWeek(event.optJSONArray("weeks"), info.week)) continue;
            if (!eventVisibleForGroup(event, userGroup)) continue;

            int startMin = event.optInt("startMin", -1);
            int endMin = event.optInt("endMin", -1);
            if (startMin < 0 || endMin <= startMin || endMin > 24 * 60) continue;
            long startMillis = dayStart + startMin * MINUTE_MS;
            long endMillis = dayStart + endMin * MINUTE_MS;
            if (endMillis <= nowMillis) continue;

            String name = event.optString("name", "").trim();
            if (TextUtils.isEmpty(name)) continue;
            String location = event.optString("location", "").trim();
            String subtitle = formatMinutes(startMin) + "-" + formatMinutes(endMin);
            if (!TextUtils.isEmpty(location)) subtitle += " · " + location;
            boolean ongoing = startMillis <= nowMillis && nowMillis < endMillis;
            items.add(
                new Item(
                    name,
                    subtitle,
                    ongoing,
                    startMillis,
                    endMillis,
                    stableHash(event.optString("id", name + startMin))
                )
            );
        }

        Collections.sort(items, (left, right) -> {
            if (left.startMillis != right.startMillis) {
                return left.startMillis < right.startMillis ? -1 : 1;
            }
            if (left.endMillis != right.endMillis) {
                return left.endMillis < right.endMillis ? -1 : 1;
            }
            return left.title.compareTo(right.title);
        });
        return items;
    }

    private static boolean eventOccursInWeek(JSONArray weeks, int week) {
        if (weeks == null) return false;
        for (int index = 0; index < weeks.length(); index += 1) {
            if (weeks.optInt(index, -1) == week) return true;
        }
        return false;
    }

    private static boolean eventVisibleForGroup(JSONObject event, String userGroup) {
        if (!event.has("group") || event.isNull("group")) return true;
        return userGroup.equals(event.optString("group", ""));
    }

    private static String normalizeUserGroup(String value) {
        if (value != null && value.matches("[1-7]组")) return value;
        return "1组";
    }

    private static long stableHash(String value) {
        long hash = 2166136261L;
        String safe = value != null ? value : "";
        for (int index = 0; index < safe.length(); index += 1) {
            hash ^= safe.charAt(index);
            hash = (hash * 16777619L) & 0xffffffffL;
        }
        return hash != 0L ? hash : 1L;
    }

    private static long computeNextRefresh(List<Item> items, long nowMillis) {
        long nextTransition = Long.MAX_VALUE;
        long nextStart = Long.MAX_VALUE;
        for (Item item : items) {
            if (item.ongoing && item.endMillis > nowMillis) {
                nextTransition = Math.min(nextTransition, item.endMillis);
            } else if (item.startMillis > nowMillis) {
                nextTransition = Math.min(nextTransition, item.startMillis);
                nextStart = Math.min(nextStart, item.startMillis);
            }
        }
        if (nextTransition == Long.MAX_VALUE) return getNextDailyRefreshMillis(nowMillis);
        if (nextStart != Long.MAX_VALUE && nextStart - nowMillis <= COUNTDOWN_THRESHOLD_MS) {
            long nextMinute = ((nowMillis / MINUTE_MS) + 1L) * MINUTE_MS + SCHEDULE_DELAY_MS;
            return Math.min(nextMinute, nextTransition + SCHEDULE_DELAY_MS);
        }
        return nextTransition + SCHEDULE_DELAY_MS;
    }

    private static DateInfoResult calculateDateInfo(String startDate, long targetMillis) {
        Calendar start = parseLocalDate(startDate);
        if (start == null) return new DateInfoResult(DateStatus.INVALID_START_DATE, null);
        Calendar target = Calendar.getInstance();
        target.setTimeInMillis(targetMillis);
        truncateToMidnight(target);
        long diffDays = (long) Math.floor(
            (double) (target.getTimeInMillis() - start.getTimeInMillis()) / (double) DAY_MS
        );
        if (diffDays < 0) return new DateInfoResult(DateStatus.BEFORE_START, null);
        int week = (int) (diffDays / 7L) + 1;
        if (week > MAX_WEEK) return new DateInfoResult(DateStatus.OUT_OF_RANGE, null);
        int dayOfWeek = target.get(Calendar.DAY_OF_WEEK);
        if (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY) {
            return new DateInfoResult(DateStatus.WEEKEND, null);
        }
        int index = dayOfWeek - Calendar.MONDAY;
        return new DateInfoResult(DateStatus.OK, new DateInfo(week, DAY_NAMES[index]));
    }

    private static Calendar parseLocalDate(String value) {
        if (TextUtils.isEmpty(value)) return null;
        String[] parts = value.split("-");
        if (parts.length != 3) return null;
        try {
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            int day = Integer.parseInt(parts[2]);
            Calendar calendar = Calendar.getInstance();
            calendar.setLenient(false);
            calendar.set(year, month - 1, day, 0, 0, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            calendar.getTimeInMillis();
            return calendar;
        } catch (Exception error) {
            return null;
        }
    }

    private static void truncateToMidnight(Calendar calendar) {
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
    }

    private static String messageForDateStatus(Context context, DateStatus status) {
        if (status == DateStatus.BEFORE_START) {
            return context.getString(R.string.widget_today_courses_empty_before_start);
        }
        if (status == DateStatus.WEEKEND) {
            return context.getString(R.string.widget_today_courses_empty_weekend);
        }
        if (status == DateStatus.OUT_OF_RANGE) {
            return context.getString(R.string.widget_today_courses_empty_out_of_range);
        }
        if (status == DateStatus.INVALID_START_DATE) {
            return context.getString(R.string.widget_today_courses_empty_need_start_date);
        }
        return context.getString(R.string.widget_today_courses_empty_default);
    }

    private static String formatMinutes(int minutes) {
        return String.format(
            Locale.getDefault(),
            "%02d:%02d",
            Math.max(0, minutes) / 60,
            Math.max(0, minutes) % 60
        );
    }

    private static long getNextDailyRefreshMillis(long nowMillis) {
        Calendar next = Calendar.getInstance();
        next.setTimeInMillis(nowMillis);
        next.set(Calendar.HOUR_OF_DAY, 0);
        next.set(Calendar.MINUTE, 5);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (next.getTimeInMillis() <= nowMillis) next.add(Calendar.DATE, 1);
        return next.getTimeInMillis();
    }
}
