import { createGuestPlatform } from "../shared/guest-apply.js";

export default createGuestPlatform({
  id: "paylocity",
  label: "Paylocity",
  match(url) {
    return String(url).toLowerCase().includes("paylocity.com");
  }
});
