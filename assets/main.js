/* ===== BEÁLLÍTÁSOK – ezeket írd át ===== */
var CONFIG = {
  email: 'nagy.zoltan@nzakademia.hu'   // ide érkeznek az űrlapok (e-mail-program nyílik meg)
};

/* Mobilmenü */
(function () {
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* Évszám a láblécben */
document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

/* Űrlapok: szerver nélkül e-mailként küldi el (data-mailto="Tárgy") */
document.querySelectorAll('form[data-mailto]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var lines = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit') return;
      if (el.type === 'checkbox') { lines.push(el.name + ': ' + (el.checked ? 'igen' : 'nem')); return; }
      if (el.value) lines.push(el.name + ': ' + el.value);
    });
    window.location.href = 'mailto:' + CONFIG.email +
      '?subject=' + encodeURIComponent(form.getAttribute('data-mailto')) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    var ok = form.querySelector('.form-ok');
    if (ok) ok.hidden = false;
  });
});

/* Kalkulátorok */
(function () {
  var root = document.getElementById('kalkulatorok');
  if (!root) return;
  var ft = function (v) { return Math.round(v).toLocaleString('hu-HU') + ' Ft'; };
  var val = function (id) { return Number(document.getElementById(id).value); };
  var set = function (id, t) { document.getElementById(id).textContent = t; };

  // Fülek
  var tabs = root.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });

  function megtakaritas() {
    var m = val('m-havi'), r = val('m-hozam'), y = val('m-ev');
    var i = r / 100 / 12, n = y * 12;
    var fv = i > 0 ? m * ((Math.pow(1 + i, n) - 1) / i) : m * n, be = m * n;
    set('m-havi-t', ft(m)); set('m-hozam-t', r.toLocaleString('hu-HU') + ' %'); set('m-ev-t', y + ' év');
    set('m-ev-r', y); set('m-fv', ft(fv)); set('m-be', ft(be)); set('m-hoz', ft(fv - be));
    document.getElementById('m-bar').style.width = Math.max(2, be / fv * 100) + '%';
  }
  function hitel() {
    var p = val('h-osszeg'), r = val('h-kamat'), y = val('h-ev');
    var i = r / 100 / 12, n = y * 12;
    var pay = i > 0 ? p * i / (1 - Math.pow(1 + i, -n)) : p / n;
    set('h-osszeg-t', ft(p)); set('h-kamat-t', r.toLocaleString('hu-HU') + ' %'); set('h-ev-t', y + ' év');
    set('h-reszlet', ft(pay)); set('h-ossz', ft(pay * n)); set('h-kam', ft(pay * n - p));
  }
  function tartalek() {
    var k = val('t-kiadas'), h = val('t-honap');
    set('t-kiadas-t', ft(k)); set('t-honap-t', h + ' hónap'); set('t-cel', ft(k * h));
    set('t-ido', Math.ceil(k * h / (k * 1.2 * 0.1)));
  }
  root.querySelectorAll('input[type=range]').forEach(function (inp) {
    inp.addEventListener('input', function () { megtakaritas(); hitel(); tartalek(); });
  });
  megtakaritas(); hitel(); tartalek();
})();

/* Calendly: csak kattintásra töltődik be (sütik és adattovábbítás csak hozzájárulással) */
document.querySelectorAll('.cal-box').forEach(function (box) {
  var btn = box.querySelector('.cal-load');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var url = box.getAttribute('data-cal-url');
    box.innerHTML = '<div class="calendly-inline-widget" style="min-width:320px;height:760px"></div>';
    var target = box.firstChild;
    var s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.onload = function () { window.Calendly.initInlineWidget({ url: url, parentElement: target }); };
    document.body.appendChild(s);
  });
});

