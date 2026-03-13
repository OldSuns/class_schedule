package com.oldsun.classschedule;

import android.content.Intent;
import android.widget.RemoteViewsService;

public class TodayCoursesWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new TodayCoursesRemoteViewsFactory(getApplicationContext(), intent);
    }
}

