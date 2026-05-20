import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { runQueue } from "./runner.js";
import { loadProfile, saveProfile } from "./profile-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let running = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer.html"));
}

app.whenReady().then(createWindow);

ipcMain.handle("get-profile", async () => {
  const profile = await loadProfile(app.getPath("userData"));
  return { ok: true, profile };
});

ipcMain.handle("save-profile", async (_, profile) => {
  const filePath = await saveProfile(app.getPath("userData"), profile);
  return { ok: true, filePath };
});

ipcMain.handle("pick-resume", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select resume (PDF)",
    properties: ["openFile"],
    filters: [{ name: "Documents", extensions: ["pdf", "doc", "docx"] }]
  });
  if (result.canceled || !result.filePaths?.length) {
    return { ok: false };
  }
  return { ok: true, path: result.filePaths[0] };
});

ipcMain.handle("start-apply", async (_, payload) => {
  if (running) return { ok: false, message: "Already running" };

  const links = String(payload.links || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  if (!links.length) {
    return { ok: false, message: "Add at least one job link." };
  }

  running = true;
  const log = (message) => mainWindow?.webContents.send("log", String(message));

  try {
    const profile = payload.profile || (await loadProfile(app.getPath("userData")));
    profile.autoSubmit = Boolean(payload.autoSubmit);

    const results = await runQueue(links, {
      profile,
      autoSubmit: profile.autoSubmit,
      log
    });
    return { ok: true, results };
  } catch (error) {
    return { ok: false, message: error.message };
  } finally {
    running = false;
  }
});
