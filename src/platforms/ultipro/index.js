import { createGuestPlatform } from "../shared/guest-apply.js";

export default createGuestPlatform({
  id: "ultipro",
  label: "UKG/UltiPro",
  match(url) {
    const u = String(url).toLowerCase();
    return u.includes("ultipro.com") || u.includes("ukg.com") || u.includes("recruiting.ultipro");
  }
});
