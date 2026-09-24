import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom middleware to stream binary .exe setup installers cleanly over HTTP
const exeServerPlugin = () => ({
  name: 'exe-file-server',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const urlPath = req.url ? req.url.split('?')[0] : '';
      if (urlPath === '/Nexcart-POS-Setup-v1.0.exe' || urlPath.endsWith('.exe')) {
        const filePath = path.join(process.cwd(), 'public', 'Nexcart-POS-Setup-v1.0.exe');
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="Nexcart-POS-Setup-v1.0.exe"',
            'Cache-Control': 'no-cache'
          });
          const readStream = fs.createReadStream(filePath);
          readStream.pipe(res);
          return;
        }
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const urlPath = req.url ? req.url.split('?')[0] : '';
      if (urlPath === '/Nexcart-POS-Setup-v1.0.exe' || urlPath.endsWith('.exe')) {
        const filePath = path.join(process.cwd(), 'dist', 'Nexcart-POS-Setup-v1.0.exe');
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="Nexcart-POS-Setup-v1.0.exe"',
            'Cache-Control': 'no-cache'
          });
          const readStream = fs.createReadStream(filePath);
          readStream.pipe(res);
          return;
        }
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), exeServerPlugin()],
  server: {
    port: 3000,
    open: true
  }
});
