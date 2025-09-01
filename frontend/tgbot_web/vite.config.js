import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    },
    allowedHosts: [
      'https://5304975cf175.ngrok-free.app',
      'localhost',
      '.ngrok-free.app'  
    ],
    host: true
  }
})
