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
  console.error("src/data/scheduleData.js 未导出有效的 scheduleData 数组");
  process.exit(1);
}

// updatedAt 跟随内容：与旧 schedule.json 内容一致时保留旧日期（重复 build 不漂移），
// 内容变化或首次生成时才写当天。远端软更新会拿它和内置侧比较，见 useScheduleData.js。
const previousPayload = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
  : null;
const previousSchedule = Array.isArray(previousPayload?.schedule)
  ? previousPayload.schedule
  : null;
const scheduleUnchanged =
  previousSchedule != null &&
  JSON.stringify(previousSchedule) === JSON.stringify(scheduleData);
const updatedAt = scheduleUnchanged
  ? previousPayload.updatedAt
  : toIsoDate();

const payload = {
  version: 1,
  updatedAt,
  schedule: scheduleData
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`已生成 schedule.json (${outputPath})`);
