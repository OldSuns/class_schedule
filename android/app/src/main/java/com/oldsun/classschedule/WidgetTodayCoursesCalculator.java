package com.oldsun.classschedule;

import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

final class WidgetTodayCoursesCalculator {
    private WidgetTodayCoursesCalculator() {}

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final long NEED_SYNC_RETRY_DELAY_MS = 60L * 1000L;

    private static final String KEY_SEMESTER_START_DATE = "semesterStartDate";
    private static final String KEY_USER_GROUP = "userGroup";
    private static final String KEY_SELECTED_ELECTIVES = "selectedElectives";
    private static final String KEY_WIDGET_SCHEDULE_SNAPSHOT = "widgetScheduleSnapshot";

    private static final int DEFAULT_MIN_PERIOD = 1;
    private static final int DEFAULT_MAX_PERIOD = 13;

    private static final long DAY_MS = 24L * 60L * 60L * 1000L;
    private static final long SCHEDULE_MIN_DELAY_MS = 1_000L;
    private static final long MINUTE_MS = 60L * 1000L;
    private static final long COUNTDOWN_REFRESH_THRESHOLD_MS = 30L * MINUTE_MS;

    private static final String[] DAY_NAMES = new String[] {
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
    };

    static final class Item {
        final String title;
        final String subtitle;
        final boolean ongoing;
        final long startMillis;
        final long endMillis;

        Item(String title, String subtitle, boolean ongoing, long startMillis, long endMillis) {
            this.title = title != null ? title : "";
            this.subtitle = subtitle != null ? subtitle : "";
            this.ongoing = ongoing;
            this.startMillis = startMillis;
            this.endMillis = endMillis;
        }
    }

    static final class Result {
        final List<Item> items;
        final String emptyMessage;
        final long nextRefreshAtMillis;
        final String title;

        Result(List<Item> items, String emptyMessage, long nextRefreshAtMillis) {
            this(items, emptyMessage, nextRefreshAtMillis, "");
        }

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

    private static final class CourseRef {
        final String name;
        final String group;
        final Object location;
        final Set<String> eligibleGroups;
        final Set<String> eligibleElectives;

        CourseRef(
            String name,
            String group,
            Object location,
            Set<String> eligibleGroups,
            Set<String> eligibleElectives
        ) {
            this.name = name != null ? name : "";
            this.group = (group != null && group.trim().length() > 0) ? group : null;
            this.location = location;
            this.eligibleGroups = eligibleGroups;
            this.eligibleElectives = eligibleElectives;
        }
    }

    private static final class PeriodMatch {
        final String key;
        final String courseLabel;
        final String locationText;

        PeriodMatch(String key, String courseLabel, String locationText) {
            this.key = key != null ? key : "";
            this.courseLabel = courseLabel != null ? courseLabel : "";
            this.locationText = locationText != null ? locationText : "";
        }
    }

    private static final class CourseBlock {
        final int periodStart;
        final int periodEnd;
        final long startMillis;
        final long endMillis;
        final String courseLabel;
        final String locationText;

        CourseBlock(
            int periodStart,
            int periodEnd,
            long startMillis,
            long endMillis,
            String courseLabel,
            String locationText
        ) {
            this.periodStart = periodStart;
            this.periodEnd = periodEnd;
            this.startMillis = startMillis;
            this.endMillis = endMillis;
            this.courseLabel = courseLabel != null ? courseLabel : "";
            this.locationText = locationText != null ? locationText : "";
        }
    }

    private static final class PeriodRangeMinutes {
        final int startMin;
        final int endMin;

        PeriodRangeMinutes(int startMin, int endMin) {
            this.startMin = startMin;
            this.endMin = endMin;
        }
    }

