import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxyTarget = process.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

const config: UserConfig = defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'nuaibria.tfour.net',
      '.tfour.net' // Allow all tfour.net subdomains
    ],
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    hmr: {
      // Auto-detect: use wss for HTTPS, ws for HTTP
      clientPort: 3000
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'localhost',
      'nuaibria.tfour.net',
      '.tfour.net'
    ]
  }
});

export default config;
