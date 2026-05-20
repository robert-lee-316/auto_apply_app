import fs from "fs";
import { runQueue } from "./runner.js";

const file = process.argv[2] || "jobs.txt";
const autoSubmit = process.argv.includes("--submit");

if (!fs.existsSync(file)) {
  console.error(`Missing ${file}. Create a file with one job link per line.`);
  process.exit(1);
}

const links = fs.readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map(x => x.trim())
  .filter(x => x && !x.startsWith("#"));

await runQueue(links, { autoSubmit });
