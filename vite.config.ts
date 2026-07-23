import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(process.env.ANALYZE
        ? [visualizer({ open: true, filename: 'bundle-report.html' })]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, './src'),
        '@shared': path.resolve(projectRoot, './src/shared'),
        '@config': path.resolve(projectRoot, './src/config'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist',
      sourcemap: 'hidden' as const,
      chunkSizeWarningLimit: 3500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom')) return 'vendor-react-dom';
              if (id.includes('react-router')) return 'vendor-router';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('@sentry')) return 'vendor-sentry';
              if (id.includes('@tanstack')) return 'vendor-query';
              if (id.includes('motion') || id.includes('framer')) return 'vendor-motion';
              if (id.includes('zustand')) return 'vendor-state';
              if (id.includes('lucide')) return 'vendor-icons';
              if (id.includes('isomorphic-dompurify')) return 'vendor-sanitize';
              return 'vendor-misc';
            }
            if (id.includes('/data/') || id.includes('seed')) return 'seed-data';
            if (id.includes('/core/')) return 'core';
            if (id.includes('/shared/')) return 'shared';
          },
        },
      },
    },
  };
});
