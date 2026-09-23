package com.oldsun.classschedule;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    @PluginMethod
    public void refresh(PluginCall call) {
        try {
            TodayCoursesWidgetProvider.requestRefresh(getContext());
            call.resolve();
        } catch (Exception error) {
            call.reject("Widget refresh failed", error);
        }
    }
}