    static Result compute(Context context, long nowMillis) {
        if (context == null) {
            return new Result(
                Collections.<Item>emptyList(),
                "",
                nowMillis + SCHEDULE_MIN_DELAY_MS,
                ""
            );
        }

        final String todayTitle = context.getString(R.string.widget_today_courses_title);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String semesterStartDate = prefs.getString(KEY_SEMESTER_START_DATE, null);
        String userGroup = prefs.getString(KEY_USER_GROUP, null);
        String selectedElectivesRaw = prefs.getString(KEY_SELECTED_ELECTIVES, null);
        String rawSnapshot = prefs.getString(KEY_WIDGET_SCHEDULE_SNAPSHOT, null);
        Set<String> selectedElectives = parseSelectedElectives(selectedElectivesRaw);

        if (TextUtils.isEmpty(semesterStartDate)) {
            return new Result(
                Collections.<Item>emptyList(),
                context.getString(R.string.widget_today_courses_empty_need_start_date),
                getNextDailyRefreshMillis(nowMillis),
                todayTitle
            );
        }

        if (TextUtils.isEmpty(rawSnapshot)) {
            return new Result(
                Collections.<Item>emptyList(),
                context.getString(R.string.widget_today_courses_empty_need_open_app),
                nowMillis + NEED_SYNC_RETRY_DELAY_MS,
                todayTitle
            );
        }

        JSONObject root = null;
        JSONArray scheduleArray = null;
        JSONObject periodRangesObj = null;
        int maxWeek = -1;
        try {
            root = new JSONObject(rawSnapshot);
            scheduleArray = root.optJSONArray("schedule");
            periodRangesObj = root.optJSONObject("periodRanges");
            maxWeek = root.optInt("maxWeek", -1);
        } catch (JSONException error) {
            root = null;
            scheduleArray = null;
            periodRangesObj = null;
            maxWeek = -1;
        }

        if (scheduleArray == null || periodRangesObj == null || maxWeek <= 0) {
            return new Result(
                Collections.<Item>emptyList(),
                context.getString(R.string.widget_today_courses_empty_need_open_app),
                nowMillis + NEED_SYNC_RETRY_DELAY_MS,
                todayTitle
            );
        }

        PeriodRangeTable periodRangeTable = PeriodRangeTable.fromJson(periodRangesObj);
        if (periodRangeTable == null) {
            return new Result(
                Collections.<Item>emptyList(),
                context.getString(R.string.widget_today_courses_empty_need_open_app),
                nowMillis + NEED_SYNC_RETRY_DELAY_MS,
                todayTitle
            );
        }

        List<Item> items = Collections.emptyList();
        String emptyMessage = context.getString(R.string.widget_today_courses_empty_default);
        long nextRefreshAtMillis = getNextDailyRefreshMillis(nowMillis);

        DateInfoResult todayResult = calculateDateInfo(semesterStartDate, nowMillis, maxWeek);
        if (todayResult.status == DateStatus.OK && todayResult.info != null) {
            DateInfo info = todayResult.info;
            JSONObject daySchedule = findDaySchedule(scheduleArray, info.dayName);
            if (daySchedule != null) {
                Map<Integer, PeriodMatch> periodMatchMap = buildPeriodMatchMap(
                    daySchedule,
                    info.week,
                    userGroup,
                    selectedElectives,
                    periodRangeTable
                );
                List<CourseBlock> blocks =
                    buildCourseBlocks(periodMatchMap, nowMillis, periodRangeTable);
                items = buildItems(blocks, nowMillis);
                nextRefreshAtMillis = computeNextRefreshAtMillis(items, nowMillis);
            }
        } else {
            emptyMessage = messageForDateStatus(context, todayResult.status);
        }

        if (items != null && !items.isEmpty()) {
            return new Result(items, emptyMessage, nextRefreshAtMillis, todayTitle);
        }

        // No remaining courses today. If tomorrow has courses, show a preview.
        Calendar tomorrow = Calendar.getInstance();
        tomorrow.setTimeInMillis(nowMillis);
        truncateToMidnight(tomorrow);
        tomorrow.add(Calendar.DATE, 1);
        long tomorrowMidnightMillis = tomorrow.getTimeInMillis();

        DateInfoResult tomorrowResult = calculateDateInfo(
            semesterStartDate,
            tomorrowMidnightMillis,
            maxWeek
        );
        if (tomorrowResult.status == DateStatus.OK && tomorrowResult.info != null) {
            DateInfo info = tomorrowResult.info;
            JSONObject daySchedule = findDaySchedule(scheduleArray, info.dayName);
            if (daySchedule != null) {
                Map<Integer, PeriodMatch> periodMatchMap = buildPeriodMatchMap(
                    daySchedule,
                    info.week,
                    userGroup,
                    selectedElectives,
                    periodRangeTable
                );
                List<CourseBlock> blocks =
                    buildCourseBlocks(periodMatchMap, tomorrowMidnightMillis, periodRangeTable);
                List<Item> tomorrowItems = buildItems(blocks, nowMillis);
                if (tomorrowItems != null && !tomorrowItems.isEmpty()) {
                    long next =
                        computeNextRefreshAtMillis(tomorrowItems, nowMillis);
                    long daily = getNextDailyRefreshMillis(nowMillis);
                    if (daily > 0L && daily < next) {
                        next = daily;
                    }
                    return new Result(
                        tomorrowItems,
                        emptyMessage,
                        next,
                        context.getString(R.string.widget_tomorrow_courses_title)
                    );
                }
            }
        }

        return new Result(items, emptyMessage, nextRefreshAtMillis, todayTitle);
    }

