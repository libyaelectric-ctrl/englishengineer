#!/usr/bin/env node
/**
 * Checkbox-Evidence Consistency Checker
 * 
 * Parses a faz file, checks each [x] marked kademe for evidence file
 * existence and content validity.
 * 
 * Usage: node scripts/verify-evidence-consistency.js <faz-file> [evidence-dir]
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

// Failure indicators (case-insensitive, Turkish + English)
const FAILURE_PATTERNS = [
  'yapılamadı', 'yapilamadi', 'kurulu değil', 'kurulu degil', 'kurulmadı', 'kurulmadi',
  'bulunamadı', 'bulunamadi', 'eksik', 'HAYIR', 'not installed', 'not found',
  'failed', 'FAIL', 'hata', 'error', 'başarısız', 'basarisiz',
  'yuklu degil', 'yuklu değil', 'calistirilmadi', 'calistirilmamis'
];

// Allowed false positive patterns
const ALLOWED_PATTERNS = [
  'test FAILED then fixed',
  'no errors found',
  'passed 0 failed',
  '0 fail',
  'found 0',
];

const fazFile = process.argv[2];
const evidenceDir = process.argv[3] || 'docs';

if (!fazFile) {
  console.error('Usage: node verify-evidence-consistency.js <faz-file> [evidence-dir]');
  process.exit(1);
}

const fazContent = readFileSync(fazFile, 'utf-8');

// Find all [x] marked kademes
const kademeRegex = /\[x\]\s*Kademe\s+(\d+):/g;
let match;
const inconsistencies = [];
const checked = [];

while ((match = kademeRegex.exec(fazContent)) !== null) {
  const kademeNum = match[1];
  
  let evidenceFound = false;
  let evidenceHasFailure = false;
  let evidenceContent = '';
  
  // Check for evidence files
  const files = readdirSync(evidenceDir).filter(f => 
    f.startsWith(`kademe${kademeNum}`) && f.endsWith('.txt')
  );
  
  if (files.length > 0) {
    evidenceFound = true;
    evidenceContent = files.map(f => 
      readFileSync(join(evidenceDir, f), 'utf-8')
    ).join('\n');
  }
  
  // Check for failure patterns in evidence
  if (evidenceFound && evidenceContent) {
    const contentLower = evidenceContent.toLowerCase();
    for (const pattern of FAILURE_PATTERNS) {
      const patternLower = pattern.toLowerCase();
      if (contentLower.includes(patternLower)) {
        const isAllowed = ALLOWED_PATTERNS.some(ap => 
          contentLower.includes(ap.toLowerCase())
        );
        if (!isAllowed) {
          evidenceHasFailure = true;
          break;
        }
      }
    }
  }
  
  checked.push({ kademe: kademeNum, evidenceFound, evidenceHasFailure });
  
  if (!evidenceFound) {
    inconsistencies.push({ kademe: kademeNum, reason: 'Kanıt dosyası bulunamadı' });
  } else if (evidenceHasFailure) {
    inconsistencies.push({ kademe: kademeNum, reason: 'Kanıt dosyasında başarısızlık ifadesi bulundu' });
  }
}

// Output
console.log(`\n=== Checkbox-Kanıt Tutarlılık Kontrolü ===`);
console.log(`Dosya: ${fazFile}`);
console.log(`Toplam [x] işaretli kademe: ${checked.length}`);
console.log(`Tutarlı: ${checked.length - inconsistencies.length}`);
console.log(`Tutarsız: ${inconsistencies.length}`);

if (inconsistencies.length > 0) {
  console.log(`\n=== TUTARSIZLIKLAR ===`);
  inconsistencies.forEach(inc => {
    console.log(`  Kademe ${inc.kademe}: ${inc.reason}`);
  });
  process.exit(1);
} else {
  console.log(`\n✅ Tüm kademeler tutarlı.`);
  process.exit(0);
}
