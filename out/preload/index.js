"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // when the frontend call the function "saveNote" with note as an arguemnt, that will invoke the function "save-note" with that note argument in the backeed
  saveNote: (note) => electron.ipcRenderer.invoke("save-note", note),
  editNote: (token, content, noteId, userId) => electron.ipcRenderer.invoke("edit-note", token, content, noteId, userId),
  editNoteName: (data) => electron.ipcRenderer.invoke("edit-noteName", data),
  deleteNote: (token, noteId, userId) => electron.ipcRenderer.invoke("delete-note", token, noteId, userId),
  createUser: (user) => electron.ipcRenderer.invoke("create-user", user),
  loginUser: (user) => electron.ipcRenderer.invoke("log-in", user),
  editProfile: (userDetails) => electron.ipcRenderer.invoke("edit-profile", userDetails),
  fetchNotes: (userId) => electron.ipcRenderer.invoke("fetch-notes", userId),
  verifyToken: (token) => electron.ipcRenderer.invoke("verify-token", token),
  logoutUser: (userId) => electron.ipcRenderer.invoke("logout-user", userId),
  uploadImg: (data) => electron.ipcRenderer.invoke("upload-img", data)
  // {token, userId, fileName, fileData}
});
console.log("Preload script loaded");
