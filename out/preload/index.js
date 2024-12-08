"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // when the frontend call the function "saveNote" with note as an arguemnt, that will invoke the function "save-note" with that note argument in the backeed
  saveNote: (note) => electron.ipcRenderer.invoke("save-note", note),
  createUser: (user) => electron.ipcRenderer.invoke("create-user", user),
  loginUser: (user) => electron.ipcRenderer.invoke("log-in", user),
  fetchNotes: () => electron.ipcRenderer.invoke("fetch-notes"),
  //session related fucntions
  saveToken: (token) => localStorage.setItem("sessionToken", token),
  getToken: () => localStorage.getItem("sessionToken"),
  clearToken: () => localStorage.removeItem("sessionToken"),
  verifySession: (token) => electron.ipcRenderer.invoke("verify-session", token)
});
console.log("Preload script loaded");
