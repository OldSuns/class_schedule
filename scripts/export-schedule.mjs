import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const findProjectRoot = (startDir) => {
  let current = startDir;
  while (true) {
    const hasPackage = fs.existsSync(path.join(current, "package.json"));
    const hasSrc = fs.existsSync(path.join(current, "src", "data", "scheduleData.js"));
    if (hasPackage && hasSrc) {
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
const sourcePath = path.join(root, "src", "data", "scheduleData.js");
const outputPath = path.join(root, "schedule.json");

const loadScheduleData = async () => {
  const moduleUrl = pathToFileURL(sourcePath).href;
  const module = await import(moduleUrl);
  return module?.scheduleData;
};

const scheduleData = await loadScheduleData();
if (!scheduleData || !Array.isArray(scheduleData.events)) {
  console.error("src/data/scheduleData.js 未导出有效的事件课表");
  process.exit(1);
}

fs.writeFileSync(outputPath, JSON.stringify(scheduleData, null, 2), "utf8");
console.log(`已生成 schedule.json (${outputPath})`);
