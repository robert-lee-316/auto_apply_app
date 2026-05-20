/* global AutoApplyDom */
const AutoApplyDom = (() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function getRoots() {
    const roots = [document];
    for (const frame of document.querySelectorAll("iframe")) {
      try {
        if (frame.contentDocument) roots.push(frame.contentDocument);
      } catch {
        /* cross-origin */
      }
    }
    return roots;
  }

  function queryAll(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function queryInAllRoots(selector) {
    const out = [];
    for (const root of getRoots()) {
      out.push(...queryAll(selector, root));
    }
    return out;
  }

  function setNativeValue(el, value) {
    const str = String(value);
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc?.set) desc.set.call(el, str);
    else el.value = str;
    try {
      el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, data: str }));
    } catch {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function fill(selector, value, root = document) {
    if (value === undefined || value === null || value === "") return false;
    const el = root.querySelector(selector);
    if (!el) return false;
    el.focus();
    el.click();
    setNativeValue(el, String(value));
    return true;
  }

  function fillAny(selector, value) {
    for (const root of getRoots()) {
      if (fill(selector, value, root)) return true;
    }
    return false;
  }

  function fillFirst(selectors, value) {
    if (value === undefined || value === null || value === "") return false;
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (fillAny(sel, value)) return true;
    }
    return false;
  }

  function click(selector, root = document) {
    const el = root.querySelector(selector);
    if (!el) return false;
    el.click();
    return true;
  }

  function clickAny(selector) {
    for (const root of getRoots()) {
      if (click(selector, root)) return true;
    }
    return false;
  }

  function exists(selector) {
    return queryInAllRoots(selector).length > 0;
  }

  async function chooseDropdown(selector, value) {
    if (!value) return false;
    for (const root of getRoots()) {
      const btn = root.querySelector(selector);
      if (!btn) continue;
      btn.click();
      await sleep(350);
      const search = root.activeElement;
      if (search && (search.tagName === "INPUT" || search.getAttribute("role") === "combobox")) {
        setNativeValue(search, String(value));
        search.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      }
      await sleep(200);
      const option = [...root.querySelectorAll('[role="option"], li, [data-automation-id*="option"]')].find(
        (o) => (o.innerText || "").toLowerCase().includes(String(value).toLowerCase())
      );
      if (option) {
        option.click();
        return true;
      }
      document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(250);
      return true;
    }
    return false;
  }

  function fillByText(keywords, value, root = document) {
    if (!value) return false;
    const list = Array.isArray(keywords) ? keywords : [keywords];
    const fields = [...root.querySelectorAll("input, textarea, select")];
    for (const field of fields) {
      if (field.type === "hidden" || field.disabled) continue;
      const id = field.id ? `label[for="${field.id.replace(/"/g, '\\"')}"]` : null;
      const label = id ? root.querySelector(id)?.innerText || "" : "";
      const text = [
        field.name,
        field.id,
        field.placeholder,
        field.getAttribute("aria-label"),
        label,
        field.closest("fieldset, div, section, label")?.innerText?.slice(0, 120)
      ]
        .join(" ")
        .toLowerCase();
      if (list.some((k) => text.includes(String(k).toLowerCase()))) {
        if (field.tagName === "SELECT") {
          const opt = [...field.options].find((o) =>
            (o.text || o.value || "").toLowerCase().includes(String(value).toLowerCase())
          );
          if (opt) field.value = opt.value;
        } else {
          setNativeValue(field, String(value));
        }
        return true;
      }
    }
    return false;
  }

  function fillByTextAny(keywords, value) {
    for (const root of getRoots()) {
      if (fillByText(keywords, value, root)) return true;
    }
    return false;
  }

  function uploadResumeFromProfile(profile) {
    if (!profile?.resumeBase64) return false;
    const inputs = queryInAllRoots('input[type="file"]');
    const input = inputs.find((el) => !el.disabled) || inputs[0];
    if (!input) return false;

    try {
      const binary = atob(profile.resumeBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const name = profile.resumeFileName || "resume.pdf";
      const type = name.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";
      const file = new File([bytes], name, { type });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    } catch {
      return false;
    }
  }

  function clickByText(patterns) {
    const reList = patterns.map((p) => (p instanceof RegExp ? p : new RegExp(`^${p}$`, "i")));
    for (const root of getRoots()) {
      const nodes = [...root.querySelectorAll("a, button, [role='button'], input[type='button'], input[type='submit']")];
      const match = nodes.find((el) => {
        const text = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim();
        return reList.some((re) => re.test(text));
      });
      if (match) {
        match.click();
        return true;
      }
    }
    return false;
  }

  return {
    sleep,
    fill,
    fillAny,
    fillFirst,
    click,
    clickAny,
    exists,
    chooseDropdown,
    fillByText,
    fillByTextAny,
    uploadResumeFromProfile,
    clickByText,
    getRoots
  };
})();
