"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("journal", {
  getAll: () => electron.ipcRenderer.invoke("entries:getAll"),
  getByDate: (date) => electron.ipcRenderer.invoke("entries:getByDate", date),
  getDates: () => electron.ipcRenderer.invoke("entries:getDates"),
  getByType: (type) => electron.ipcRenderer.invoke("entries:getByType", type),
  create: (title, body, tags, type, visibility) => electron.ipcRenderer.invoke("entries:create", title, body, tags, type, visibility),
  update: (id, title, body, tags, type, visibility) => electron.ipcRenderer.invoke("entries:update", id, title, body, tags, type, visibility),
  delete: (id) => electron.ipcRenderer.invoke("entries:delete", id),
  search: (query) => electron.ipcRenderer.invoke("entries:search", query)
});
