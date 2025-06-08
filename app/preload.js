// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

let lastSavedFilePath = null; // State managed within the isolated preload context

/**
 * Detects if the current environment is Electron's renderer process.
 * This is crucial for conditional behavior between web and desktop versions.
 * @returns {boolean} - True if running in Electron, false otherwise.
 */
function isElectron() {
  // Check for the presence of window.process and its type to be 'renderer'
  // This is a reliable way to detect Electron's renderer process with contextIsolation enabled.
  return (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer');
}


contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Shows a native save file dialog.
   * @param {object} [options] - Options for the dialog (e.g., filters).
   * @returns {Promise<{canceled: boolean, filePath: string | undefined}>}
   */
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  /**
   * Saves text content to a file.
   * @param {string} text - The content to save.
   * @param {string | undefined} [explicitPath] - Optional: an explicit path to save to. If not provided, tries lastSavedFilePath.
   * @returns {Promise<boolean>} - True if saved successfully, false otherwise.
   */
  saveFile: async (text, explicitPath) => {
    let filePath = explicitPath || lastSavedFilePath;
    if (!filePath) {
      window.alert('No file path specified for saving.');
      return false;
    }
    const result = await ipcRenderer.invoke('save-file', filePath, text);
    if (!result.success) {
      window.alert(`Error saving file: ${result.error}`);
    } else {
      lastSavedFilePath = filePath; // Update last saved path on successful save
    }
    return result.success;
  },

  /**
   * Shows a native open file dialog and reads the content of the selected file.
   * @returns {Promise<{data: string, shortName: string} | null>} - Object with data and shortName, or null if canceled/error.
   */
  openFile: async () => {
    const dialogResult = await ipcRenderer.invoke('show-open-dialog', {
      properties: ['openFile']
    });

    if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
      return null;
    }

    const fileName = dialogResult.filePaths[0];
    const readResult = await ipcRenderer.invoke('read-file', fileName);

    if (readResult.success) {
      lastSavedFilePath = fileName;
      const shortName = path.basename(fileName);
      return { data: readResult.data, shortName: shortName };
    } else {
      window.alert(`Error opening file: ${readResult.error}`);
      return null;
    }
  },

  /**
   * Toggles the developer tools for the current window.
   */
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),

  /**
   * Reads and returns the content of an initial file specified in command-line arguments.
   * @returns {Promise<string | null>} - The content of the file, or null if no file specified or error.
   */
  getInitialCircuitText: async () => {
    const args = await ipcRenderer.invoke('get-initial-app-arguments');
    if (args && args.length > 1) {
      const filePath = args[1]; // Assuming the file path is the second argument
      const readResult = await ipcRenderer.invoke('read-file', filePath);
      if (readResult.success) {
        lastSavedFilePath = filePath; // Set last saved path if initial file is loaded
        return readResult.data;
      } else {
        window.alert(`Error reading initial file from argument: ${readResult.error}`);
        return null;
      }
    }
    return null;
  },

  // --- New: Expose the Electron detection flag ---
  isElectron: isElectron() // Execute the function and expose its boolean result
});

// Important: Do NOT expose `fs`, `dialog`, `remote` directly to the renderer
// as it breaks contextIsolation and is a security risk.
// All functionality should go through contextBridge and IPC.