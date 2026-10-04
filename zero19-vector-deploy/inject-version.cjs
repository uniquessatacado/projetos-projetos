const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const dist = path.join(__dirname, 'zero19-vector', 'dist');
const htmlPath = path.join(dist, 'index.html');
const badgePath = path.join(dist, 'version-badge.js');

const css = [
  '.topbar{position:sticky!important;top:0!important;z-index:9998!important;background:rgba(11,11,12,.94)!important;-webkit-backdrop-filter:blur(18px)!important;backdrop-filter:blur(18px)!important}',
  '.z19-version-badge{appearance:none;border:1px solid #383b44;background:#15161a;color:#e8e8eb;border-radius:999px;padding:6px 9px;display:inline-flex;align-items:center;gap:7px;margin-left:4px;cursor:pointer;white-space:nowrap;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1;flex:0 0 auto}',
  '.brand .z19-version-badge .z19-vnum{display:inline!important;color:#f4f4f6!important;font-size:10px!important;font-weight:850!important;margin:0!important}',
  '.brand .z19-version-badge .z19-vstate{display:inline-flex!important;align-items:center!important;gap:5px!important;color:#999da6!important;font-size:9px!important;margin:0!important}',
  '.z19-version-badge i{display:block;width:7px;height:7px;border-radius:50%;background:#777b85}',
  '.z19-version-badge.checking i{animation:z19VersionPulse .8s infinite alternate}',
  '.z19-version-badge.current{border-color:#31523a;background:#111a14}',
  '.brand .z19-version-badge.current .z19-vstate{color:#78ef92!important}',
  '.z19-version-badge.current i{background:#6dff8b;box-shadow:0 0 9px rgba(109,255,139,.6)}',
  '.z19-version-badge.outdated{border-color:#705a2f;background:#1d1810}',
  '.brand .z19-version-badge.outdated .z19-vstate{color:#ffd477!important}',
  '.z19-version-badge.outdated i{background:#ffca62;box-shadow:0 0 9px rgba(255,202,98,.55)}',
  '.z19-version-badge.unknown{border-color:#444750}',
  '@keyframes z19VersionPulse{to{opacity:.25}}',
  '@media(max-width:600px){.z19-version-badge{padding:5px 7px;gap:5px;margin-left:0}.brand .z19-version-badge .z19-vnum{font-size:9px!important}.brand .z19-version-badge .z19-vstate{font-size:8px!important}.z19-version-badge i{width:6px;height:6px}}',
  '@media(max-width:365px){.brand .z19-version-badge .z19-vstate>span{display:none!important}}'
].join('');

const js = [
  '(() => {',
  'const CURRENT_VERSION=' + JSON.stringify(pkg.version) + ';',
  'let latestVersion=CURRENT_VERSION;',
  'const style=document.createElement("style");',
  'style.textContent=' + JSON.stringify(css) + ';',
  'document.head.appendChild(style);',
  'function mount(){',
  'if(document.getElementById("z19VersionBadge"))return true;',
  'const brand=document.querySelector(".topbar .brand");',
  'if(!brand)return false;',
  'const badge=document.createElement("button");',
  'badge.type="button";badge.id="z19VersionBadge";badge.className="z19-version-badge checking";badge.title="Verificando versão mais recente";',
  'badge.innerHTML="<span class=\"z19-vnum\">v"+CURRENT_VERSION+"</span><span class=\"z19-vstate\"><i></i><span id=\"z19VersionState\">checando…</span></span>";',
  'brand.appendChild(badge);',
  'badge.addEventListener("click",()=>{if(badge.classList.contains("outdated")){const url=new URL(window.location.href);url.searchParams.set("v",latestVersion);url.searchParams.set("_refresh",String(Date.now()));window.location.href=url.toString()}else{checkVersion()}});',
  'return true;',
  '}',
  'async function checkVersion(){',
  'if(!mount())return;',
  'const badge=document.getElementById("z19VersionBadge");const state=document.getElementById("z19VersionState");if(!badge||!state)return;',
  'badge.classList.remove("current","outdated","unknown");badge.classList.add("checking");state.textContent="checando…";',
  'try{',
  'const response=await fetch("/api/version?t="+Date.now(),{cache:"no-store"});if(!response.ok)throw new Error("HTTP "+response.status);',
  'const data=await response.json();latestVersion=data.version||CURRENT_VERSION;badge.classList.remove("checking");',
  'if(latestVersion===CURRENT_VERSION){badge.classList.add("current");state.textContent="Atual";badge.title="Versão mais recente"+(data.commit?" • build "+data.commit:"")}else{badge.classList.add("outdated");state.textContent="Nova v"+latestVersion;badge.title="Toque para carregar a versão mais recente"}',
  '}catch(error){badge.classList.remove("checking");badge.classList.add("unknown");state.textContent="não verificado";badge.title="Não foi possível verificar a versão. Toque para tentar novamente."}',
  '}',
  'if(!mount()){const observer=new MutationObserver(()=>{if(mount()){observer.disconnect();checkVersion()}});observer.observe(document.documentElement,{childList:true,subtree:true})}else{checkVersion()}',
  '})();'
].join('\n');

fs.writeFileSync(badgePath, js, 'utf8');

let html = fs.readFileSync(htmlPath, 'utf8');
const tag = '<script defer src="/version-badge.js?v=' + pkg.version + '"></script>';
if (!html.includes('/version-badge.js')) {
  html = html.replace('</body>', '  ' + tag + '\n  </body>');
}
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Injected ZERO19 version badge v' + pkg.version);
