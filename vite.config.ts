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
      chunkSizeWarningLimit: 250,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            icons: ['lucide-react'],
            animation: ['motion'],
            state: ['zustand'],
            query: ['@tanstack/react-query'],
            sentry: ['@sentry/react'],
            ai: ['isomorphic-dompurify'],
            vocabularyData: [
              './src/features/vocabulary/data/vocabulary.data.ts',
              './src/features/vocabulary/data/vocabulary.data.json',
            ],
          },
        },
      },
    },
  };
});
