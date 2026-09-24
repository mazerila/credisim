/*
 * Credisim widget loader. Paste where the simulator should appear:
 *   <div data-credisim data-lang="fr" data-country="FR" data-type="mortgage" data-theme="light"></div>
 *   <script src="https://creditsimulator.web.app/embed.js" async></script>
 * Every data-* attribute is optional. The iframe resizes itself to its content.
 */
(function () {
  var origin = new URL(document.currentScript ? document.currentScript.src : 'https://creditsimulator.web.app/embed.js').origin;
  var keys = ['lang', 'country', 'type', 'theme'];
  var frames = [];

  function mount(el) {
    if (el.getAttribute('data-credisim-ready')) return;
    el.setAttribute('data-credisim-ready', '1');
    var q = new URLSearchParams();
    keys.forEach(function (k) { var v = el.getAttribute('data-' + k); if (v) q.set(k, v); });
    var f = document.createElement('iframe');
    f.src = origin + '/embed' + (q.toString() ? '?' + q : '');
    f.title = el.getAttribute('data-title') || 'Credisim loan simulator';
    f.loading = 'lazy';
    f.style.cssText = 'width:100%;height:760px;border:0;display:block;color-scheme:normal';
    el.appendChild(f);
    frames.push(f);
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== origin || !e.data || e.data.type !== 'credisim:height') return;
    frames.forEach(function (f) { if (f.contentWindow === e.source) f.style.height = e.data.height + 'px'; });
  });

  function init() { document.querySelectorAll('[data-credisim]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
