import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBase = env.VITE_BASE_PATH || '/parent/'
  const base = rawBase === '/' ? '/' : (rawBase.endsWith('/') ? rawBase : `${rawBase}/`)
  const apiTarget = env.VITE_API_TARGET || 'https://160.187.169.41/parent/chat/'

  return {
    base,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
