import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
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
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            icons: ['lucide-react'],
            animation: ['motion'],
            state: ['zustand'],
            error: ['react-error-boundary'],
            vocabularyData: [
              './src/features/vocabulary/vocabulary.data.ts',
              './src/features/vocabulary/vocabulary.data.json',
            ],
          },
        },
      },
    },
  };
});
