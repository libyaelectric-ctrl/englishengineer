#!/usr/bin/env node
/**
 * EngineerOS v2.4.7 — Phase 2 Refactor Scripti
 * Calistir: node refactor-phase2.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const log = (msg) => console.log(`[PHASE2] ${msg}`);
const warn = (msg) => console.warn(`[WARN] ${msg}`);

// 1. Ana .gitignore Kontrolü
function fixRootGitignore() {
  const gitignorePath = path.join(ROOT, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    warn('.gitignore bulunamadi!');
    return;
  }
  let content = fs.readFileSync(gitignorePath, 'utf-8');
  let changed = false;
  const needed = [
    { pattern: /public\/data\/(\*\.json)?/, line: 'public/data/*.json' },
    { pattern: /public\/audio\/(\*\.mp3)?/, line: 'public/audio/*.mp3' },
  ];
  for (const n of needed) {
    if (!n.pattern.test(content)) {
      content += `\n${n.line}`;
      log(`.gitignore'a eklendi: ${n.line}`);
      changed = true;
    } else {
      log(`.gitignore'da zaten var: ${n.line}`);
    }
  }
  if (changed) {
    fs.writeFileSync(gitignorePath, content);
    log('.gitignore kaydedildi');
  }
}

// 2. public/audio/.gitignore
function fixAudioGitignore() {
  const dir = path.join(ROOT, 'public', 'audio');
  const file = path.join(dir, '.gitignore');
  if (!fs.existsSync(dir)) {
    warn('public/audio klasoru bulunamadi');
    return;
  }
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '*.mp3\n');
    log('public/audio/.gitignore olusturuldu');
  } else {
    log('public/audio/.gitignore zaten var');
  }
}

// 3. public/data/.gitignore Kontrolü
function fixDataGitignore() {
  const dir = path.join(ROOT, 'public', 'data');
  const file = path.join(dir, '.gitignore');
  if (!fs.existsSync(dir)) {
    warn('public/data klasoru bulunamadi');
    return;
  }
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '*.json\n');
    log('public/data/.gitignore olusturuldu');
  } else {
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('*.json')) {
      fs.writeFileSync(file, '*.json\n');
      log('public/data/.gitignore guncellendi');
    } else {
      log('public/data/.gitignore OK');
    }
  }
}

// 4. Büyük Dosyaları Listele
function listBigFiles() {
  const pagesDir = path.join(ROOT, 'src', 'pages');
  if (!fs.existsSync(pagesDir)) {
    warn('src/pages bulunamadi');
    return;
  }
  const bigFiles = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(ROOT, fullPath);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) {
        const size = fs.statSync(fullPath).size;
        if (size > 15000) {
          bigFiles.push({ path: relPath, sizeKB: (size / 1024).toFixed(1) });
        }
      }
    }
  }
  scan(pagesDir);
  bigFiles.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB));
  console.log('\n--- 15KB+ TSX Dosyalar (Parcalanmasi Gerekenler) ---');
  for (const f of bigFiles) {
    console.log(`  ${f.sizeKB.padStart(6)} KB | ${f.path}`);
  }
}

// 5. ProgressPage Kontrolü
function checkProgressPage() {
  const indexFile = path.join(ROOT, 'src', 'pages', 'ProgressPage', 'index.tsx');
  if (!fs.existsSync(indexFile)) {
    log('ProgressPage/index.tsx YOK');
    return;
  }
  const content = fs.readFileSync(indexFile, 'utf-8');
  const isRedirect = content.includes('<Navigate') || content.includes('redirect');
  if (isRedirect) {
    warn('ProgressPage sadece redirect yapıyor! Routerdan ve dosyadan kaldırılabilir.');
    console.log("  → src/routes/router.tsx icindeki Progress import ve route'larini kaldir");
    console.log('  → src/pages/ProgressPage/ klasorunu sil');
  } else {
    log('ProgressPage gercek bir sayfa (redirect degil). Routerda kalabilir.');
  }
}

// 6. Son Kontroller
function finalChecks() {
  console.log('\n========================================');
  console.log('SON KONTROLLER');
  console.log('========================================');
  const checks = [
    { file: 'package.json', desc: 'Dependency kontrolu' },
    { file: 'vite.config.ts', desc: 'Vite config temizligi' },
    { file: 'src/main.tsx', desc: 'requestIdleCallback polyfill' },
    { file: 'backend/package.json', desc: 'Backend tsx konumu' },
  ];
  for (const c of checks) {
    const exists = fs.existsSync(path.join(ROOT, c.file));
    console.log(`  ${exists ? '✅' : '❌'} ${c.file} (${c.desc})`);
  }
  console.log('\nSonraki adimlar:');
  console.log('  1. git status ile degisiklikleri kontrol et');
  console.log('  2. npm run typecheck');
  console.log('  3. npm run build');
  console.log('  4. git add -A && git commit -m "refactor: phase 2 asset yonetimi"');
}

function main() {
  console.log('EngineerOS v2.4.7 — Phase 2 Refactor Scripti');
  console.log('=============================================' + '\n');
  fixRootGitignore();
  fixAudioGitignore();
  fixDataGitignore();
  listBigFiles();
  checkProgressPage();
  finalChecks();
  console.log('\n=============================================');
  console.log('SCRIPT TAMAMLANDI');
  console.log('=============================================');
}
main();
