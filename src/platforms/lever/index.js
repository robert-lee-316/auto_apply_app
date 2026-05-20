import { createGuestPlatform } from "../shared/guest-apply.js";

export default createGuestPlatform({
  id: "lever",
  label: "Lever",
  match(url) {
    const u = String(url).toLowerCase();
    return u.includes("jobs.lever.co") || u.includes("lever.co");
  },
  applySelectors: ['a.postings-btn', '[data-qa="btn-apply"]']
});
