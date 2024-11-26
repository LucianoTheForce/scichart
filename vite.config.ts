import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/scichart/_wasm/scichart2d.data',
          dest: 'assets'
        },
        {
          src: 'node_modules/scichart/_wasm/scichart2d.wasm',
          dest: 'assets'
        }
      ]
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  resolve: {
    alias: {
      'scichart': path.resolve(__dirname, 'node_modules/scichart')
    }
  }
});