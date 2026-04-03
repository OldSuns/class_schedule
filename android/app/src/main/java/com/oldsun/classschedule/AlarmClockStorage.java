package com.oldsun.classschedule;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.json.JSONException;
import org.json.JSONObject;

public class AlarmClockStorage {
    private static final String PREFS_NAME = "AlarmClockNotifications";
    private static final String KEY_IDS = "pending_ids";
    private static final String KEY_PREFIX = "notif_";

    private final SharedPreferences prefs;

    public AlarmClockStorage(Context context) {
        this.prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public void save(int id, String title, String body, String channelId, long triggerAt, String extra) {
        JSONObject json = new JSONObject();
        try {
            json.put("id", id);
            json.put("title", title);
            json.put("body", body);
            json.put("channelId", channelId);
            json.put("triggerAt", triggerAt);
            json.put("extra", extra != null ? extra : "");
        } catch (JSONException e) {
            return;
        }

        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_PREFIX + id, json.toString());

        Set<String> ids = new HashSet<>(prefs.getStringSet(KEY_IDS, new HashSet<>()));
        ids.add(String.valueOf(id));
        editor.putStringSet(KEY_IDS, ids);
        editor.apply();
    }

    public JSONObject load(int id) {
        String raw = prefs.getString(KEY_PREFIX + id, null);
        if (raw == null) return null;
        try {
            return new JSONObject(raw);
        } catch (JSONException e) {
            return null;
        }
    }

    public void remove(int id) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.remove(KEY_PREFIX + id);

        Set<String> ids = new HashSet<>(prefs.getStringSet(KEY_IDS, new HashSet<>()));
        ids.remove(String.valueOf(id));
        editor.putStringSet(KEY_IDS, ids);
        editor.apply();
    }

    public List<Integer> getAllPendingIds() {
        Set<String> ids = prefs.getStringSet(KEY_IDS, new HashSet<>());
        List<Integer> result = new ArrayList<>();
        for (String idStr : ids) {
            try {
                result.add(Integer.parseInt(idStr));
            } catch (NumberFormatException ignored) {
            }
        }
        return result;
    }

    public void clear() {
        prefs.edit().clear().apply();
    }
}
