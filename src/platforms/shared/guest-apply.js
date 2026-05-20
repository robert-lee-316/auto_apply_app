import { openApplicationForm } from "./common.js";
import { fillGenericForm } from "./fill-generic.js";

/** Factory for desktop guest-apply platforms (Greenhouse, Lever, etc.). */
export function createGuestPlatform({ id, label, match, applySelectors = [] }) {
  return {
    id,
    label,
    channel: "desktop",
    match,
    async apply(page, profile, log = console.log) {
      log(`Platform: ${label}`);
      await openApplicationForm(page, log, applySelectors);
      const result = await fillGenericForm(page, profile, log);
      return { platform: id, ...result };
    }
  };
}
