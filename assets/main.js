/* ===== BEÁLLÍTÁSOK – ezeket írd át ===== */
var CONFIG = {
  email: 'nagy.zoltan2223@gmail.com'   // ide érkeznek az űrlapok (e-mail-program nyílik meg)
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
