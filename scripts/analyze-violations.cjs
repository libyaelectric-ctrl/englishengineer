const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');
const FEATURES_DIR = path.join(SRC_DIR, 'features');

function getFeatureDirs() {
  return fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function getImportsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
  return importMatches.map(m => m.replace(/^from\s+['"]/, '').replace(/['"]$/, ''));
}

// Feature-to-feature violations
const featureDirs = getFeatureDirs();
const f2fMap = {};

for (const feature of featureDirs) {
  const featurePath = path.join(FEATURES_DIR, feature);
  const files = fs.readdirSync(featurePath, { withFileTypes: true })
    .filter(f => f.name.endsWith('.ts') || f.name.endsWith('.tsx'))
    .map(f => path.join(featurePath, f.name));

  for (const file of files) {
    const imports = getImportsFromFile(file);
    for (const imp of imports) {
      if (imp.startsWith('@/features/') && !imp.includes('@/features/' + feature)) {
        const otherFeature = imp.replace('@/features/', '').split('/')[0];
        const key = feature + ' -> ' + otherFeature;
        if (!f2fMap[key]) f2fMap[key] = [];
        f2fMap[key].push(path.basename(file) + ': ' + imp);
      }
    }
  }
}

const keys = Object.keys(f2fMap).sort();
let total = 0;
keys.forEach(k => { total += f2fMap[k].length; });

console.log('=== FEATURE-TO-FEATURE VIOLATIONS ===');
console.log('Total violations:', total, '| Unique pairs:', keys.length);
console.log('');
keys.forEach(k => {
  console.log('[' + k + '] (' + f2fMap[k].length + ')');
  f2fMap[k].forEach(v => console.log('  ' + v));
});

// Shared-to-core violations
const sharedPath = path.join(SRC_DIR, 'shared');
const s2cViolations = [];

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, cb);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      cb(fullPath);
    }
  }
}

walkDir(sharedPath, (filePath) => {
  const imports = getImportsFromFile(filePath);
  for (const imp of imports) {
    if (imp.startsWith('@/core/') || imp.startsWith('@/features/')) {
      s2cViolations.push(filePath.replace(SRC_DIR, '.') + ' -> ' + imp);
    }
  }
});

console.log('\n=== SHARED-TO-CORE/FEATURES VIOLATIONS ===');
console.log('Total:', s2cViolations.length);
s2cViolations.forEach(v => console.log('  ' + v));
