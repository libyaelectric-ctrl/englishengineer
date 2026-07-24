import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const VENDOR_CHUNKS: [string, string][] = [
  ['react-dom', 'vendor-react-dom'],
  ['react-router', 'vendor-router'],
  ['@supabase', 'vendor-supabase'],
  ['@tanstack', 'vendor-query'],
  ['motion', 'vendor-motion'],
  ['framer', 'vendor-motion'],
  ['zustand', 'vendor-state'],
  ['lucide', 'vendor-icons'],
  ['isomorphic-dompurify', 'vendor-sanitize'],
  ['rxjs', 'vendor-rxjs'],
  ['zod', 'vendor-zod'],
  ['es-toolkit', 'vendor-utils'],
  ['date-fns', 'vendor-utils'],
  ['@sentry', 'vendor-sentry'],
  ['clsx', 'vendor-utils'],
  ['tailwind', 'vendor-utils'],
];

function getVendorChunk(id: string): string | undefined {
  for (const [pattern, chunk] of VENDOR_CHUNKS) {
    if (id.includes(pattern)) return chunk;
  }
  return 'vendor-misc';
}

function getDataChunk(id: string): string | undefined {
  const levelMatch = id.match(/by-level\/([a-c][1-2])\.seed/i);
  if (!levelMatch) return undefined;
  const prefix = id.includes('vocabulary') ? 'vocab' : 'grammar';
  return `${prefix}-seed-${levelMatch[1].toLowerCase()}`;
}

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
      target: 'es2020',
      minify: 'esbuild' as const,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) return getVendorChunk(id);
            if (id.includes('/data/') && id.includes('by-level/'))
              return getDataChunk(id) ?? 'seed-data';
            if (id.includes('/data/') || id.includes('seed'))
              return 'seed-data';
          },
        },
      },
    },
  };
});
