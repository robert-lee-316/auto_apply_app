export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function selectorExists(page, selector, timeout = 1500) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

export async function fill(page, selector, value, timeout = 2500) {
  if (!value && value !== 0) return false;
  try {
    await page.waitForSelector(selector, { timeout });
    const el = await page.$(selector);
    if (!el) return false;
    await el.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await el.type(String(value), { delay: 20 });
    return true;
  } catch {
    return false;
  }
}

export async function click(page, selector, timeout = 2500) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch {
    return false;
  }
}

export async function chooseDropdown(page, selector, value, timeout = 2500) {
  if (!value) return false;
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    await sleep(300);
    await page.keyboard.type(String(value), { delay: 35 });
    await page.keyboard.press("Enter");
    await sleep(300);
    return true;
  } catch {
    return false;
  }
}

export async function fillByText(page, keywords, value) {
  if (!value) return false;
  const list = Array.isArray(keywords) ? keywords : [keywords];
  return page.evaluate((list, value) => {
    function setValue(el, value) {
      const proto = Object.getPrototypeOf(el);
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      if (desc?.set) desc.set.call(el, value);
      else el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const fields = [...document.querySelectorAll("input, textarea")];
    for (const field of fields) {
      const id = field.id ? `label[for="${field.id}"]` : null;
      const label = id ? document.querySelector(id)?.innerText || "" : "";
      const text = [field.name, field.id, field.placeholder, field.getAttribute("aria-label"), label, field.closest("div")?.innerText]
        .join(" ")
        .toLowerCase();
      if (list.some(k => text.includes(String(k).toLowerCase()))) {
        setValue(field, value);
        return true;
      }
    }
    return false;
  }, list, String(value));
}

export async function uploadFile(page, selector, filePath) {
  if (!filePath) return false;
  try {
    const input = await page.$(selector);
    if (!input) return false;
    await input.uploadFile(filePath);
    return true;
  } catch {
    return false;
  }
}
