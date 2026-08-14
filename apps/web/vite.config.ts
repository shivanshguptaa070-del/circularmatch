import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('leaflet')) return 'maps';
            if (id.includes('framer-motion')) return 'motion';
          }
        },
      },
    },
  },
})
