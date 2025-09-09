import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import os from 'os'

// Get LAN IP address
const getLanIp = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/services': resolve(__dirname, './src/services'),
      '@/store': resolve(__dirname, './src/store'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/assets': resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3008,
    host: '0.0.0.0', // Allow access from any IP
    allowedHosts: 'all', // Allow all hosts for development
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: process.env.VITE_API_URL || process.env.VITE_API_BASE_URL || `http://${getLanIp()}:4000`,
=======
        target: 'http://localhost:4000',
>>>>>>> delta
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
        timeout: 30000,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
            if (!res.headersSent) {
              res.writeHead(503, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({
                success: false,
                message: 'API Gateway unavailable',
                error: 'PROXY_ERROR'
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`Proxying: ${req.method} ${req.url} -> ${options.target}${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`Response: ${req.url} -> ${proxyRes.statusCode}`);
          });
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-icons/vsc']
  },
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom'],
          ui: ['react-icons', 'framer-motion']
        }
      }
    }
  },
  define: {
    // Define global constants for runtime
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || `http://${getLanIp()}:4000`),
    __FRONTEND_URL__: JSON.stringify(process.env.VITE_FRONTEND_URL || `http://${getLanIp()}:3008`)
  }
})
