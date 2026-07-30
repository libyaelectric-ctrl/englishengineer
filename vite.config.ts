import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const VENDOR_CHUNKS: [string, string][] = [
  ['react-dom', 'vendor-react-dom'],
  ['react-router', 'vendor-router'],
  ['@supabase', 'vendor-supabase'],
  ['@tanstack', 'vendor-query'],
  ['motion', 'vendor-motion'],
  ['zustand', 'vendor-state'],
  ['lucide', 'vendor-icons'],
  ['isomorphic-dompurify', 'vendor-sanitize'],
  ['clsx', 'vendor-utils'],
  ['tailwind', 'vendor-utils'],
  ['react-helmet', 'vendor-seo'],
  ['react-virtuoso', 'vendor-virtual'],
  ['react-error-boundary', 'vendor-error'],
  ['web-vitals', 'vendor-vitals'],
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
      compression({ algorithms: ['brotliCompress'] }),
      ...(process.env.ANALYZE ? [visualizer({ open: true, filename: 'bundle-report.html' })] : []),
    ],
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
      sourcemap: 'hidden' as const,
      chunkSizeWarningLimit: 300, // Reduced from 500 for tighter control
      target: 'es2020',
      minify: 'esbuild' as const,
      cssMinify: 'esbuild' as const,
      rollupOptions: {
        external: ['express', 'openai', 'stripe', 'cors', 'dotenv'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) return getVendorChunk(id);
            if (id.includes('/data/') && id.includes('by-level/'))
              return getDataChunk(id) ?? 'seed-data';
            if (id.includes('/data/') || id.includes('seed')) return 'seed-data';
          },
        },
      },
    },
  };
});
