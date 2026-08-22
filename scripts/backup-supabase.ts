#!/usr/bin/env node
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const S3_BUCKET = process.env.S3_BACKUP_BUCKET;

mkdirSync(BACKUP_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `supabase-backup-${timestamp}.sql`;
const filepath = join(BACKUP_DIR, filename);

console.log('Starting Supabase backup...');

try {
  execSync(`pg_dump "${SUPABASE_URL}" --no-owner --no-privileges -f "${filepath}"`, {
    env: { ...process.env, PGPASSWORD: SUPABASE_SERVICE_KEY },
    stdio: 'inherit',
  });
  console.log(`Backup saved: ${filepath}`);

  if (S3_BUCKET) {
    execSync(`aws s3 cp "${filepath}" "s3://${S3_BUCKET}/${filename}"`, { stdio: 'inherit' });
    console.log(`Uploaded to S3: s3://${S3_BUCKET}/${filename}`);
  }
} catch (err) {
  console.error('Backup failed:', err);
  process.exit(1);
}
