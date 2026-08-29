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
      sourcemap: 'hidden',
      chunkSizeWarningLimit: 300,
      target: 'es2022',
      minify: 'esbuild' as const,
      cssMinify: 'esbuild' as const,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (id.includes('/data/') && id.includes('by-level/'))
                return getDataChunk(id) ?? 'seed-data';
              if ((id.includes('/data/') || id.includes('seed')) && !id.includes('/localization/'))
                return 'seed-data';
              return;
            }
            // Split vendor into smaller chunks.
            // NOTE: react/react-dom/scheduler, framer-motion, and the catch-all
            // bucket must NOT be split apart from each other — several of these
            // packages reference each other's exports at module-init time, and
            // splitting them into separate chunks produces circular CHUNK
            // dependencies (Rollup warns: "Circular chunk: vendor-other ->
            // vendor-react -> vendor-other"). Depending on the resulting load
            // order in the browser, this crashes with errors like
            // "Cannot set properties of undefined (setting 'Activity')" and
            // renders a white screen. Keep them together in 'vendor-react'.
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
            return 'vendor-react';
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
