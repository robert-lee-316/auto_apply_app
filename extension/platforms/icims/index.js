/* global AutoApplyRegistry, IcimsApply */
AutoApplyRegistry.register({
  id: "icims",
  label: "iCIMS",
  match(url) {
    return String(url).toLowerCase().includes("icims.com");
  },
  apply: IcimsApply.apply
});
