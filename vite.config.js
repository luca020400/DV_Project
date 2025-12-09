import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/DV_Project/',
  build: {
    sourcemap: true,
  },
  plugins: [
    react()
  ],
}))