/* Umami eseménymérés: letöltések, naptár, űrlapok (sütimentes, anonim) */
function track(name, data) { try { if (window.umami) window.umami.track(name, data); } catch (e) {} }
document.addEventListener('click', function (e) {
  var a = e.target.closest('a,button'); if (!a) return;
  if (a.hasAttribute('download')) track('Letöltés', { fájl: decodeURIComponent((a.getAttribute('href') || '').split('/').pop()) });
  else if (a.classList.contains('cal-load')) track('Naptár betöltése', { oldal: location.pathname });
  else if ((a.getAttribute('href') || '').indexOf('calendly.com') > -1) track('Calendly megnyitása', { oldal: location.pathname });
  else if ((a.getAttribute('href') || '').indexOf('tel:') === 0) track('Telefon kattintás');
  else if ((a.getAttribute('href') || '').indexOf('mailto:') === 0) track('E-mail kattintás');
});
document.querySelectorAll('form[data-mailto]').forEach(function (f) {
  f.addEventListener('submit', function () { track('Űrlap', { típus: f.getAttribute('data-mailto') }); });
});

/* Tally jelentkezési űrlap: csak kattintásra töltődik be */
document.querySelectorAll('.tally-box').forEach(function (box) {
  var btn = box.querySelector('.tally-load');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var id = box.getAttribute('data-tally-id');
    box.innerHTML = '<iframe data-tally-src="https://tally.so/embed/' + id + '?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="900" frameborder="0" marginheight="0" marginwidth="0" title="Jelentkezés – pénzügyi tanácsadói pálya" style="border:0;width:100%"></iframe>';
    var s = document.createElement('script');
    s.src = 'https://tally.so/widgets/embed.js';
    s.onload = function () { if (window.Tally) window.Tally.loadEmbeds(); };
    document.body.appendChild(s);
    track('Jelentkezési űrlap megnyitása');
  });
});

/* Élő számlálók + pörgő számok: akkor indulnak, amikor a látogató odagörget */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);run(e.target);}});},{threshold:.6}):null;
  function parse(txt){
    var m=txt.match(/^(\D*?)(\d+(?:[\s ]\d{3})*(?:,\d+)?)(.*)$/); if(!m) return null;
    var raw=m[2].replace(/[\s ]/g,''), dec=(raw.split(',')[1]||'').length;
    return {pre:m[1],val:parseFloat(raw.replace(',','.')),dec:dec,post:m[3],sep:/\d[\s ]\d/.test(m[2])||parseFloat(raw)>=10000};
  }
  function fmt(n,p){var s=n.toFixed(p.dec).replace('.',',');var parts=s.split(',');if(p.sep)parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ');return p.pre+parts.join(',')+p.post;}
  function run(el){
    var p=el._p; if(!p) return;
    if(reduce){el.textContent=fmt(p.val,p);return;}
    var dur=p.val>=1000?2000:1400,t0=null;
    function step(t){t0=t0||t;var k=Math.min((t-t0)/dur,1);el.textContent=fmt(p.val*(1-Math.pow(1-k,3)),p);if(k<1)requestAnimationFrame(step);else el.textContent=fmt(p.val,p);}
    requestAnimationFrame(step);
  }
  function arm(el){
    var p=parse(el.textContent.trim()); if(!p||!p.val) return;
    el._p=p;
    if(!io){return;}
    var r=el.getBoundingClientRect();
    if(r.top<innerHeight && r.bottom>0 && document.readyState==='complete' && scrollY>0){return;} /* már látszik görgetés közben: hagyjuk */
    el.textContent=fmt(0,p); io.observe(el);
  }
  /* 1) automatikusan pörgő nagy számok */
  var sel='.stat strong:not([data-nospin]):not(:has([data-stat])),.tax-pct,.bignum';
  try{document.querySelectorAll(sel).forEach(arm);}catch(e){document.querySelectorAll('.tax-pct,.bignum').forEach(arm);}
  /* 2) óraszám és diákszám a data/stats.json-ból – mindig az aktuális állás */
  var els=document.querySelectorAll('[data-stat]'); if(!els.length) return;
  fetch('data/stats.json',{cache:'no-cache'}).then(function(r){return r.json();}).then(function(st){
    els.forEach(function(el){
      var v=st[el.dataset.stat]; if(typeof v!=='number') return;
      var txt=String(v).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
      if(el.hasAttribute('data-count')){el.textContent=txt;arm(el);} else el.textContent=txt;
    });
  }).catch(function(){document.querySelectorAll('[data-stat][data-count]').forEach(arm);});
})();

