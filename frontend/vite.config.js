import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 3000
    },
    cors: {
      origin: ['http://localhost:3000', 'https://nuaibria.tfour.net'],
      credentials: true
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: {
      origin: ['http://localhost:3000', 'https://nuaibria.tfour.net'],
      credentials: true
    }
  }
})