    private static String messageForDateStatus(Context context, DateStatus status) {
        if (context == null) return "";
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

    private static long computeNextRefreshAtMillis(List<Item> items, long nowMillis) {
        if (items != null && !items.isEmpty()) {
            Item first = items.get(0);
            long trigger = first.ongoing ? first.endMillis : first.startMillis;
            long diff = trigger - nowMillis;
            long triggerWithDelay = trigger + SCHEDULE_MIN_DELAY_MS;

            if (diff <= 0) {
                return nowMillis + SCHEDULE_MIN_DELAY_MS;
            }

            // Only do minute ticks for the first upcoming class within threshold window.
            // For ongoing classes we only refresh at the end time.
            if (!first.ongoing && diff <= COUNTDOWN_REFRESH_THRESHOLD_MS) {
                long nextMinute = ((nowMillis / MINUTE_MS) + 1L) * MINUTE_MS;
                long next = nextMinute + SCHEDULE_MIN_DELAY_MS;
                if (next > triggerWithDelay) {
                    next = triggerWithDelay;
                }
                if (next <= nowMillis) {
                    next = nowMillis + SCHEDULE_MIN_DELAY_MS;
                }
                return next;
            }

            if (triggerWithDelay <= nowMillis) {
                return nowMillis + SCHEDULE_MIN_DELAY_MS;
            }

            return triggerWithDelay;
        }
        return getNextDailyRefreshMillis(nowMillis);
    }

    private static long getNextDailyRefreshMillis(long nowMillis) {
        Calendar next = Calendar.getInstance();
        next.setTimeInMillis(nowMillis);
        next.set(Calendar.HOUR_OF_DAY, 0);
        next.set(Calendar.MINUTE, 5);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (next.getTimeInMillis() <= nowMillis) {
            next.add(Calendar.DATE, 1);
        }
        return next.getTimeInMillis();
    }

    private static DateInfoResult calculateDateInfo(String startDate, long nowMillis, int maxWeek) {
        Calendar start = parseLocalDate(startDate);
        if (start == null) {
            return new DateInfoResult(DateStatus.INVALID_START_DATE, null);
        }

        Calendar target = Calendar.getInstance();
        target.setTimeInMillis(nowMillis);
        truncateToMidnight(target);
        truncateToMidnight(start);

        long diffTime = target.getTimeInMillis() - start.getTimeInMillis();
        long diffDays = (long) Math.floor((double) diffTime / (double) DAY_MS);
        if (diffDays < 0) {
            return new DateInfoResult(DateStatus.BEFORE_START, null);
        }

        int week = (int) (diffDays / 7L) + 1;
        if (week > maxWeek) {
            return new DateInfoResult(DateStatus.OUT_OF_RANGE, null);
        }

        int dayOfWeek = target.get(Calendar.DAY_OF_WEEK); // 1=Sun...7=Sat
        if (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY) {
            return new DateInfoResult(DateStatus.WEEKEND, null);
        }

        int index = dayOfWeek - Calendar.MONDAY; // Monday=2
        if (index < 0 || index >= DAY_NAMES.length) {
            return new DateInfoResult(DateStatus.WEEKEND, null);
        }

        return new DateInfoResult(DateStatus.OK, new DateInfo(week, DAY_NAMES[index]));
    }

    private static Calendar parseLocalDate(String value) {
        if (TextUtils.isEmpty(value)) return null;
        String[] parts = String.valueOf(value).split("-");
        if (parts.length < 3) return null;
        try {
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            int day = Integer.parseInt(parts[2]);
            if (year <= 0 || month <= 0 || day <= 0) return null;
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.YEAR, year);
            calendar.set(Calendar.MONTH, month - 1);
            calendar.set(Calendar.DAY_OF_MONTH, day);
            truncateToMidnight(calendar);
            return calendar;
        } catch (NumberFormatException error) {
            return null;
        }
    }

