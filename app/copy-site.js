const fs = require('fs-extra');
const path = require('path');

// Define the source directory (where your Gradle output 'site' folder is)
// Assuming 'site' is one directory up from your Electron project root.
// Adjust this path if your Gradle output is located elsewhere relative to this script.
const sourceDir = path.join(__dirname, '..', 'site');

// Define the destination directory (inside your Electron project where you want 'site' to be)
const destinationDir = path.join(__dirname, 'site');

// Define the path to circuitjs.html within the destination directory
const destinationHtmlFile = path.join(destinationDir, 'circuitjs.html');

console.log(`[Copy Task] Source directory: ${sourceDir}`);
console.log(`[Copy Task] Destination directory: ${destinationDir}`);
console.log(`[Copy Task] Checking for existing HTML file: ${destinationHtmlFile}`);

// --- Step 1: Check if the source directory (Gradle output) actually exists ---
if (!fs.existsSync(sourceDir)) {
  console.error(`[Copy Task ERROR] Source directory not found: ${sourceDir}`);
  console.error(`Please ensure your Main Root Gradle project has compiled the 'site' directory.`);
  console.error(`If not, run following commands in project root \n \"gradle compileGwt --console verbose --info\" \n \"gradle makeSite --console verbose --info\" \n to generate it.`);
  process.exit(1); // Exit with an error code if source is missing
}

// --- Step 2: Determine if copying is needed based on destination content ---
let shouldCopy = false;

if (!fs.existsSync(destinationDir)) {
  // If destination directory doesn't exist, we definitely need to copy.
  console.log(`[Copy Task] Destination directory does not exist. Copying is required.`);
  shouldCopy = true;
} else if (!fs.existsSync(destinationHtmlFile)) {
  // If destination directory exists but circuitjs.html is missing inside it,
  // we need to copy (which will overwrite/update the directory).
  console.log(`[Copy Task] ${destinationHtmlFile} not found in destination. Copying is required.`);
  shouldCopy = true;
} else {
  // Both destination directory and circuitjs.html exist, no copying needed.
  console.log(`[Copy Task] ${destinationHtmlFile} already exists in destination. Skipping copy.`);
}

// --- Step 3: Perform copy operation if needed ---
if (shouldCopy) {
  try {
    // If copying is needed and the destination directory already exists, remove it first
    // to ensure a clean and complete copy of the latest 'site' content.
    if (fs.existsSync(destinationDir)) {
      console.log(`[Copy Task] Removing existing destination directory for a clean copy: ${destinationDir}`);
      fs.removeSync(destinationDir);
    }

    console.log(`[Copy Task] Copying from ${sourceDir} to ${destinationDir}`);
    fs.copySync(sourceDir, destinationDir);
    console.log('[Copy Task] Site directory copied successfully!');
  } catch (err) {
    console.error(`[Copy Task ERROR] Failed to copy site directory:`, err);
    process.exit(1); // Exit with an error code on copy error
  }
}
