import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
  const files = readdirSync(dir);
  for (const f of files) {
    const fp = join(dir, f);
    const s = statSync(fp);
    if (s.isDirectory()) {
      walk(fp);
    } else if (f.endsWith('.tsx')) {
      let c = readFileSync(fp, 'utf8');
      if (
        c.includes('import React') &&
        !c.includes('React.') &&
        !c.includes('React.FC') &&
        !c.includes('React.memo')
      ) {
        c = c.replace(/import React from 'react';\n/g, '');
        c = c.replace(/import React, /, 'import ');
        writeFileSync(fp, c);
        console.log('Fixed:', fp);
      }
    }
  }
}

walk('src');
console.log('Done');
