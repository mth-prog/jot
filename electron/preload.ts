import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('journal', {
  getAll:    ()                                                                   => ipcRenderer.invoke('entries:getAll'),
  getByDate: (date: string)                                                       => ipcRenderer.invoke('entries:getByDate', date),
  getDates:  ()                                                                   => ipcRenderer.invoke('entries:getDates'),
  create:    (title: string, body: string, tags: string[], visibility?: string)  => ipcRenderer.invoke('entries:create', title, body, tags, visibility),
  update:    (id: number, title: string, body: string, tags: string[], visibility?: string) => ipcRenderer.invoke('entries:update', id, title, body, tags, visibility),
  delete:    (id: number)                                                         => ipcRenderer.invoke('entries:delete', id),
  search:    (query: string)                                                      => ipcRenderer.invoke('entries:search', query),
})

