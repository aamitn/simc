import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static', 
  //outDir: '../site', //Custom build output directory 
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