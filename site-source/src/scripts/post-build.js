const fs = require('fs-extra');
const path = require('path');

const sourcePath = path.join(__dirname, '..', '..', 'dist');
const targetPath = path.join(__dirname, '..', '..', '..', 'site');

async function copyBuildFiles() {
  try {
    // Check if source directory exists
    if (!await fs.pathExists(sourcePath)) {
      throw new Error(`Source directory not found: ${sourcePath}`);
    }

    // Ensure target directory exists, create if not
    const targetExists = await fs.pathExists(targetPath);
    if (!targetExists) {
      console.log(`Target directory not found Creating it: ${targetPath}`);
      await fs.ensureDir(targetPath);
    }


    // Copy files from dist to target
    await fs.copy(sourcePath, targetPath, {
      overwrite: true,
      errorOnExist: false,
      filter: (src) => {
        // Add any files you want to exclude from copying here
        return true;
      }
    });

    console.log('Build files copied successfully to', targetPath);
  } catch (err) {
    console.error('Error copying build files:', err);
    process.exit(1);
  }
}

copyBuildFiles();