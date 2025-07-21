import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the current directory (frontend)
  const env = loadEnv(mode, '.', '')
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.FRONTEND_PORT || '7038'),
      host: '0.0.0.0',
      cors: true
    },
    build: {
      outDir: env.FRONTEND_BUILD_OUTDIR || 'dist',
      sourcemap: env.FRONTEND_BUILD_SOURCEMAP === 'true',
      minify: env.FRONTEND_BUILD_MINIFY === 'true',
      target: env.FRONTEND_BUILD_TARGET || 'es2015'
    }
  }
}) 