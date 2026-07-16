import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("summer settings remove display mode and elective controls", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  try {
    const { default: SettingsPage } = await server.ssrLoadModule(
      "/src/components/settings/SettingsPage.jsx"
    );
    const markup = renderToStaticMarkup(
      React.createElement(SettingsPage, {
        semesterStartDate: "2026-07-13",
        currentWeek: 2,
        onSelectWeek: () => {},
        theme: "minimal",
        onThemeChange: () => {},
        userGroup: "1组",
        onGroupChange: () => {}
      })
    );

    assert.match(markup, /设置/);
    assert.match(markup, /简约蓝/);
    assert.match(markup, /M3/);
    assert.match(markup, /分组/);
    assert.doesNotMatch(markup, /显示模式/);
    assert.doesNotMatch(markup, /选修/);
  } finally {
    await server.close();
  }
});

test("expanded summer group selector renders seven groups in a four-column grid", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  try {
    const { default: ReminderSection } = await server.ssrLoadModule(
      "/src/components/settings/SettingsMenu/ReminderSection.jsx"
    );
    const markup = renderToStaticMarkup(
      React.createElement(ReminderSection, {
        notificationsEnabled: false,
        onToggleNotifications: () => {},
        userGroup: "1组",
        onGroupChange: () => {},
        leadMinutes: 15,
        leadMinuteOptions: [10, 15],
        onLeadMinutesChange: () => {},
        onTestNotification: () => {},
        notificationStatus: "",
        showGroupSection: true,
        onToggleGroupSection: () => {},
        showAdvancedReminder: false,
        onToggleAdvancedReminder: () => {}
      })
    );

    assert.match(markup, /grid-cols-4/);
    for (let group = 1; group <= 7; group += 1) {
      assert.match(markup, new RegExp(`>${group}组<`));
    }
    assert.doesNotMatch(markup, /6A|6B|7C|7D|选修/);
  } finally {
    await server.close();
  }
});

test("summer schedule management keeps the calendar start fixed", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  try {
    const { default: ScheduleManagementSection } = await server.ssrLoadModule(
      "/src/components/settings/SettingsMenu/ScheduleManagementSection.jsx"
    );
    const markup = renderToStaticMarkup(
      React.createElement(ScheduleManagementSection, {
        showScheduleManagement: true,
        onToggleScheduleManagement: () => {},
        currentScheduleSourceLabel: "内置课表",
        hasManualScheduleChanges: false,
        onResetSchedule: () => {},
        resetStatus: ""
      })
    );

    assert.match(markup, /当前课表状态/);
    assert.match(markup, /重置课表/);
    assert.doesNotMatch(markup, /开学日期|type="date"/);
  } finally {
    await server.close();
  }
});
