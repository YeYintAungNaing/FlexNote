// import { contextBridge } from 'electron'

// if (!process.contextIsolated) {
//   throw new Error('CentextIsolated must be enabled in teh BrowserWindow')
// }

// try {
//   contextBridge.exposeInMainWorld('context', {
//     //todo
//   })
// } catch (e) {
//   console.error(e)
// }


import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // when the frontend call the function "saveNote" with note as an arguemnt, that will invoke the function "save-note" with that note argument in the backeed
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  createUser: (user) => ipcRenderer.invoke('create-user', user),
  loginUser: (user) => ipcRenderer.invoke('log-in', user),
  fetchNotes: () => ipcRenderer.invoke('fetch-notes'),

  //session related fucntions
  saveToken : (token) => localStorage.setItem('sessionToken', token),
  getToken: () => localStorage.getItem('sessionToken'),
  clearToken: () => localStorage.removeItem('sessionToken'),

   verifySession: (token) => ipcRenderer.invoke('verify-session', token)
 });

console.log('Preload script loaded');
