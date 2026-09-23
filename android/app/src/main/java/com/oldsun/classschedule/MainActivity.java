package com.oldsun.classschedule;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private int lastStatusBarCssHeight = -1;

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
            updateStatusBarHeight(insets);
            return insets;
        });

        webView.post(() -> {
            ViewCompat.requestApplyInsets(webView);
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(webView);
            if (insets != null) {
                updateStatusBarHeight(insets);
            }
        });
    }

    private void updateStatusBarHeight(WindowInsetsCompat insets) {
        int topPixels = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
        float density = getResources().getDisplayMetrics().density;
        int topCssPixels = density > 0 ? Math.round(topPixels / density) : topPixels;
        if (topCssPixels == lastStatusBarCssHeight) {
            return;
        }
        lastStatusBarCssHeight = topCssPixels;
        injectStatusBarHeight(topCssPixels);
    }

    private void injectStatusBarHeight(int topCssPixels) {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }
        String script = "(function(){var el=document&&document.documentElement;"
            + "if(!el){return;}el.style.setProperty('--android-statusbar','" + topCssPixels + "px');})();";
        getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(script, null));
    }
}
