const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const dist = path.join(__dirname, 'zero19-vector', 'dist');
const assets = path.join(dist, 'assets');
let replacements = 0;
let optimizedAnalysis = 0;

for (const name of fs.readdirSync(assets)) {
  if (!name.endsWith('.js')) continue;
  const p = path.join(assets, name);
  let text = fs.readFileSync(p, 'utf8');
  const before = text;

  text = text.replace(/1\.2\.2/g, pkg.version);
  text = text.replace(/1\.2\.3/g, pkg.version);

  const oldResize = 'let n=t,r=Math.max(n.width,n.height);r>2800&&(n=K(n,2800/r));';
  const newResize = 'let n=t,r=Math.max(n.width,n.height),C=[560,640,720,800,896][Math.max(0,Math.min(4,Number(d.value)-1))];r>C&&(n=K(n,C/r));';
  if (text.includes(oldResize)) {
    text = text.replace(oldResize, newResize);
    optimizedAnalysis += 1;
  }

  text = text.replace(
    'Vetorizando em alta fidelidade… pode levar alguns minutos.',
    'Vetorizando em alta fidelidade… análise otimizada para SVG.'
  );

  if (text !== before) {
    replacements += 1;
    fs.writeFileSync(p, text, 'utf8');
  }
}

if (!replacements) throw new Error('Não encontrei versão do ZERO19 no bundle compilado.');
if (!optimizedAnalysis) throw new Error('Não encontrei o redimensionamento da imagem de análise no bundle.');

const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/(src="\/assets\/[^"]+\.js)"/, '$1?v=' + pkg.version + '"');
html = html.replace(/(href="\/assets\/[^"]+\.css)"/, '$1?v=' + pkg.version + '"');
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Patched ZERO19 frontend to v' + pkg.version + ' with SVG analysis cap');
