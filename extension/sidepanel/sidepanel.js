const $ = (sel) => document.querySelector(sel);
const form = $("#profileForm");
const logEl = $("#log");
const pageStatus = $("#pageStatus");

let workexperiences = [];

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.view === name);
  });
  $(`#view-${name}`).classList.add("active");
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showView(tab.dataset.view));
});

function log(msg) {
  logEl.textContent += `${msg}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function renderWork() {
  const root = $("#workList");
  root.innerHTML = "";
  workexperiences.forEach((w, i) => {
    const block = document.createElement("div");
    block.className = "work-block";
    block.innerHTML = `
      <div class="work-block-head">
        <strong>Job ${i + 1}</strong>
        <button type="button" class="secondary remove-work" data-i="${i}">Remove</button>
      </div>
      <div class="grid">
        <label>Job title<input data-i="${i}" data-f="jobtitle" value="${esc(w.jobtitle)}" /></label>
        <label>Company<input data-i="${i}" data-f="company" value="${esc(w.company)}" /></label>
        <label class="span2">Location<input data-i="${i}" data-f="location" value="${esc(w.location)}" /></label>
        <label>Start month<input data-i="${i}" data-f="startDateMonth" placeholder="05" value="${esc(w.startDateMonth)}" /></label>
        <label>Start year<input data-i="${i}" data-f="startDateYear" placeholder="2020" value="${esc(w.startDateYear)}" /></label>
        <label>End month<input data-i="${i}" data-f="endDateMonth" placeholder="06" value="${esc(w.endDateMonth)}" /></label>
        <label>End year<input data-i="${i}" data-f="endDateYear" placeholder="2024" value="${esc(w.endDateYear)}" /></label>
        <label class="span2">Description<textarea data-i="${i}" data-f="description">${esc(w.description)}</textarea></label>
      </div>
    `;
    root.appendChild(block);
  });

  root.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      const i = +el.dataset.i;
      workexperiences[i][el.dataset.f] = el.value;
    });
  });

  root.querySelectorAll(".remove-work").forEach((btn) => {
    btn.addEventListener("click", () => {
      workexperiences.splice(+btn.dataset.i, 1);
      if (!workexperiences.length) addEmptyWork();
      renderWork();
    });
  });
}

function addEmptyWork() {
  workexperiences.push({
    jobtitle: "",
    company: "",
    location: "",
    startDateMonth: "",
    startDateYear: "",
    endDateMonth: "",
    endDateYear: "",
    description: ""
  });
}

function readForm() {
  const fd = new FormData(form);
  const profile = {};
  for (const [k, v] of fd.entries()) profile[k] = String(v).trim();
  profile.skills = (profile.skillsText || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  delete profile.skillsText;
  profile.autoSubmit = $("#autoSubmit").checked;
  profile.workexperiences = workexperiences.map((w) => ({ ...w }));
  return profile;
}

function fillForm(profile) {
  for (const el of form.querySelectorAll("input[name]")) {
    if (el.name === "skillsText") {
      el.value = Array.isArray(profile.skills) ? profile.skills.join(", ") : "";
    } else {
      el.value = profile[el.name] ?? "";
    }
  }
  $("#autoSubmit").checked = Boolean(profile.autoSubmit);
  $("#resumeName").textContent = profile.resumeFileName || "No file chosen";

  workexperiences = Array.isArray(profile.workexperiences)
    ? profile.workexperiences.map((w) => ({ ...w }))
    : [];
  if (!workexperiences.length) addEmptyWork();
  renderWork();
}

async function loadProfile() {
  const { profile } = await chrome.storage.local.get("profile");
  if (profile) fillForm(profile);
  else {
    addEmptyWork();
    renderWork();
  }
}

async function saveProfile() {
  const existing = (await chrome.storage.local.get("profile")).profile || {};
  const profile = {
    ...existing,
    ...readForm(),
    resumeBase64: existing.resumeBase64 || "",
    resumeFileName: existing.resumeFileName || ""
  };
  if (!profile.fullName && profile.firstName) {
    profile.fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  }
  await chrome.storage.local.set({ profile });
  return profile;
}

async function fileToBase64(file) {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function getJobTab() {
  const win = await chrome.windows.getLastFocused({ windowTypes: ["normal"] });
  if (!win?.id) return null;
  const [tab] = await chrome.tabs.query({ active: true, windowId: win.id });
  return tab;
}

async function updatePageStatus() {
  const tab = await getJobTab();
  if (!tab?.id) {
    pageStatus.textContent = "No browser tab";
    pageStatus.classList.add("warn");
    $("#applyBtn").disabled = true;
    return null;
  }

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { action: "ping" });
    const ok = res?.platform === "workday" || res?.platform === "icims";
    pageStatus.textContent = ok
      ? `${res.platform === "workday" ? "Workday" : "iCIMS"} — ready`
      : "Open Workday or iCIMS in main window";
    pageStatus.classList.toggle("warn", !ok);
    $("#applyBtn").disabled = !ok;
    return tab;
  } catch {
    pageStatus.textContent = "Refresh the job page";
    pageStatus.classList.add("warn");
    $("#applyBtn").disabled = true;
    return tab;
  }
}

$("#addWork").addEventListener("click", () => {
  addEmptyWork();
  renderWork();
});

$("#resumeFile").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const profile = await saveProfile();
  profile.resumeBase64 = await fileToBase64(file);
  profile.resumeFileName = file.name;
  await chrome.storage.local.set({ profile });
  $("#resumeName").textContent = file.name;
});

$("#saveBtn").addEventListener("click", async () => {
  await saveProfile();
  const btn = $("#saveBtn");
  const prev = btn.textContent;
  btn.textContent = "Saved";
  setTimeout(() => { btn.textContent = prev; }, 1500);
});

$("#clearLog").addEventListener("click", () => {
  logEl.textContent = "";
});

$("#applyBtn").addEventListener("click", async () => {
  const tab = await getJobTab();
  if (!tab?.id) {
    showView("log");
    log("No active job tab.");
    return;
  }

  showView("log");
  logEl.textContent = "";
  const profile = await saveProfile();
  const btn = $("#applyBtn");
  btn.disabled = true;
  log("Filling application in main tab…");

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { action: "apply", profile });
    if (res?.ok) {
      log(`Done: ${res.result?.status || "ok"}`);
      (res.logs || []).forEach((l) => log(l));
    } else {
      log(res?.message || "Failed — refresh the job page.");
    }
  } catch (err) {
    log(`Error: ${err.message}`);
  } finally {
    await updatePageStatus();
  }
});

chrome.tabs.onActivated.addListener(() => updatePageStatus());
chrome.tabs.onUpdated.addListener((_id, info) => {
  if (info.status === "complete" || info.url) updatePageStatus();
});

loadProfile();
updatePageStatus();
