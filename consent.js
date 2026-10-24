/* Basic Chefs - cookie consent + Google Analytics loader.
   Analytics (Google Analytics) loads ONLY after the visitor clicks Accept.
   Include on every page with: <script src="/consent.js"></script> (no other Google tag code needed). */
(function () {
  var GA_ID = 'G-H4QKR6ZRCE';
  var KEY = 'bc_consent_v1';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Safety: Google's own opt-out switch stays ON until consent is given.
  window['ga-disable-' + GA_ID] = true;

  function loadAnalytics() {
    window['ga-disable-' + GA_ID] = false;
    if (window.__bcGA) return;
    window.__bcGA = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearAnalyticsCookies() {
    var host = location.hostname.split('.');
    var domains = ['', location.hostname];
    for (var i = 1; i < host.length - 1; i++) domains.push('.' + host.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0 || name === '_gid' || name.indexOf('_gat') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var css = '' +
    '#bc-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:100000;max-width:640px;margin:0 auto;' +
    'background:#111;color:#fff;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.45);padding:18px 18px 16px;' +
    'font-family:Barlow,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5}' +
    '#bc-consent p{margin:0 0 14px;color:rgba(255,255,255,.88)}' +
    '#bc-consent a{color:#5CC8FF}' +
    '#bc-consent .bc-row{display:flex;gap:10px}' +
    '#bc-consent button{flex:1;min-height:46px;border:0;border-radius:10px;font:700 15px Barlow,system-ui,sans-serif;cursor:pointer}' +
    '#bc-consent button:focus-visible{outline:3px solid #5CC8FF;outline-offset:2px}' +
    '#bc-consent .bc-accept{background:#5CC8FF;color:#111}' +
    '#bc-consent .bc-reject{background:#fff;color:#111}';

  function hideBanner() {
    var b = document.getElementById('bc-consent');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  function showBanner() {
    if (document.getElementById('bc-consent')) return;
    if (!document.getElementById('bc-consent-css')) {
      var st = document.createElement('style');
      st.id = 'bc-consent-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var box = document.createElement('div');
    box.id = 'bc-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie choices');
    box.innerHTML =
      '<p>We’d like to use Google Analytics cookies to count visits anonymously. ' +
      'Nothing is loaded unless you say yes. Your saved recipes and badges stay on your device either way. ' +
      '<a href="/privacy/">Privacy &amp; cookies</a></p>' +
      '<div class="bc-row"><button type="button" class="bc-reject">Reject</button>' +
      '<button type="button" class="bc-accept">Accept</button></div>';
    box.querySelector('.bc-accept').onclick = function () { write('granted'); loadAnalytics(); hideBanner(); };
    box.querySelector('.bc-reject').onclick = function () {
      write('denied'); window['ga-disable-' + GA_ID] = true; clearAnalyticsCookies(); hideBanner();
    };
    document.body.appendChild(box);
  }

  // Footer / privacy page link: lets visitors change their mind any time.
  window.bcCookieSettings = function () { showBanner(); };

  function init() {
    var v = read();
    if (v === 'granted') loadAnalytics();
    else if (v !== 'denied') showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
