package com.oldsun.classschedule;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        registerPlugin(AlarmClockSchedulerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