/* Karrier: lebegő jelentkezés-gomb */
(function(){
  var b=document.querySelector('.sticky-cta'); if(!b) return;
  var form=document.getElementById('jelentkezes'); b.hidden=false; b.classList.add('off');
  function upd(){
    var y=window.scrollY, nearForm=false;
    if(form){var r=form.getBoundingClientRect(); nearForm=r.top<window.innerHeight && r.bottom>0;}
    b.classList.toggle('off', y<600 || nearForm);
  }
  window.addEventListener('scroll',upd,{passive:true}); upd();
})();

/* Nappali / éjszakai mód */
(function(){
  var b=document.querySelector('.theme-btn'); if(!b) return;
  b.addEventListener('click',function(){
    var next=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',next);
    try{localStorage.setItem('nz-theme',next);}catch(e){}
  });
})();

/* Korrepetálás szintkártyák: egyszerre egy legyen nyitva */
(function(){
  var ds=document.querySelectorAll('details.lvl'); if(!ds.length) return;
  ds.forEach(function(d){d.addEventListener('toggle',function(){
    if(!d.open) return;
    ds.forEach(function(o){if(o!==d) o.open=false;});
    setTimeout(function(){d.scrollIntoView({behavior:'smooth',block:'start'});},60);
  });});
})();

/* Karrier: jelentkezési fülek (hívás / űrlap) */
(function(){
  var tabs=document.querySelectorAll('.apply-tab'); if(!tabs.length) return;
  tabs.forEach(function(t){t.addEventListener('click',function(){
    tabs.forEach(function(o){var on=o===t;o.classList.toggle('on',on);o.setAttribute('aria-selected',on);document.getElementById(o.dataset.pane).hidden=!on;});
  });});
})();

