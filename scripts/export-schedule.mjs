import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const findProjectRoot = (startDir) => {
  let current = startDir;
  while (true) {
    const hasPackage = fs.existsSync(path.join(current, "package.json"));
    const hasSrc = fs.existsSync(path.join(current, "src", "scheduleData.js"));
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
const sourcePath = path.join(root, "src", "scheduleData.js");
const outputPath = path.join(root, "schedule.json");

const toIsoDate = (date = new Date()) => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const loadScheduleData = async () => {
  const moduleUrl = pathToFileURL(sourcePath).href;
  const module = await import(moduleUrl);
  return module?.scheduleData;
};

const scheduleData = await loadScheduleData();
if (!Array.isArray(scheduleData)) {
  console.error("src/scheduleData.js 未导出有效的 scheduleData 数组");
  process.exit(1);
}

const payload = {
  version: 1,
  updatedAt: toIsoDate(),
  schedule: scheduleData
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`已生成 schedule.json (${outputPath})`);
