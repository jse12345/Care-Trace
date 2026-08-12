import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 0.0.0.0 - 같은 네트워크(AP)의 다른 PC에서 접속 허용
    port: 5173
  }
})
