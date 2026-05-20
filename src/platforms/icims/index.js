/** iCIMS is handled by the Chrome extension — desktop app skips these URLs. */
export default {
  id: "icims",
  label: "iCIMS",
  channel: "extension",
  match(url) {
    return String(url).toLowerCase().includes("icims.com");
  }
};
