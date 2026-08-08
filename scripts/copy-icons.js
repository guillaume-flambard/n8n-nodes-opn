const fs = require('fs');
const path = require('path');

const exts = new Set(['.png', '.svg']);

function collectIcons(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectIcons(full, acc);
    } else if (exts.has(path.extname(entry.name).toLowerCase())) {
      acc.push(full);
    }
  }
  return acc;
}

const sources = collectIcons('nodes');
for (const source of sources) {
  const dest = path.join('dist', 'nodes', path.relative('nodes', source));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
}
console.log(`build:icons: copied ${sources.length} icon(s)`);
