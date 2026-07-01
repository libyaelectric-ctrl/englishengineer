# Project Package Guide

Use this guide when exporting EngineerOS as a clean source ZIP.

## Clean Source ZIP Should Include

- `package.json`
- `package-lock.json`
- `src/`
- `public/` if present
- project markdown docs such as `README.md`, `AI_WORKSPACE.md`, and engine docs
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `eslint.config.js`
- prettier config files
- env example files such as `.env.example`

## Clean Source ZIP Must Not Include

- `node_modules/`
- `dist/`
- `.npm-cache/`
- `.vite/`
- `.git/`
- local env files such as `.env` and `.env.local`
- logs
- OS/editor cache files such as `.DS_Store`
- previously exported ZIP files

## Before Exporting

Run:

```bash
npm run clean
```

This removes generated build/cache folders that should not be part of source exports.

## PowerShell Clean Source ZIP

From the project root on Windows:

```powershell
$zipPath = Join-Path (Get-Location) 'engineeros-clean-source.zip'
$items = Get-ChildItem -Force | Where-Object {
  $_.Name -notin @(
    'node_modules',
    'dist',
    '.npm-cache',
    '.vite',
    '.git',
    '.DS_Store',
    'engineeros-clean-source.zip'
  ) -and
  $_.Name -notlike '*.zip' -and
  $_.Name -notlike '*.log' -and
  $_.Name -notin @('.env', '.env.local')
}
Compress-Archive -Path $items.FullName -DestinationPath $zipPath -Force
```

## Expected Size

A clean source ZIP should usually be small because dependencies and generated build output are excluded. For the current EngineerOS project, expect roughly 1-3 MB depending on documentation and source data size.
