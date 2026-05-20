/* global AutoApplyRegistry, WorkdayApply */
AutoApplyRegistry.register({
  id: "workday",
  label: "Workday",
  match(url) {
    const u = String(url).toLowerCase();
    return (
      u.includes("myworkdayjobs.com") ||
      u.includes("workdayjobs.com") ||
      (u.includes("workday.com") && u.includes("job"))
    );
  },
  apply: WorkdayApply.apply
});
