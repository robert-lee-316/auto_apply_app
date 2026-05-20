/**
 * Chrome extension supports Workday and iCIMS only.
 * Other ATS sites use the desktop app (src/platforms/).
 */
/* global AutoApplyRegistry */
const AutoApplyRegistry = (() => {
  const platforms = [];

  function register(platform) {
    platforms.push(platform);
  }

  function detectPlatform(url = location.href) {
    for (const p of platforms) {
      if (p.match(url)) return p.id;
    }
    return null;
  }

  function get(id) {
    return platforms.find((p) => p.id === id);
  }

  function label(id) {
    return get(id)?.label ?? "Unknown";
  }

  async function apply(id, profile, log) {
    const platform = get(id);
    if (!platform?.apply) throw new Error(`No apply handler for ${id}`);
    return platform.apply(profile, log);
  }

  return { register, detectPlatform, get, label, apply };
})();
