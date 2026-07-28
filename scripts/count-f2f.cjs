const fs = require('fs');
const path = require('path');
const SRC = path.join(process.cwd(), 'src');
const FD = path.join(SRC, 'features');
const fds = fs.readdirSync(FD, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);
let total = 0;
for (const f of fds) {
  const fp = path.join(FD, f);
  const files = fs.readdirSync(fp, { withFileTypes: true })
    .filter(x => x.name.endsWith('.ts') || x.name.endsWith('.tsx'))
    .map(x => path.join(fp, x.name));
  for (const file of files) {
    const imports = (fs.readFileSync(file, 'utf-8').match(/from\s+['"]([^'"]+)['"]/g) || [])
      .map(m => m.replace(/^from\s+['"]/, '').replace(/['"]$/, ''));
    for (const i of imports) {
      if (i.startsWith('@/features/') && !i.includes('@/features/' + f)) total++;
    }
  }
}
console.log('Total f2f violations:', total);
