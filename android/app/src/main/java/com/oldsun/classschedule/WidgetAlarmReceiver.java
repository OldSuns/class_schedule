package com.oldsun.classschedule;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class WidgetAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        TodayCoursesWidgetProvider.requestRefresh(context);
    }
}

