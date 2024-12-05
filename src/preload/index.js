import { contextBridge } from 'electron'
//import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer

if (!process.contextIsolated) {
  throw new Error('CentextIsolated must be enabled in teh BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('context', {
    //todo
  })
} catch (e) {
  console.error(e)
}
