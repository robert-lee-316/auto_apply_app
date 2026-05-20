import puppeteer from "puppeteer";
import { profile as defaultProfile } from "./profile.js";
import { isWorkday, applyWorkday } from "./workday.js";
import { applyGeneric } from "./generic.js";

export async function runQueue(jobLinks, options = {}) {
  const profile = { ...defaultProfile, ...(options.profile || {}) };
  profile.autoSubmit = Boolean(options.autoSubmit ?? profile.autoSubmit);

  const log = options.log || console.log;
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"]
  });

  const results = [];

  for (const url of jobLinks.filter(Boolean)) {
    const page = await browser.newPage();
    try {
      log(`Opening: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.bringToFront();

      const result = isWorkday(url)
        ? await applyWorkday(page, profile, log)
        : await applyGeneric(page, profile, log);

      results.push({ url, ...result });
    } catch (error) {
      log(`Error: ${error.message}`);
      results.push({ url, status: "error", error: error.message });
    }
  }

  log("Queue finished.");
  return results;
}
