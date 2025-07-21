import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified Vite config for better build compatibility
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7038,
    host: '0.0.0.0',
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false,
    target: 'es2015'
  }
}) 