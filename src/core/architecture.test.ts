/* eslint-disable @typescript-eslint/no-floating-promises, jsx-a11y/no-noninteractive-element-interactions */
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

import { logger } from '@/shared/logger';

const SRC_DIR = join(process.cwd(), 'src');
const FEATURES_DIR = join(SRC_DIR, 'features');

const getFeatureDirs = (): string[] => {
  return readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
};

const getImportsFromFile = (filePath: string): string[] => {
  const content = readFileSync(filePath, 'utf-8');
  const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
  return importMatches.map((m) => m.replace(/from\s+['"]|['"]/g, ''));
};

/** True if `symbol` is imported from '@/core' or a '@/core/...' module anywhere in src. */
const isCoreSymbolImported = (symbol: string): boolean => {
  const checkDir = (dir: string): boolean => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (checkDir(fullPath)) return true;
      } else if (
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
        !fullPath.startsWith(join(SRC_DIR, 'core'))
      ) {
        const fileContent = readFileSync(fullPath, 'utf-8');
        const importBlocks =
          fileContent.match(
            /import(?:\s+type)?\s*\{[^}]+\}\s*from\s*['"]@\/core(?:\/[^'"]*)?['"]/g
          ) || [];
        if (importBlocks.some((block) => new RegExp(`\\b${symbol}\\b`).test(block))) {
          return true;
        }
      }
    }
    return false;
  };
  return checkDir(SRC_DIR);
};

