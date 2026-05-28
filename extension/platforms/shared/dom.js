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

  function setNativeValue(el, value, { blur = true } = {}) {
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
    if (blur) el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function pressKey(el, key) {
    const keyCode = key === "Enter" ? 13 : key === "ArrowDown" ? 40 : 0;
    const init = { key, code: key, keyCode, bubbles: true, cancelable: true };
    el.dispatchEvent(new KeyboardEvent("keydown", init));
    if (key === "Enter") {
      el.dispatchEvent(new KeyboardEvent("keypress", { ...init, charCode: 13 }));
    }
    el.dispatchEvent(new KeyboardEvent("keyup", init));
  }

  function promptIsFilled(container) {
    const selected = (container?.querySelector('[data-automation-id="promptSelectionLabel"]')?.innerText || "").trim();
    if (selected) return true;
    const hint = (container?.querySelector('[data-automation-id="promptAriaInstruction"]')?.innerText || "").toLowerCase();
    return hint.length > 0 && !hint.includes("0 items selected") && hint !== "minimized";
  }

  function findVisiblePromptOptions() {
    const selectors = ['[role="listbox"] [role="option"]', '[data-automation-id="promptOption"]', '[role="option"]'];
    for (const root of getRoots()) {
      for (const sel of selectors) {
        const options = [...root.querySelectorAll(sel)].filter((el) => {
          const text = (el.innerText || el.textContent || "").trim();
          if (!text) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        if (options.length) return options;
      }
    }
    return [];
  }

  async function choosePromptSearch(selectors, searchText, { labelKeywords } = {}) {
    const selList = Array.isArray(selectors) ? selectors : [selectors];
    const query = String(searchText || "").trim();
    if (!query) return false;
    const labelList = labelKeywords
      ? Array.isArray(labelKeywords)
        ? labelKeywords
        : [labelKeywords]
      : [];

    for (const root of getRoots()) {
      let input = null;
      for (const sel of selList) {
        input = root.querySelector(sel);
        if (input) break;
      }
      if (!input && labelList.length) {
        for (const label of root.querySelectorAll("label")) {
          const text = (label.innerText || "").toLowerCase();
          if (!labelList.some((k) => text.includes(String(k).toLowerCase()))) continue;
          const forId = label.getAttribute("for");
          if (!forId) continue;
          input = root.querySelector(`#${CSS.escape(forId)}`);
          if (input) break;
        }
      }
      if (!input) continue;

      const container = input.closest('[data-automation-id="multiSelectContainer"]');
      if (promptIsFilled(container)) return true;

      const expandBtn =
        container?.querySelector('[data-automation-id="promptSearchButton"]') ||
        container?.querySelector('[data-automation-id="promptIcon"]');
      expandBtn?.click();
      await sleep(300);

      input.focus();
      input.click();
      await sleep(150);
      setNativeValue(input, query, { blur: false });
      await sleep(700);
      pressKey(input, "ArrowDown");
      await sleep(150);
      pressKey(input, "Enter");
      await sleep(400);

      if (promptIsFilled(container)) return true;
      const option = findVisiblePromptOptions()[0];
      if (option) {
        option.click();
        await sleep(300);
        if (promptIsFilled(container)) return true;
      }
    }
    return false;
  }

  async function typeIntoField(el, value) {
    const str = String(value);
    el.focus();
    el.click();
    await sleep(80);

    try {
      el.select();
      document.execCommand("selectAll", false, null);
      document.execCommand("delete", false, null);
      document.execCommand("insertText", false, str);
    } catch {
      /* execCommand unavailable */
    }

    if ((el.value || "") !== str) {
      setNativeValue(el, str, { blur: false });
    }

    if ((el.value || "") !== str) {
      setNativeValue(el, "", { blur: false });
      for (const ch of str) {
        setNativeValue(el, el.value + ch, { blur: false });
        el.dispatchEvent(
          new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: ch })
        );
        await sleep(20);
      }
    }

    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    await sleep(120);
    return Boolean((el.value || "").trim());
  }

  async function fillInput(selectors, value) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    const values = (Array.isArray(value) ? value : [value]).filter(
      (v) => v !== undefined && v !== null && String(v).trim() !== ""
    );
    if (!values.length) return false;

    for (const root of getRoots()) {
      for (const sel of list) {
        const el = root.querySelector(sel);
        if (!el) continue;
        for (const v of values) {
          if (await typeIntoField(el, v)) return true;
        }
      }
    }
    return false;
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

  function checkAny(selector) {
    for (const root of getRoots()) {
      const el = root.querySelector(selector);
      if (!el) continue;
      if (el.checked) return true;
      el.click();
      if (el.id) root.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.click();
      return Boolean(el.checked);
    }
    return false;
  }

  function exists(selector) {
    return queryInAllRoots(selector).length > 0;
  }

  function chooseRadio({ name, value, labelText, legendKeywords } = {}) {
    const legendList = legendKeywords
      ? Array.isArray(legendKeywords)
        ? legendKeywords
        : [legendKeywords]
      : [];

    function clickRadio(root, input) {
      if (!input) return false;
      if (!input.checked) {
        input.click();
        if (input.id) root.querySelector(`label[for="${CSS.escape(input.id)}"]`)?.click();
      }
      return true;
    }

    function findByLabel(root, radios, text) {
      const want = String(text).toLowerCase();
      return radios.find((r) => {
        if (!r.id) return false;
        const lbl = root.querySelector(`label[for="${CSS.escape(r.id)}"]`);
        const t = (lbl?.innerText || "").trim().toLowerCase();
        return t === want;
      });
    }

    for (const root of getRoots()) {
      if (name) {
        const radios = [...root.querySelectorAll(`input[type="radio"][name="${name}"]`)];
        const target =
          value !== undefined
            ? radios.find((r) => r.value === String(value))
            : labelText
              ? findByLabel(root, radios, labelText)
              : null;
        if (clickRadio(root, target)) return true;
      }

      if (legendList.length && labelText) {
        for (const legend of root.querySelectorAll("legend label, legend")) {
          const text = (legend.innerText || "").toLowerCase();
          if (!legendList.some((k) => text.includes(String(k).toLowerCase()))) continue;
          const group = legend.closest("fieldset, [role='group']");
          if (!group) continue;
          const target = findByLabel(root, [...group.querySelectorAll('input[type="radio"]')], labelText);
          if (clickRadio(root, target)) return true;
        }
      }
    }
    return false;
  }

  function dropdownShowsValue(btn, value) {
    const current = (btn.innerText || btn.textContent || btn.getAttribute("aria-label") || "").toLowerCase();
    const want = String(value).toLowerCase();
    return current.includes(want);
  }

  function findListOption(root, value) {
    return [...root.querySelectorAll('[role="option"], li, [data-automation-id*="option"]')].find((o) => {
      const text = (o.innerText || o.textContent || "").trim().toLowerCase();
      const want = String(value).toLowerCase();
      return text === want || text.startsWith(`${want} `) || text.includes(want);
    });
  }

  function findListOptionAnywhere(value) {
    for (const root of getRoots()) {
      const option = findListOption(root, value);
      if (option) return option;
    }
    return null;
  }

  function findDropdownSearchInput() {
    for (const root of getRoots()) {
      if (root.activeElement?.tagName === "INPUT") return root.activeElement;
      const search = root.querySelector(
        '[role="listbox"] input, [data-automation-id="searchBox"], input[placeholder*="Search" i]'
      );
      if (search) return search;
    }
    return null;
  }

  async function chooseDropdown(selector, value) {
    const selectors = Array.isArray(selector) ? selector : [selector];
    const values = (Array.isArray(value) ? value : [value]).filter(
      (v) => v !== undefined && v !== null && v !== ""
    );
    if (!values.length) return false;

    for (const root of getRoots()) {
      for (const sel of selectors) {
        const btn = root.querySelector(sel);
        if (!btn) continue;

        if (values.some((v) => dropdownShowsValue(btn, v))) return true;

        for (const pick of values) {
          btn.click();
          await sleep(350);
          const search = findDropdownSearchInput();
          if (search && (search.tagName === "INPUT" || search.getAttribute("role") === "combobox")) {
            setNativeValue(search, String(pick), { blur: false });
            await sleep(400);
            search.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
          }
          await sleep(200);
          const option = findListOptionAnywhere(pick);
          if (option) {
            option.click();
            await sleep(200);
            if (dropdownShowsValue(btn, pick)) return true;
          }
        }
      }
    }
    return false;
  }

  function fillByText(keywords, value, root = document) {
    if (!value) return false;
    const list = Array.isArray(keywords) ? keywords : [keywords];
    const fields = [...root.querySelectorAll("input, textarea, select")];
    for (const field of fields) {
      if (field.type === "hidden" || field.disabled) continue;
      if (field.closest('[aria-labelledby="previousWorker-section"], [data-fkit-id^="previousWorker"]')) continue;
      if (field.getAttribute("data-uxi-widget-type") === "selectinput") continue;
      if (/countryPhoneCode|phoneType/i.test(field.id || field.name || "")) continue;
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
    fillInput,
    fillAny,
    fillFirst,
    click,
    clickAny,
    checkAny,
    exists,
    chooseDropdown,
    chooseRadio,
    choosePromptSearch,
    fillByText,
    fillByTextAny,
    uploadResumeFromProfile,
    clickByText,
    getRoots
  };
})();
