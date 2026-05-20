import { createGuestPlatform } from "../shared/guest-apply.js";

export default createGuestPlatform({
  id: "rippling",
  label: "Rippling",
  match(url) {
    return String(url).toLowerCase().includes("rippling.com");
  }
});