    private static void truncateToMidnight(Calendar calendar) {
        if (calendar == null) return;
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
    }

    private static JSONObject findDaySchedule(JSONArray scheduleArray, String dayName) {
        if (scheduleArray == null || dayName == null) return null;
        for (int i = 0; i < scheduleArray.length(); i += 1) {
            JSONObject entry = scheduleArray.optJSONObject(i);
            if (entry == null) continue;
            if (dayName.equals(entry.optString("day", ""))) {
                return entry;
            }
        }
        return null;
    }

    private static Map<Integer, PeriodMatch> buildPeriodMatchMap(
        JSONObject daySchedule,
        int currentWeek,
        String userGroup,
        Set<String> selectedElectives,
        PeriodRangeTable periodRanges
    ) {
        Map<Integer, PeriodMatch> result = new HashMap<>();
        if (daySchedule == null) return result;

        JSONArray periods = daySchedule.optJSONArray("periods");
        if (periods == null) return result;

        final int minPeriod = periodRanges != null ? periodRanges.minPeriod : DEFAULT_MIN_PERIOD;
        final int maxPeriod = periodRanges != null ? periodRanges.maxPeriod : DEFAULT_MAX_PERIOD;

        for (int i = 0; i < periods.length(); i += 1) {
            JSONObject periodEntry = periods.optJSONObject(i);
            if (periodEntry == null) continue;
            int period = periodEntry.optInt("period", -1);
            if (period < minPeriod || period > maxPeriod) continue;
            if (periodRanges.get(period) == null) continue;

            JSONArray courses = periodEntry.optJSONArray("courses");
            if (courses == null || courses.length() == 0) continue;

            List<CourseRef> matchingCourses = new ArrayList<>();
            for (int c = 0; c < courses.length(); c += 1) {
                JSONObject course = courses.optJSONObject(c);
                if (course == null) continue;
                if (!courseOccursInWeek(course, currentWeek)) continue;

                String courseGroup = null;
                if (course.has("group") && !course.isNull("group")) {
                    courseGroup = course.optString("group", null);
                }
                Set<String> eligibleGroups = parseEligibleGroups(course.optJSONArray("eligibleGroups"));
                if (!shouldIncludeForUser(eligibleGroups, userGroup)) continue;
                Set<String> eligibleElectives =
                    parseEligibleElectives(course.optJSONArray("eligibleElectives"));
                if (!shouldIncludeForElectives(eligibleElectives, selectedElectives)) continue;

                String name = course.optString("name", "");
                Object location = course.opt("location");
                matchingCourses.add(
                    new CourseRef(
                        name,
                        courseGroup,
                        location,
                        eligibleGroups,
                        eligibleElectives
                    )
                );
            }

            if (matchingCourses.isEmpty()) continue;

            List<String> locations = new ArrayList<>();
            Set<String> locSet = new HashSet<>();
            for (CourseRef course : matchingCourses) {
                String location = resolveCourseLocation(course.location, currentWeek);
                if (location == null) continue;
                String trimmed = location.trim();
                if (trimmed.length() == 0) continue;
                if (locSet.add(trimmed)) {
                    locations.add(trimmed);
                }
            }
            Collections.sort(locations);
            String locationKey = join(locations, "||");
            String locationText = join(locations, " / ");

            String displayKey = buildDisplayKey(matchingCourses);
            String key = displayKey + "::" + locationKey;
            String courseLabel = formatCourseLabels(matchingCourses);

            result.put(period, new PeriodMatch(key, courseLabel, locationText));
        }

        return result;
    }

