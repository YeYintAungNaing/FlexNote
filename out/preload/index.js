"use strict";
const electron = require("electron");
if (!process.contextIsolated) {
  throw new Error("CentextIsolated must be enabled in teh BrowserWindow");
}
try {
  electron.contextBridge.exposeInMainWorld("context", {
    //todo
  });
} catch (e) {
  console.error(e);
}
