/**
 * Utility functions for interacting with GitHub API
 */

/**
 * Fetches the latest release information for a GitHub repository
 * @param {string} owner - The repository owner
 * @param {string} repo - The repository name
 * @returns {Promise<Object>} The latest release data
 */

// Create headers based on token availability
function getHeaders() {
  const token = import.meta.env.GITHUB_PAT;
  if (token && token.length > 0) {
    console.log('Using AUTHENTICATED GitHub API token for authentication');
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json'
    };
  }
  console.log('Using UNAUTHENTICATED request to GitHub API');
  return {
    Accept: 'application/vnd.github.v3+json'
  };
}

export async function getLatestRelease(owner, repo) {
  try {
    // First try with headers
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      { headers: getHeaders() }
    );
    
    if (response.status === 401 || response.status === 403) {
      // Token might be invalid, try without authentication
      console.warn('GitHub API token invalid or rate limited, falling back to unauthenticated request');
      const fallbackResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      
      if (!fallbackResponse.ok) {
        throw new Error(`GitHub API error: ${fallbackResponse.status}`);
      }
      
      return await fallbackResponse.json();
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest release:', error);
    return null;
  }
}


/**
 * Fetches the repository information
 * @param {string} owner - The repository owner
 * @param {string} repo - The repository name
 * @returns {Promise<Object>} The repository data
 */

export async function getRepoInfo(owner, repo) {
  try {
    // First try with headers
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: getHeaders() }
    );
    
    if (response.status === 401 || response.status === 403) {
      // Token might be invalid, try without authentication
      console.warn('GitHub API token invalid or rate limited, falling back to unauthenticated request');
      const fallbackResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      
      if (!fallbackResponse.ok) {
        throw new Error(`GitHub API error: ${fallbackResponse.status}`);
      }
      
      return await fallbackResponse.json();
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching repo info:', error);
    return null;
  }
}

/**
 * Extracts and formats the version number from a release tag
 * @param {string} tag - The release tag (e.g., "v1.2.0")
 * @returns {string} The formatted version number
 */
export function formatVersion(tag) {
  // Remove the 'v' prefix if present
  return tag.startsWith('v') ? tag.substring(1) : tag;
}

/**
 * Formats a date string in a more readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}


/**
 * Categorizes release assets by platform
 * @param {Array} assets - Release assets from GitHub API
 * @returns {Object} Categorized downloads by platform
 */
export function categorizeDownloads(assets) {
  const downloads = {
    windows: [],
    linux: [],
    mac: []
  };

  assets.forEach(asset => {
    const name = asset.name.toLowerCase();

    if (name.includes('.exe') || name.includes('.msi') || 
        name.includes('.appx') || name.includes('-win32') ||
        name.includes('.nupkg')) {
      downloads.windows.push({
        name: asset.name,
        url: asset.browser_download_url,
        size: formatFileSize(asset.size),
        type: getWindowsType(name)
      });
    } 
    else if (name.includes('.rpm') || name.includes('.deb') || 
             name.includes('-linux')) {
      downloads.linux.push({
        name: asset.name,
        url: asset.browser_download_url,
        size: formatFileSize(asset.size),
        type: getLinuxType(name)
      });
    }
    else if (name.includes('.dmg') || name.includes('-darwin')) {
      downloads.mac.push({
        name: asset.name,
        url: asset.browser_download_url,
        size: formatFileSize(asset.size),
        type: getMacType(name)
      });
    }
  });

  return downloads;
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getWindowsType(filename) {
  if (filename.includes('.exe')) return 'Setup';
  if (filename.includes('.msi')) return 'MSI';
  if (filename.includes('.appx')) return 'Appx - Store';
  if (filename.includes('.nupkg')) return 'NuGet Package';
  if (filename.includes('-win32')) return 'Portable ZIP';
  return 'Windows Package';
}

function getLinuxType(filename) {
  if (filename.includes('.rpm')) return 'RPM Package';
  if (filename.includes('.deb')) return 'DEB Package';
  if (filename.includes('-linux')) return 'Portable ZIP';
  return 'Linux Package';
}

function getMacType(filename) {
  if (filename.includes('.dmg')) return 'DMG Installer';
  if (filename.includes('-darwin')) return 'Portable ZIP';
  return 'macOS Package';
}