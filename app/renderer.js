
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// renderer.js

// Example: Get references to your HTML elements (assuming you have them)
const editorElement = document.getElementById('circuit-editor'); // Replace with your actual editor element ID
const saveButton = document.getElementById('save-button');
const openButton = document.getElementById('open-button');
const devToolsButton = document.getElementById('dev-tools-button');

// Function to set the window title (optional, but good practice when opening/saving files)
function setWindowTitle(title) {
    document.title = title ? `CircuitJS - ${title}` : 'CircuitJS';
}

// --- Event Listeners for UI interaction ---

if (saveButton) {
    saveButton.addEventListener('click', async () => {
        const textToSave = editorElement ? editorElement.value : '';
        if (!textToSave) {
            alert('Nothing to save.');
            return;
        }

        // Show save dialog. This will typically prompt the user for a new file path
        // if lastSavedFilePath is null, or confirm overwrite if it's set.
        const dialogResult = await window.electronAPI.showSaveDialog({
            title: 'Save Circuit',
            filters: [{ name: 'Circuit Files', extensions: ['cct', 'txt'] }, { name: 'All Files', extensions: ['*'] }]
        });

        if (!dialogResult.canceled && dialogResult.filePath) {
            const success = await window.electronAPI.saveFile(textToSave, dialogResult.filePath);
            if (success) {
                console.log(`File saved to: ${dialogResult.filePath}`);
                setWindowTitle(path.basename(dialogResult.filePath)); // Update title
            }
        }
    });
}

if (openButton) {
    openButton.addEventListener('click', async () => {
        const fileData = await window.electronAPI.openFile();
        if (fileData) {
            if (editorElement) {
                editorElement.value = fileData.data;
            }
            console.log(`Opened file: ${fileData.shortName}`);
            setWindowTitle(fileData.shortName); // Update window title
        }
    });
}

if (devToolsButton) {
    devToolsButton.addEventListener('click', () => {
        window.electronAPI.toggleDevTools();
    });
}

// --- Initial Content Loading ---

document.addEventListener('DOMContentLoaded', async () => {
    const initialText = await window.electronAPI.getInitialCircuitText();

    if (initialText) {
        if (editorElement) {
            editorElement.value = initialText;
        }
        // If you need the short name for the initial file, you'd have to
        // get it from the main process or calculate it here based on the
        // initial file path passed in the arguments.
        // For simplicity, we'll just set a generic title or rely on later save/open to set it.
        setWindowTitle('Initial File Loaded');
    } else {
        setWindowTitle(''); // Set default title if no initial file
    }
});

// Polyfill path.basename if needed (not strictly Electron, but useful if you
// need it in renderer and don't bundle a full Node.js path module)
// For most modern Electron apps, the preload script handles this using Node's path.
// If you need path.basename in the renderer directly, you'd usually import a browser-compatible
// module or implement a simple version.
const path = {
    basename: (filePath) => {
        if (!filePath) return '';
        const lastSlash = filePath.lastIndexOf('/');
        const lastBackslash = filePath.lastIndexOf('\\');
        const lastIndex = Math.max(lastSlash, lastBackslash);
        return filePath.substring(lastIndex + 1);
    }
};