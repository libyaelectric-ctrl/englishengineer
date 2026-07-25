import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { logger } from '../logger.js';

interface MigrationTestResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Tests SQL migrations for common issues.
 * Run this before applying migrations to catch errors early.
 */
export const testMigrations = (): MigrationTestResult[] => {
  const migrationsDir = resolve('supabase/migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const results: MigrationTestResult[] = [];

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const content = readFileSync(filePath, 'utf8');
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for timestamp prefix
    if (!/^\d{14}_/.test(file)) {
      warnings.push('Missing timestamp prefix - may cause ordering issues');
    }

    // Check for DROP TABLE without IF EXISTS
    if (/DROP TABLE(?!\s+IF EXISTS)/i.test(content)) {
      errors.push('DROP TABLE without IF EXISTS - will fail if table doesn\'t exist');
    }

    // Check for missing schema prefix
    const createTableMatches = content.match(/CREATE TABLE(?!\s+IF NOT EXISTS\s+public\.)/gi);
    if (createTableMatches && createTableMatches.length > 0) {
      warnings.push('CREATE TABLE without public. schema prefix');
    }

    // Check for RLS enabled
    if (content.includes('CREATE TABLE') && !content.includes('ENABLE ROW LEVEL SECURITY')) {
      warnings.push('Tables created without RLS enabled');
    }

    // Check for index on non-existent columns (basic check)
    const indexMatches = content.match(/CREATE INDEX.*ON\s+(\w+)\(([^)]+)\)/gi);
    if (indexMatches) {
      for (const match of indexMatches) {
        const tableMatch = match.match(/ON\s+(\w+)/i);
        if (tableMatch) {
          const table = tableMatch[1];
          // Check if table is created in same migration
          if (!content.includes(`CREATE TABLE`) || !content.includes(table)) {
            warnings.push(`Index references table "${table}" - verify it exists`);
          }
        }
      }
    }

    // Check for proper ID columns
    if (content.includes('CREATE TABLE') && !content.includes('id uuid')) {
      warnings.push('Table may be missing UUID primary key');
    }

    // Check for created_at timestamp
    if (content.includes('CREATE TABLE') && !content.includes('created_at')) {
      warnings.push('Table may be missing created_at timestamp');
    }

    results.push({
      file,
      valid: errors.length === 0,
      errors,
      warnings,
    });
  }

  return results;
};

/**
 * Validates migration ordering.
 */
export const validateMigrationOrder = (): string[] => {
  const migrationsDir = resolve('supabase/migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const issues: string[] = [];
  let lastTimestamp = '';

  for (const file of files) {
    const timestamp = file.substring(0, 14);
    if (/^\d{14}_/.test(file)) {
      if (timestamp < lastTimestamp) {
        issues.push(`Migration ${file} has timestamp before previous migration`);
      }
      lastTimestamp = timestamp;
    }
  }

  return issues;
};

/**
 * Reports migration test results.
 */
export const reportMigrationTests = (): void => {
  const results = testMigrations();
  const orderIssues = validateMigrationOrder();

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    if (result.errors.length > 0) {
      logger.e(`❌ ${result.file}: ${result.errors.join(', ')}`);
      totalErrors += result.errors.length;
    }
    if (result.warnings.length > 0) {
      logger.w(`⚠️ ${result.file}: ${result.warnings.join(', ')}`);
      totalWarnings += result.warnings.length;
    }
  }

  if (orderIssues.length > 0) {
    logger.w(`Migration ordering issues: ${orderIssues.join(', ')}`);
    totalWarnings += orderIssues.length;
  }

  logger.i(`Migration tests: ${results.length} files, ${totalErrors} errors, ${totalWarnings} warnings`);
};
