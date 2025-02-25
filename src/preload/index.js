import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // when the frontend call the function "saveNote" with note as an arguemnt, that will invoke the function "save-note" with that note argument in the backeed
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  editNote: (token, content, noteId, userId) => ipcRenderer.invoke('edit-note', token, content, noteId, userId),
  editNoteName: (data) => ipcRenderer.invoke('edit-noteName', data),
  deleteNote: (token, noteId, userId) => ipcRenderer.invoke('delete-note',token, noteId, userId),
  createUser: (user) => ipcRenderer.invoke('create-user', user),
  loginUser: (user) => ipcRenderer.invoke('log-in', user),
  editProfile : (userDetails) => ipcRenderer.invoke('edit-profile', userDetails),
  fetchNotes: (userId) => ipcRenderer.invoke('fetch-notes', userId),
  verifyToken: (token) => ipcRenderer.invoke('verify-token', token),
  logoutUser: (userId) => ipcRenderer.invoke('logout-user', userId), 
  uploadImg : (data) => ipcRenderer.invoke('upload-img', data), // {token, userId, fileName, fileData},
  getUserImg : (data) => ipcRenderer.invoke('get-userImg', data),
  createLog : (data) => ipcRenderer.invoke('create-log', data),
  getLog : (userDetails) => ipcRenderer.invoke('get-log', userDetails)
 });

console.log('Preload script loaded');
