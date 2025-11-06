import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.itbook.store',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // Rewrite /api/search/javascript to /1.0/search/javascript
          // Rewrite /api/books/123456 to /1.0/books/123456
          return path.replace(/^\/api/, '/1.0');
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add headers that might help avoid 403
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Referer', 'https://api.itbook.store/');
            console.log('Proxying request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
          });
        },
      },
    },
  },
})
