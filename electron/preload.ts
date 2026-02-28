import { ipcRenderer, contextBridge } from 'electron'

// Expose journal API to Renderer process
contextBridge.exposeInMainWorld('journal', {
  getAll: () => ipcRenderer.invoke('entries:getAll'),
  create: (title: string, body: string, tags: string[]) =>
    ipcRenderer.invoke('entries:create', title, body, tags),
  update: (id: number, title: string, body: string, tags: string[]) =>
    ipcRenderer.invoke('entries:update', id, title, body, tags),
  delete: (id: number) => ipcRenderer.invoke('entries:delete', id),
  search: (query: string) => ipcRenderer.invoke('entries:search', query),
})

