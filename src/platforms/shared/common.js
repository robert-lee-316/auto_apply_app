import { click, sleep } from "../../utils.js";

/** Click common "Apply" entry points (no sign-in). */
export async function openApplicationForm(page, log, extraSelectors = []) {
  const selectors = [
    ...extraSelectors,
    'a[href*="apply"]',
    'button[data-qa="btn-apply"]',
    'a.postings-btn',
    'a#apply_button',
    '[data-testid="apply-button"]',
    'a.application-button',
    'button.application-button'
  ];

  for (const selector of selectors) {
    const ok = await click(page, selector, 1500);
    if (ok) {
      log("Opened application form.");
      await sleep(1200);
      return true;
    }
  }

  const clicked = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll("a, button")];
    const match = candidates.find((el) => {
      const text = (el.innerText || el.textContent || "").trim().toLowerCase();
      return /^(apply|apply for this job|apply now|submit application)$/.test(text);
    });
    if (match) {
      match.click();
      return true;
    }
    return false;
  });

  if (clicked) {
    log("Opened application form (text match).");
    await sleep(1200);
  }
  return clicked;
}
