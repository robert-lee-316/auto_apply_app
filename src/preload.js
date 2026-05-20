const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("autoApply", {
  start: (payload) => ipcRenderer.invoke("start-apply", payload),
  getProfile: () => ipcRenderer.invoke("get-profile"),
  saveProfile: (profile) => ipcRenderer.invoke("save-profile", profile),
  pickResume: () => ipcRenderer.invoke("pick-resume"),
  onLog: (callback) => ipcRenderer.on("log", (_, message) => callback(message))
});
