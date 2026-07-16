import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Android status bar inset converts physical pixels to CSS pixels", () => {
  const source = readFileSync(
    new URL(
      "../android/app/src/main/java/com/oldsun/classschedule/MainActivity.java",
      import.meta.url
    ),
    "utf8"
  );

  assert.match(source, /getDisplayMetrics\(\)\.density/);
  assert.match(source, /Math\.round\(topPixels \/ density\)/);
  assert.match(source, /injectStatusBarHeight\(topCssPixels\)/);
});