    private static List<CourseBlock> buildCourseBlocks(
        Map<Integer, PeriodMatch> periodMatchMap,
        long nowMillis,
        PeriodRangeTable periodRanges
    ) {
        List<CourseBlock> blocks = new ArrayList<>();
        if (periodMatchMap == null || periodMatchMap.isEmpty()) return blocks;

        Calendar today = Calendar.getInstance();
        today.setTimeInMillis(nowMillis);
        truncateToMidnight(today);
        long dayStartMillis = today.getTimeInMillis();

        final int minPeriod = periodRanges != null ? periodRanges.minPeriod : DEFAULT_MIN_PERIOD;
        final int maxPeriod = periodRanges != null ? periodRanges.maxPeriod : DEFAULT_MAX_PERIOD;

        int period = minPeriod;
        while (period <= maxPeriod) {
            PeriodMatch match = periodMatchMap.get(period);
            if (match == null) {
                period += 1;
                continue;
            }

            int end = period;
            while (end + 1 <= maxPeriod) {
                PeriodMatch next = periodMatchMap.get(end + 1);
                if (next == null) break;
                if (!match.key.equals(next.key)) break;
                end += 1;
            }

            PeriodRangeMinutes startRange = periodRanges != null ? periodRanges.get(period) : null;
            PeriodRangeMinutes endRange = periodRanges != null ? periodRanges.get(end) : null;
            if (startRange != null && endRange != null) {
                long startMillis = dayStartMillis + startRange.startMin * 60L * 1000L;
                long endMillis = dayStartMillis + endRange.endMin * 60L * 1000L;
                blocks.add(
                    new CourseBlock(
                        period,
                        end,
                        startMillis,
                        endMillis,
                        match.courseLabel,
                        match.locationText
                    )
                );
            }

            period = end + 1;
        }

        Collections.sort(
            blocks,
            (a, b) -> a.startMillis < b.startMillis ? -1 : (a.startMillis == b.startMillis ? 0 : 1)
        );
        return blocks;
    }

    private static List<Item> buildItems(List<CourseBlock> blocks, long nowMillis) {
        List<Item> items = new ArrayList<>();
        if (blocks == null || blocks.isEmpty()) return items;

        for (CourseBlock block : blocks) {
            if (block.endMillis <= nowMillis) continue;
            boolean ongoing = block.startMillis <= nowMillis && nowMillis < block.endMillis;
            String timeRange = formatTimeRange(block.startMillis, block.endMillis);
            String subtitle = timeRange;
            if (!TextUtils.isEmpty(block.locationText)) {
                subtitle = timeRange + " · " + block.locationText;
            }
            items.add(new Item(block.courseLabel, subtitle, ongoing, block.startMillis, block.endMillis));
        }

        return items;
    }

