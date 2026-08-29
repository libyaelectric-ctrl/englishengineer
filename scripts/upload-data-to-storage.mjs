#!/usr/bin/env node
/**
 * Uploads public/data/** to Supabase Storage so the runtime loaders can
 * fetch the seed/corpus files from a CDN origin instead of same-origin
 * /data/* (the files stay in public/ for local dev and as a fallback).
 *
 * Required env:
 *   SUPABASE_URL               e.g. https://xyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  service role key (server-side only!)
 * Optional env:
 *   SUPABASE_STORAGE_BUCKET    default: app-data
 *
 * Usage:
 *   node scripts/upload-data-to-storage.mjs            # plan only
 *   node scripts/upload-data-to-storage.mjs --yes      # upload
 *
 * After uploading, set VITE_DATA_CDN_URL for the frontend:
 *   <SUPABASE_URL>/storage/v1/object/public/<bucket>
 * (see .env.example). The loaders fall back to same-origin /data/* when
 * the variable is unset, so local development keeps working.
 */
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = (process.env.SUPABASE_URL ?? '').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'app-data';
const DATA_DIR = path.resolve('public/data');
const apply = process.argv.includes('--yes');

if (!SUPABASE_URL || !KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(DATA_DIR, []);
const plan = files.map((f) => {
  const rel = path.relative(DATA_DIR, f).split(path.sep).join('/');
  return { file: f, objectPath: 'data/' + rel };
});

console.log('Bucket: ' + BUCKET);
for (const item of plan) {
  const kb = Math.round(fs.statSync(item.file).size / 1024);
  console.log('  ' + item.objectPath + '  (' + kb + ' KB)');
}
console.log('Total: ' + plan.length + ' files');

if (!apply) {
  console.log('Plan mode - add --yes to upload.');
  process.exit(0);
}

let ok = 0;
for (const item of plan) {
  const body = fs.readFileSync(item.file);
  const res = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + item.objectPath, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + KEY,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body,
  });
  if (res.ok) {
    ok += 1;
    console.log('OK  ' + item.objectPath);
  } else {
    console.error('FAIL ' + item.objectPath + ' :: ' + res.status + ' ' + (await res.text()).slice(0, 120));
    process.exit(1);
  }
}
console.log('Uploaded: ' + ok + '/' + plan.length);
console.log('Set VITE_DATA_CDN_URL=' + SUPABASE_URL + '/storage/v1/object/public/' + BUCKET);
