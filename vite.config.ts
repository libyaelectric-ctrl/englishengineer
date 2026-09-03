import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function getDataChunk(id: string): string | undefined {
  const levelMatch = id.match(/by-level\/([a-c][1-2])\.seed/i);
  if (!levelMatch) return undefined;
  const prefix = id.includes('vocabulary') ? 'vocab' : 'grammar';
  return `${prefix}-seed-${levelMatch[1].toLowerCase()}`;
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      cache: false,
      sourcemap: 'hidden',
      chunkSizeWarningLimit: 100,
      target: 'es2020',
      minify: 'esbuild' as const,
      cssMinify: 'esbuild' as const,
      modulePreload: {
        polyfill: true,
      },
      rollupOptions: {
        output: {
          // eslint-disable-next-line complexity -- vendor chunk rules per package family
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (id.includes('/data/') && id.includes('by-level/'))
                return getDataChunk(id) ?? 'seed-data';
              if ((id.includes('/data/') || id.includes('seed')) && !id.includes('/localization/'))
                return 'seed-data';
              // Lazy load localization data (huge chunk ~775KB)
              if (id.includes('/features/localization/') && id.includes('/data/'))
                return 'localization-data';
              if (id.includes('/features/localization/translations/'))
                return 'localization-translations';
              return;
            }
            // Vendor chunk splitting
            if (id.includes('@clerk')) return 'vendor-clerk';
            if (
              id.includes('react-router') ||
              id.includes('react-router-dom') ||
              id.includes('@remix-run')
            )
              return 'vendor-router';
            if (id.includes('zustand') || id.includes('@tanstack/react-query'))
              return 'vendor-state';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@opentelemetry') || id.includes('@sentry')) return 'vendor-telemetry';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('zustand')) return 'vendor-zustand';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            // Core React ecosystem - keep together to avoid circular deps
            if (
              id.includes('react') ||
              id.includes('scheduler') ||
              id.includes('use-sync-external-store') ||
              id.includes('object-assign')
            )
              return 'vendor-react-core';
            return 'vendor-other';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? 'asset';
            const info = name.split('.');
            const ext = info[info.length - 1];
            if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/.test(name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
        onwarn(warning, warn) {
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            console.warn(`[CircularDep] ${warning.ids?.join(' -> ') ?? warning.message}`);
            return;
          }
          warn(warning);
        },
      },
    },
  };
});
