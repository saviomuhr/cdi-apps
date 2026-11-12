// Service worker do Plano de Ancoragem (gerado por build_ancoragem.py). Guarda o app no aparelho para abrir offline.
// Cada build muda a VERSION, então o Chrome baixa a versão nova na próxima abertura com internet.
const VERSION='pa-2a9e0213df', CACHE='app-'+VERSION, FONTS='fonts-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','icon-apple-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==FONTS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const url=new URL(r.url);
  if(url.origin===location.origin){
    // app: abre do cache na hora (funciona offline) e confere se há versão nova pela rede
    e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:r.mode==='navigate'}).then(hit=>{
      const net=fetch(r).then(res=>{if(res.ok&&r.mode!=='navigate')c.put(r,res.clone());return res}).catch(()=>hit||(r.mode==='navigate'?c.match('index.html'):undefined));
      return hit||net;})));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(FONTS).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{c.put(r,res.clone());return res}))));
  }
});
