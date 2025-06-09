const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icons/icon', // no file extension required
  },
  rebuildConfig: {},
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'aamitn',
          name: 'simc'
        },
        prerelease: false,
        tagPrefix: 'v',
        draft: false,
        generateReleaseNotes: true,
     // authToken: 'process.env.GITHUB_TOKEN '// Use this only for custom tokens GitHub token for authentication other than Default [GITHUB_TOKEN] 
      }
    }
  ],
  makers: [
   {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://gitlab.com/aamitn/assets/-/raw/main/ico/icon.ico', //TODO: An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
        setupIcon: './icons/icon.ico' // The ICO file to use as the icon for the generated Setup.exe
        //certificateFile: './cert.pfx',
        //certificatePassword: process.env.CERT_PASS
      },
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        language: 1033,
        manufacturer: 'Bitmutex Technologies'
      }
    },
    {
      name: '@electron-forge/maker-appx',
      config: {
        publisher: 'CN=Bitmutex Technologies',
        devCert: './cert.pfx',
        certPass: process.env.CERT_PASS_WIN
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './icons/icon.png',
          maintainer: 'Bitmutex Technologies',
          homepage: 'https://bitmutex.com'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: './icons/icon.png',
          homepage: 'https://bitmutex.com'
        }
      },
    },

    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './icons/icon.icns',
        background: '../war/ogbanner.png',
        format: 'ULFO'
      }
    },
   /* {
      name: '@electron-forge/maker-pkg',
      config: {
      icon: './icons/icon.icns',
      keychain: 'my-secret-ci-keychain'
      }
    },*/
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
