import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'nuaibria.tfour.net',
      '.tfour.net' // Allow all tfour.net subdomains
    ],
    hmr: {
      host: 'localhost'
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
})