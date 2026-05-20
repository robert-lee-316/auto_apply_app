import { fillGenericForm } from "../shared/fill-generic.js";

export default {
  id: "generic",
  label: "Generic ATS",
  channel: "desktop",
  match() {
    return true;
  },
  async apply(page, profile, log = console.log) {
    log("Platform: Generic ATS");
    const result = await fillGenericForm(page, profile, log);
    return { platform: "generic", ...result };
  }
};
