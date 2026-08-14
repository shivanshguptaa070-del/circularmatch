import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',  // Bind to loopback only — do not expose dev server to LAN
    port: 5173,
    // 'auto' allows only localhost/127.0.0.1. Previously `true` (any host)
    // which allows DNS rebinding attacks where an attacker tricks the browser
    // into making requests to the dev server from a malicious page.
    allowedHosts: 'auto',
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