    private static String formatTimeRange(long startMillis, long endMillis) {
        Calendar start = Calendar.getInstance();
        start.setTimeInMillis(startMillis);
        Calendar end = Calendar.getInstance();
        end.setTimeInMillis(endMillis);
        return String.format(
            Locale.getDefault(),
            "%02d:%02d-%02d:%02d",
            start.get(Calendar.HOUR_OF_DAY),
            start.get(Calendar.MINUTE),
            end.get(Calendar.HOUR_OF_DAY),
            end.get(Calendar.MINUTE)
        );
    }

    private static String formatMinutes(int minutes) {
        int total = Math.max(0, minutes);
        int h = total / 60;
        int m = total % 60;
        return String.format(Locale.getDefault(), "%02d:%02d", h, m);
    }

    private static boolean courseOccursInWeek(JSONObject course, int week) {
        if (course == null) return false;
        JSONArray weeks = course.optJSONArray("weeks");
        if (weeks == null) return false;
        for (int i = 0; i < weeks.length(); i += 1) {
            int value = weeks.optInt(i, Integer.MIN_VALUE);
            if (value == week) return true;
        }
        return false;
    }

    private static String buildDisplayKey(List<CourseRef> courses) {
        if (courses == null || courses.isEmpty()) return "";
        Set<String> seen = new HashSet<>();
        List<String> keys = new ArrayList<>();
        for (CourseRef course : courses) {
            String key =
                String.valueOf(course.name) +
                "::" +
                (course.group != null ? course.group : "") +
                "::" +
                serializeEligibility(course.eligibleElectives);
            if (seen.add(key)) {
                keys.add(key);
            }
        }
        Collections.sort(keys);
        return join(keys, "||");
    }

    private static String formatCourseLabels(List<CourseRef> courses) {
        if (courses == null || courses.isEmpty()) return "";
        Set<String> seen = new HashSet<>();
        List<String> labels = new ArrayList<>();
        for (CourseRef course : courses) {
            String name = course.name != null ? course.name : "";
            if (name.trim().length() == 0) continue;
            String label =
                course.group != null && course.group.trim().length() > 0
                    ? (name + "(" + course.group + ")")
                    : name;
            if (seen.add(label)) {
                labels.add(label);
            }
        }
        return join(labels, "、");
    }

    private static String resolveCourseLocation(Object location, int week) {
        if (location == null || location == JSONObject.NULL) return "";
        if (location instanceof String) {
            return (String) location;
        }

        if (location instanceof JSONObject) {
            JSONObject obj = (JSONObject) location;
            JSONObject weeksObj = obj.optJSONObject("weeks");
            if (weeksObj != null) {
                for (java.util.Iterator<String> it = weeksObj.keys(); it.hasNext();) {
                    String key = it.next();
                    String value = weeksObj.optString(key, "");
                    if (TextUtils.isEmpty(key)) continue;
                    if (!key.contains("-")) {
                        try {
                            int exact = Integer.parseInt(key);
                            if (exact == week) {
                                return value;
                            }
                        } catch (NumberFormatException ignore) {
                            // Skip invalid key
                        }
                        continue;
                    }
                    String[] parts = key.split("-");
                    if (parts.length != 2) continue;
                    try {
                        int start = Integer.parseInt(parts[0]);
                        int end = Integer.parseInt(parts[1]);
                        if (week >= start && week <= end) {
                            return value;
                        }
                    } catch (NumberFormatException ignore) {
                        // Skip invalid range
                    }
                }
            }
            String defValue = obj.optString("default", "");
            return !TextUtils.isEmpty(defValue) ? defValue : "未排地点";
        }

        return "";
    }

    private static Set<String> parseEligibleGroups(JSONArray eligibleGroups) {
        if (eligibleGroups == null) return null; // null means no restriction (ALL)
        HashSet<String> set = new HashSet<>();
        for (int i = 0; i < eligibleGroups.length(); i += 1) {
            String value = eligibleGroups.optString(i, "");
            if (!TextUtils.isEmpty(value)) {
                set.add(value);
            }
        }
        return set.isEmpty() ? null : set;
    }

