const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("autoApply", {
  start: (payload) => ipcRenderer.invoke("start-apply", payload),
  onLog: (callback) => ipcRenderer.on("log", (_, message) => callback(message))
});
