import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// import { serverHelpers } from 'astro/dist/runtime/client/dev-toolbar/helpers'; // This import seems unused and potentially problematic, can be removed.

export default defineConfig({
  output: 'static',
  outDir: '../site', //build utput directory
  integrations: [
    tailwind(),
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5000
  },
  vite: {
    envPrefix: 'GITHUB_',
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', 'gsap/TextPlugin']
    },
    server: { // Add this server object inside vite
      allowedHosts: true // Allow all hosts
    }
  }
});