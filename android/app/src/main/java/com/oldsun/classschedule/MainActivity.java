package com.oldsun.classschedule;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private int lastStatusBarHeight = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        registerPlugin(AlarmClockSchedulerPlugin.class);
        super.onCreate(savedInstanceState);
        setupStatusBarInsetListener();
    }

    private void setupStatusBarInsetListener() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }

        WebView webView = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, insets) -> {
            int top = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            if (top != lastStatusBarHeight) {
                lastStatusBarHeight = top;
                injectStatusBarHeight(top);
            }
            return insets;
        });

        webView.post(() -> {
            ViewCompat.requestApplyInsets(webView);
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(webView);
            if (insets != null) {
                int top = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
                if (top != lastStatusBarHeight) {
                    lastStatusBarHeight = top;
                    injectStatusBarHeight(top);
                }
            }
        });
    }

    private void injectStatusBarHeight(int top) {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }
        String script = "(function(){var el=document&&document.documentElement;"
            + "if(!el){return;}el.style.setProperty('--android-statusbar','" + top + "px');})();";
        getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(script, null));
    }
}
