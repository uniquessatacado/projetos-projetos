const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const dist = path.join(__dirname, 'zero19-vector', 'dist');
const assets = path.join(dist, 'assets');
let replacements = 0;

for (const name of fs.readdirSync(assets)) {
  if (!name.endsWith('.js')) continue;
  const p = path.join(assets, name);
  let text = fs.readFileSync(p, 'utf8');
  const before = text;
  text = text.replace(/1\.2\.2/g, pkg.version);
  if (text !== before) {
    replacements += 1;
    fs.writeFileSync(p, text, 'utf8');
  }
}

if (!replacements) throw new Error('Não encontrei a versão 1.2.2 no bundle compilado.');

const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/(src="\/assets\/[^"]+\.js)"/, '$1?v=' + pkg.version + '"');
html = html.replace(/(href="\/assets\/[^"]+\.css)"/, '$1?v=' + pkg.version + '"');
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Patched ZERO19 frontend to v' + pkg.version);
