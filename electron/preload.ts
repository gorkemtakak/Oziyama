import { contextBridge } from 'electron';

// Expose safe APIs to the Angular app if needed
contextBridge.exposeInMainWorld('electronAPI', {
  // We can add SQLite or other node-specific APIs here later
  ping: () => console.log('pong')
});
