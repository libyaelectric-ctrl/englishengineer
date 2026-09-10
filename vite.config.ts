/* eslint-disable complexity */
import { mkdir, readdir, rename, rm } from 'node:fs/promises';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function deferredCssPlugin(): Plugin {
  return {
    name: 'deferred-css',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g,
        (_match, href) =>
          `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`
      );
    },
  };
}

async function findSourceMaps(directory: string): Promise<string[]> {
  const maps: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) maps.push(...(await findSourceMaps(fullPath)));
    else if (entry.name.endsWith('.map')) maps.push(fullPath);
  }
  return maps;
}

function privateSourceMapsPlugin(): Plugin {
  return {
    name: 'private-source-maps',
    async closeBundle() {
      const distDir = path.resolve(projectRoot, 'dist');
      const privateDir = path.resolve(projectRoot, '.artifacts/sourcemaps');
      await rm(privateDir, { recursive: true, force: true });
      for (const sourceMap of await findSourceMaps(distDir)) {
        const destination = path.join(privateDir, path.relative(distDir, sourceMap));
        await mkdir(path.dirname(destination), { recursive: true });
        await rename(sourceMap, destination);
      }
    },
  };
}

function getDataChunk(id: string): string | undefined {
  const levelMatch = id.match(/by-level\/([a-c][1-2])\.seed/i);
  if (!levelMatch) return undefined;
  const prefix = id.includes('vocabulary') ? 'vocab' : 'grammar';
  return `${prefix}-seed-${levelMatch[1].toLowerCase()}`;
}

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), deferredCssPlugin(), privateSourceMapsPlugin()],
  resolve: { alias: { '@': path.resolve(projectRoot, './src') } },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    proxy: { '/api': { target: 'http://localhost:8787', changeOrigin: true } },
  },
  build: {
    outDir: 'dist',
    cache: false,
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 100,
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    modulePreload: { polyfill: true },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            if (id.includes('/data/') && id.includes('by-level/'))
              return getDataChunk(id) ?? 'seed-data';
            if ((id.includes('/data/') || id.includes('seed')) && !id.includes('/localization/'))
              return 'seed-data';
            const langChunkMatch = id.match(/\/features\/localization\/data\/([a-z]{2})\.ts$/);
            if (langChunkMatch) return `localization-lang-${langChunkMatch[1]}`;
            if (id.includes('/features/localization/') && id.includes('/data/'))
              return 'localization-data';
            if (id.includes('/features/localization/translations/'))
              return 'localization-translations';
            return;
          }
          if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase';
          if (
            id.includes('react-router') ||
            id.includes('react-router-dom') ||
            id.includes('@remix-run')
          )
            return 'vendor-router';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@opentelemetry') || id.includes('@sentry')) return 'vendor-telemetry';
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('zustand') || id.includes('@tanstack')) return 'vendor-state';
          if (id.includes('lucide-react')) return 'vendor-lucide';
          if (
            id.includes('react') ||
            id.includes('scheduler') ||
            id.includes('use-sync-external-store')
          )
            return 'vendor-react-core';
          return 'vendor-misc';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/.test(name))
            return `assets/images/[name]-[hash].${ext}`;
          if (/\.(woff2?|eot|ttf|otf)$/.test(name))
            return `assets/fonts/[name]-[hash].${ext}`;
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
}));
