import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      '/pets': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/symptoms': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/bodilyFunctions': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/istatId': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