/* ===== Telefonos nézet: összecsukás, gyorsmenü, alsó gombsáv ===== */
(function(){
  var mq=window.matchMedia('(max-width: 640px)');
  var root=document.documentElement;
  var touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
  root.classList.toggle('is-touch',touch);
  if(!mq.matches) return;
  root.classList.add('is-phone');
  var page=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';

  /* 1) Hosszú listák összecsukása: az első N elem látszik */
  var folds=[['.charts',2],['.state-row',1],['.why-grid',3],['.lgroups',1],['.gcol2 ul',3],['.cmp tbody',3],['.cv-grid',1]];
  folds.forEach(function(f){
    document.querySelectorAll(f[0]).forEach(function(box){
      var kids=Array.prototype.filter.call(box.children,function(c){return c.tagName!=='SCRIPT';});
      var n=f[1]; if(kids.length<=n+0) return;
      var hidden=kids.slice(n); hidden.forEach(function(k){k.classList.add('m-hide');});
      var b=document.createElement('button'); b.type='button'; b.className='m-more';
      b.innerHTML='Továbbiak megjelenítése <span>('+hidden.length+')</span>';
      b.addEventListener('click',function(){hidden.forEach(function(k){k.classList.remove('m-hide');}); b.remove();});
      var anchor=box.tagName==='TBODY'?box.closest('.cmp-wrap')||box.closest('table'):box;
      anchor.insertAdjacentElement('afterend',b);
    });
  });

  /* 2) Gyorsmenü a hosszú oldalakon */
  var navs={
    karrier:[['kinek','Kinek szól'],['diakoknak','Egyetemistáknak'],['mellekallas','Mellékállás'],['szakmabelieknek','Szakmabelieknek'],['karrierut','Karrierút'],['gyik','GYIK'],['jelentkezes','Jelentkezés']],
    tanacsadas:[['celok','Célok'],['teruletek','Területek'],['tamogatasok','Állami támogatás'],['folyamat','Folyamat'],['foglalas','Foglalás'],['gyik','GYIK']],
    korrepetalas:[['foglalas','Foglalás'],['csoportok','Barátokkal']],
    rolam:[['kapcsolat','Kapcsolat']]
  };
  var items=(navs[page]||[]).filter(function(x){return document.getElementById(x[0]);});
  if(items.length>=3){
    var nav=document.createElement('nav'); nav.className='m-quick'; nav.setAttribute('aria-label','Ugrás az oldalon');
    nav.innerHTML=items.map(function(x){return '<a href="#'+x[0]+'">'+x[1]+'</a>';}).join('');
    var hero=document.querySelector('main section'); if(hero) hero.insertAdjacentElement('afterend',nav);
    var links=nav.querySelectorAll('a');
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){var on=l.getAttribute('href')==='#'+e.target.id;l.classList.toggle('on',on);if(on)l.scrollIntoView({block:'nearest',inline:'center'});});}});},{rootMargin:'-45% 0px -50% 0px'});
      items.forEach(function(x){io.observe(document.getElementById(x[0]));});
    }
  }

  /* 3) Alsó cselekvési sáv */
  var tel=['tel:+36301966102','Hívás'];
  var bars={
    index:[['korrepetalas.html#foglalas','Órát foglalok'],['tanacsadas.html#foglalas','Tanácsadás']],
    korrepetalas:[['#foglalas','Órát foglalok'],tel],
    tanacsadas:[['#foglalas','Díjmentes időpont'],tel],
    karrier:[['#jelentkezes','Jelentkezem'],tel],
    rolam:[['#kapcsolat','Kapcsolat'],tel]
  };
  var cfg=bars[page]||[['rolam.html#kapcsolat','Kapcsolat'],tel];
  var bar=document.createElement('div'); bar.className='m-bar';
  bar.innerHTML=cfg.map(function(c,i){
    var ic=c[0].indexOf('tel:')===0?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>':'';
    return '<a class="'+(i===0?'mb-main':'mb-alt')+'" href="'+c[0]+'" data-umami-event="mobil-sav-'+page+'-'+(i+1)+'">'+ic+c[1]+'</a>';
  }).join('');
  document.body.appendChild(bar); document.body.classList.add('has-mbar');
  var target=document.querySelector(cfg[0][0].indexOf('#')===0?cfg[0][0]:'#__none');
  function upd(){
    var hide=window.scrollY<260;
    if(target){var r=target.getBoundingClientRect(); if(r.top<window.innerHeight*0.6 && r.bottom>120) hide=true;}
    bar.classList.toggle('off',hide);
  }
  window.addEventListener('scroll',upd,{passive:true}); upd();
})();

/* Telefonon: másodlagos szekciók összecsukva, a cím látszik */
(function(){
  if(!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('section[data-m-fold]').forEach(function(sec){
    var wrap=sec.querySelector('.wrap'); if(!wrap) return;
    var head=wrap.querySelector('.sec-head')||wrap.firstElementChild;
    var rest=Array.prototype.filter.call(wrap.children,function(c){return c!==head && !c.contains(head);});
    if(!rest.length) return;
    rest.forEach(function(c){c.classList.add('m-hide');});
    sec.classList.add('m-folded');
    var b=document.createElement('button'); b.type='button'; b.className='m-more m-open';
    b.textContent='Kibontom ↓';
    b.addEventListener('click',function(){rest.forEach(function(c){c.classList.remove('m-hide');}); sec.classList.remove('m-folded'); b.remove();});
    head.insertAdjacentElement('afterend',b);
  });
})();
