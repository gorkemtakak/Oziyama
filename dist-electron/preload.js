"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose safe APIs to the Angular app if needed
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // We can add SQLite or other node-specific APIs here later
    ping: () => console.log('pong')
});
