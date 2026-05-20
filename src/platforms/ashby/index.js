import { createGuestPlatform } from "../shared/guest-apply.js";

export default createGuestPlatform({
  id: "ashby",
  label: "Ashby",
  match(url) {
    const u = String(url).toLowerCase();
    return u.includes("ashbyhq.com") || u.includes("jobs.ashby");
  }
});