    private static boolean shouldIncludeForUser(Set<String> eligibleGroups, String userGroup) {
        if (eligibleGroups == null) return true;
        if (TextUtils.isEmpty(userGroup)) return true;
        return eligibleGroups.contains(userGroup);
    }

    private static Set<String> parseEligibleElectives(JSONArray eligibleElectives) {
        if (eligibleElectives == null) return null;
        HashSet<String> set = new HashSet<>();
        for (int i = 0; i < eligibleElectives.length(); i += 1) {
            String value = eligibleElectives.optString(i, "");
            if (!TextUtils.isEmpty(value)) {
                set.add(value);
            }
        }
        return set.isEmpty() ? null : set;
    }

    private static Set<String> parseSelectedElectives(String raw) {
        if (TextUtils.isEmpty(raw)) return Collections.emptySet();
        try {
            JSONArray array = new JSONArray(raw);
            HashSet<String> set = new HashSet<>();
            for (int i = 0; i < array.length(); i += 1) {
                String value = array.optString(i, "");
                if (!TextUtils.isEmpty(value)) {
                    set.add(value);
                }
            }
            return set;
        } catch (JSONException error) {
            return Collections.emptySet();
        }
    }

    private static boolean shouldIncludeForElectives(
        Set<String> eligibleElectives,
        Set<String> selectedElectives
    ) {
        if (eligibleElectives == null) return true;
        if (selectedElectives == null || selectedElectives.isEmpty()) return false;
        for (String value : eligibleElectives) {
            if (selectedElectives.contains(value)) {
                return true;
            }
        }
        return false;
    }

    private static String serializeEligibility(Set<String> values) {
        if (values == null || values.isEmpty()) return "";
        List<String> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        return join(sorted, ",");
    }

    private static String join(List<String> items, String sep) {
        if (items == null || items.isEmpty()) return "";
        String delimiter = sep != null ? sep : "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < items.size(); i += 1) {
            if (i > 0) sb.append(delimiter);
            sb.append(items.get(i));
        }
        return sb.toString();
    }

    private static final class PeriodRangeTable {
        final Map<Integer, PeriodRangeMinutes> ranges;
        final int minPeriod;
        final int maxPeriod;

        PeriodRangeTable(Map<Integer, PeriodRangeMinutes> ranges, int minPeriod, int maxPeriod) {
            this.ranges = ranges;
            this.minPeriod = minPeriod;
            this.maxPeriod = maxPeriod;
        }

        PeriodRangeMinutes get(int period) {
            return ranges != null ? ranges.get(period) : null;
        }

        static PeriodRangeTable fromJson(JSONObject obj) {
            if (obj == null) return null;
            HashMap<Integer, PeriodRangeMinutes> map = new HashMap<>();
            int min = Integer.MAX_VALUE;
            int max = Integer.MIN_VALUE;

            for (java.util.Iterator<String> it = obj.keys(); it.hasNext();) {
                String key = it.next();
                if (TextUtils.isEmpty(key)) continue;
                int period;
                try {
                    period = Integer.parseInt(key);
                } catch (NumberFormatException ignore) {
                    continue;
                }
                JSONObject rangeObj = obj.optJSONObject(key);
                if (rangeObj == null) continue;
                int startMin = rangeObj.optInt("startMin", Integer.MIN_VALUE);
                int endMin = rangeObj.optInt("endMin", Integer.MIN_VALUE);
                if (startMin == Integer.MIN_VALUE || endMin == Integer.MIN_VALUE) continue;
                if (startMin < 0 || endMin <= startMin) continue;
                map.put(period, new PeriodRangeMinutes(startMin, endMin));
                if (period < min) min = period;
                if (period > max) max = period;
            }

            if (map.isEmpty()) return null;
            return new PeriodRangeTable(map, min, max);
        }
    }
}
