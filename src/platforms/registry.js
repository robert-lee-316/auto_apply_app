import greenhouse from "./greenhouse/index.js";
import lever from "./lever/index.js";
import ashby from "./ashby/index.js";
import ultipro from "./ultipro/index.js";
import paylocity from "./paylocity/index.js";
import rippling from "./rippling/index.js";
import workday from "./workday/index.js";
import icims from "./icims/index.js";
import generic from "./generic/index.js";

/** Specific matchers first; generic is fallback only. */
const PLATFORMS = [workday, icims, greenhouse, lever, ashby, ultipro, paylocity, rippling, generic];

export const EXTENSION_PLATFORMS = PLATFORMS.filter((p) => p.channel === "extension").map((p) => p.id);

export const DESKTOP_PLATFORMS = PLATFORMS.filter((p) => p.channel === "desktop").map((p) => p.id);

export function detectPlatform(url) {
  for (const platform of PLATFORMS) {
    if (platform.id === "generic") continue;
    if (platform.match(url)) return platform.id;
  }
  return "generic";
}

export function getPlatform(id) {
  return PLATFORMS.find((p) => p.id === id);
}

export function platformLabel(id) {
  return getPlatform(id)?.label ?? id;
}

export async function applyForPlatform(page, url, profile, log = console.log) {
  const id = detectPlatform(url);
  const platform = getPlatform(id);

  if (!platform?.apply) {
    log(`No desktop apply handler for ${platformLabel(id)}.`);
    return { platform: id, status: "skipped", message: `Use Chrome extension for ${platformLabel(id)}` };
  }

  return platform.apply(page, profile, log);
}
