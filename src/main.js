import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { runQueue } from "./runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let running = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer.html"));
}

app.whenReady().then(createWindow);

ipcMain.handle("start-apply", async (_, payload) => {
  if (running) return { ok: false, message: "Already running" };
  running = true;

  const links = String(payload.links || "")
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);

  const log = (message) => mainWindow.webContents.send("log", String(message));

  try {
    const results = await runQueue(links, {
      autoSubmit: Boolean(payload.autoSubmit),
      log
    });
    return { ok: true, results };
  } catch (error) {
    return { ok: false, message: error.message };
  } finally {
    running = false;
  }
});
