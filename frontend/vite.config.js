import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'  // or react, etc.

export default defineConfig({
  base: '/myapp/',   // <--- this must match your URL path
  plugins: [vue()]
})
