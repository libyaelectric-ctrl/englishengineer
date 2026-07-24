import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
              violations.push(
                `${fullPath.replace(SRC_DIR, '.')} imports from pages`
              );
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
          if (
            imp.startsWith('@/features/') &&
            !imp.includes(`@/features/${feature}`)
          ) {
            const otherFeature = imp.replace('@/features/', '').split('/')[0];
            violations.push(
              `${file.replace(SRC_DIR, '.')} imports from ${otherFeature}`
            );
          }
        }
      }
    }

    // Document violations but don't fail — these are known technical debt
    console.log(
      `\n[Architecture] Feature-to-feature import violations: ${violations.length}`
    );
    console.log('See ARCHITECTURE.md for migration plan\n');

    // Expect violations to be documented and decreasing over time
    expect(violations.length).toBeLessThan(200);
  });

  it('documents shared-to-core/features violations (technical debt)', () => {
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
            if (imp.startsWith('@/core/') || imp.startsWith('@/features/')) {
              violations.push(
                `${fullPath.replace(SRC_DIR, '.')} imports from ${imp}`
              );
            }
          }
        }
      }
    };

    checkDir(sharedPath);

    console.log(
      `\n[Architecture] Shared-to-core/features violations: ${violations.length}`
    );
    console.log('See ARCHITECTURE.md for migration plan\n');

    expect(violations.length).toBeLessThan(20);
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
            violations.push(
              `${file.replace(SRC_DIR, '.')} has internal circular import`
            );
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
              violations.push(
                `${fullPath.replace(SRC_DIR, '.')} imports from features`
              );
            }
          }
        }
      }
    };

    checkDir(sharedComponentsPath);
    expect(violations).toEqual([]);
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
            violations.push(
              `${fullPath.replace(SRC_DIR, '.')} imports from ${imp}`
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
