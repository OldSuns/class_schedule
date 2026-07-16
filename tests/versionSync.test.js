import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptPath = fileURLToPath(
  new URL("../scripts/sync-version.mjs", import.meta.url)
);

test("version sync updates package lock, web constant and Android metadata", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "summer-version-sync-"));
  try {
    await mkdir(path.join(root, "src", "config"), { recursive: true });
    await mkdir(path.join(root, "android", "app"), { recursive: true });
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name: "fixture", version: "2.1.0" }, null, 2)
    );
    await writeFile(
      path.join(root, "package-lock.json"),
      JSON.stringify(
        {
          name: "fixture",
          version: "2.0.4",
          lockfileVersion: 3,
          packages: { "": { name: "fixture", version: "2.0.2" } }
        },
        null,
        2
      )
    );
    await writeFile(
      path.join(root, "src", "config", "constants.js"),
      'export const APP_VERSION = "2.0.8";\n'
    );
    await writeFile(
      path.join(root, "android", "app", "build.gradle"),
      'android { defaultConfig { versionCode 1\nversionName "2.0.8" } }\n'
    );

    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: root,
      encoding: "utf8"
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const lock = JSON.parse(
      await readFile(path.join(root, "package-lock.json"), "utf8")
    );
    assert.equal(lock.version, "2.1.0");
    assert.equal(lock.packages[""].version, "2.1.0");
    assert.match(
      await readFile(path.join(root, "src", "config", "constants.js"), "utf8"),
      /APP_VERSION = "2\.1\.0"/
    );
    assert.match(
      await readFile(path.join(root, "android", "app", "build.gradle"), "utf8"),
      /versionName "2\.1\.0"/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