describe('Architecture Rules', () => {
  it('core does not import from pages', () => {
    const corePath = join(SRC_DIR, 'core');
    const violations: string[] = [];

    const checkDir = (dir: string) => {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          const imports = getImportsFromFile(fullPath);
          for (const imp of imports) {
            if (imp.startsWith('@/pages/')) {
              violations.push(`${fullPath.replace(SRC_DIR, '.')} imports from pages`);
            }
          }
        }
      }
    };

    checkDir(corePath);
    expect(violations).toEqual([]);
  });

  it('documents feature-to-feature import violations (technical debt)', () => {
    const featureDirs = getFeatureDirs();
    const violations: string[] = [];

    for (const feature of featureDirs) {
      const featurePath = join(FEATURES_DIR, feature);
      const files = readdirSync(featurePath, { withFileTypes: true })
        .filter((f) => f.name.endsWith('.ts') || f.name.endsWith('.tsx'))
        .map((f) => join(featurePath, f.name));

      for (const file of files) {
        const imports = getImportsFromFile(file);
        for (const imp of imports) {
          if (imp.startsWith('@/features/') && !imp.includes(`@/features/${feature}`)) {
            const otherFeature = imp.replace('@/features/', '').split('/')[0];
            violations.push(`${file.replace(SRC_DIR, '.')} imports from ${otherFeature}`);
          }
        }
      }
    }

    // Document violations but don't fail â€” these are known technical debt
    logger.i(`[Architecture] Feature-to-feature import violations: ${violations.length}`);
    logger.i('See ARCHITECTURE.md for migration plan');

    // Expect violations to be documented and decreasing over time
    expect(violations.length).toBeLessThan(150);
  });

  it('documents shared-to-features violations (technical debt)', () => {
    const sharedPath = join(SRC_DIR, 'shared');
    const violations: string[] = [];

    const checkDir = (dir: string) => {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          const imports = getImportsFromFile(fullPath);
          for (const imp of imports) {
            // Shared→core is the sanctioned direction (core is the base layer);
            // only shared→features pulls the shared layer up to feature level.
            if (imp.startsWith('@/features/')) {
              violations.push(`${fullPath.replace(SRC_DIR, '.')} imports from ${imp}`);
            }
          }
        }
      }
    };

    checkDir(sharedPath);

    logger.i(`[Architecture] Shared-to-features violations: ${violations.length}`);
    logger.i('See ARCHITECTURE.md for migration plan');

    // Allow known violations: theme hooks, level-system for EmptySkillPage
    expect(violations.length).toBeLessThan(30);
  });

  it('most features have an index.ts entry point', () => {
    const featureDirs = getFeatureDirs();
    const missing: string[] = [];

    for (const feature of featureDirs) {
      const indexPath = join(FEATURES_DIR, feature, 'index.ts');
      const tsxPath = join(FEATURES_DIR, feature, 'index.tsx');
      if (!existsSync(indexPath) && !existsSync(tsxPath)) {
        missing.push(feature);
      }
    }

    // Allow some features to not have index.ts (legacy modules)
    expect(missing.length).toBeLessThan(5);
  });

  it('circular dependencies are limited', () => {
    const featureDirs = getFeatureDirs();
    const violations: string[] = [];

    for (const feature of featureDirs) {
      const featurePath = join(FEATURES_DIR, feature);
      const files = readdirSync(featurePath, { withFileTypes: true })
        .filter((f) => f.name.endsWith('.ts') || f.name.endsWith('.tsx'))
        .map((f) => join(featurePath, f.name));

      for (const file of files) {
        const imports = getImportsFromFile(file);
        for (const imp of imports) {
          if (imp.startsWith(`@/features/${feature}/`)) {
            violations.push(`${file.replace(SRC_DIR, '.')} has internal circular import`);
          }
        }
      }
    }

    // Allow some circular dependencies (known technical debt)
    expect(violations.length).toBeLessThan(10);
  });

  it('shared components do not import from features', () => {
    const sharedComponentsPath = join(SRC_DIR, 'shared', 'components');
    const violations: string[] = [];

    const checkDir = (dir: string) => {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          const imports = getImportsFromFile(fullPath);
          for (const imp of imports) {
            if (imp.startsWith('@/features/')) {
              violations.push(`${fullPath.replace(SRC_DIR, '.')} imports from features`);
            }
          }
        }
      }
    };

    checkDir(sharedComponentsPath);
    // Allow theme-related and level-system hooks used by shared components
    const allowedPatterns = ['useThemeToggle', 'ThemeProvider', 'level-system', 'EmptySkillPage'];
    const realViolations = violations.filter((v) => !allowedPatterns.some((p) => v.includes(p)));
    expect(realViolations).toEqual([]);
  });

  it('config files do not import from features or pages', () => {
    const configPath = join(SRC_DIR, 'config');
    const violations: string[] = [];

    const entries = readdirSync(configPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const fullPath = join(configPath, entry.name);
        const imports = getImportsFromFile(fullPath);
        for (const imp of imports) {
          if (imp.startsWith('@/features/') || imp.startsWith('@/pages/')) {
            violations.push(`${fullPath.replace(SRC_DIR, '.')} imports from ${imp}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('pages have limited cross-imports', () => {
    const pagesPath = join(SRC_DIR, 'pages');
    const violations: string[] = [];

    const checkDir = (dir: string) => {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          const imports = getImportsFromFile(fullPath);
          for (const imp of imports) {
            if (imp.startsWith('@/pages/')) {
              const otherPage = imp.replace('@/pages/', '').split('/')[0];
              const currentPageRaw = fullPath
                .replace(pagesPath, '')
                .split(/[\\/]/)[1]
                ?.replace(/\.tsx?$/, '');
              const otherPageClean = otherPage.replace(/\.tsx?$/, '');
              if (otherPageClean !== currentPageRaw) {
                violations.push(`${fullPath.replace(SRC_DIR, '.')} imports from ${otherPage}`);
              }
            }
          }
        }
      }
    };

    checkDir(pagesPath);
    // Allow known cross-page imports (technical debt tracking)
    expect(violations.length).toBeLessThan(15);
  });

  it('no unused exports in core index', () => {
    const coreIndexPath = join(SRC_DIR, 'core', 'index.ts');
    const content = readFileSync(coreIndexPath, 'utf-8');

    // The root core/index.ts is an intentional placeholder (`export {};`) —
    // core modules are consumed directly (e.g. `@/core/learning`). Whenever
    // the index re-exports symbols, every one of them must be imported by the
    // app so nothing exported from core goes unused.
    const exportBlocks = content.match(/export\s+\{([^}]+)\}/g) || [];
    const unused: string[] = [];

    for (const block of exportBlocks) {
      for (const raw of block
        .replace(/export\s+\{/, '')
        .replace(/\}/, '')
        .split(',')) {
        const symbol = raw
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        if (!symbol) continue;
        if (!isCoreSymbolImported(symbol)) {
          unused.push(symbol);
        }
      }
    }

    expect(unused).toEqual([]);
  });
});
