/** Workday is handled by the Chrome extension — desktop app skips these URLs. */
export default {
  id: "workday",
  label: "Workday",
  channel: "extension",
  match(url) {
    const u = String(url).toLowerCase();
    return (
      u.includes("myworkdayjobs.com") ||
      u.includes("workdayjobs.com") ||
      (u.includes("workday.com") && u.includes("job"))
    );
  }
};
