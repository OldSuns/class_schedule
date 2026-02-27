import fs from "node:fs";
import path from "node:path";

const findProjectRoot = (startDir) => {
  let current = startDir;
  while (true) {
    const hasPackage = fs.existsSync(path.join(current, "package.json"));
    const hasGradle = fs.existsSync(
      path.join(current, "android", "app", "build.gradle")
    );
    if (hasPackage && hasGradle) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
};

const root = findProjectRoot(process.cwd());

const gradlePath = path.join(root, "android", "app", "build.gradle");
const constantsPath = path.join(root, "src", "constants.js");
const packageJsonPath = path.join(root, "package.json");

const gradle = fs.readFileSync(gradlePath, "utf8");
const match = gradle.match(/versionName\s+"([^"]+)"/);
if (!match) {
  console.error("未找到 versionName");
  process.exit(1);
}
const versionName = match[1];

let constants = fs.readFileSync(constantsPath, "utf8");
const versionPattern = /export const APP_VERSION\s*=\s*["'][^"']+["']/;
if (versionPattern.test(constants)) {
  constants = constants.replace(
    versionPattern,
    `export const APP_VERSION = "${versionName}"`
  );
} else {
  const anchor = "export const DEFAULT_SEMESTER_START_DATE";
  if (constants.includes(anchor)) {
    const lines = constants.split(/\r?\n/);
    const index = lines.findIndex((line) => line.includes(anchor));
    lines.splice(
      index + 1,
      0,
      "",
      "// 当前应用版本（用于更新检查）",
      `export const APP_VERSION = "${versionName}";`
    );
    constants = lines.join("\n");
  } else {
    constants = `${constants.trimEnd()}\n\n// 当前应用版本（用于更新检查）\nexport const APP_VERSION = "${versionName}";\n`;
  }
}
fs.writeFileSync(constantsPath, constants, "utf8");

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
packageJson.version = versionName;
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + "\n",
  "utf8"
);

console.log(`版本已同步为 ${versionName}`);
