import puppeteer from "puppeteer";
import { profile as defaultProfile } from "./profile.js";
import { applyForPlatform, detectPlatform, platformLabel, EXTENSION_PLATFORMS } from "./platforms/index.js";

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
    const platform = detectPlatform(url);
    const page = await browser.newPage();

    try {
      log(`Opening: ${url}`);
      log(`Detected: ${platformLabel(platform)}`);

      if (EXTENSION_PLATFORMS.includes(platform)) {
        log(`Skipped — use your Chrome extension for ${platformLabel(platform)} applications.`);
        results.push({
          url,
          platform,
          status: "skipped",
          message: `Use Chrome extension for ${platformLabel(platform)}`
        });
        await page.close();
        continue;
      }

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.bringToFront();

      const result = await applyForPlatform(page, url, profile, log);
      results.push({ url, ...result });
    } catch (error) {
      log(`Error: ${error.message}`);
      results.push({ url, platform, status: "error", error: error.message });
    } finally {
      await page.close().catch(() => {});
    }
  }

  log("Queue finished. Review each tab before submitting.");
  return results;
}
