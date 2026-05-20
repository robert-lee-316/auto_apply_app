import { createGuestPlatform } from "../shared/guest-apply.js";

export default createGuestPlatform({
  id: "greenhouse",
  label: "Greenhouse",
  match(url) {
    const u = String(url).toLowerCase();
    return u.includes("greenhouse.io") || u.includes("boards.greenhouse");
  },
  applySelectors: ['a#apply_button', 'button[data-qa="btn-apply"]']
});
