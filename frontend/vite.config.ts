import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7008,
    host: '0.0.0.0',
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 