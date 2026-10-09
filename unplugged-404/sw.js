/* =============================================================================
   Unplugged404 · Service Worker
   -----------------------------------------------------------------------------
   When a user on your portfolio site clicks any link and their network is
   down, the browser would normally show a generic "No internet" screen.
   This service worker intercepts that failure and serves the unplugged
   page instead, booted straight into its OFFLINE variant.

   Works on: desktop Chrome / Edge / Firefox / Safari and mobile Safari /
   Chrome Android / Samsung Internet. Uses only the stable SW spec.
   ========================================================================== */

const CACHE    = 'unplugged-assets-v1';
const SCOPE    = (self.registration && self.registration.scope) || '/';
const ORIGIN   = new URL(SCOPE).origin;

/* Keep this list in sync with the files next to sw.js on disk. Resolved
   against the SW scope so the same file works at site root or in a sub-
   folder like /errors/unplugged/. */
const ASSETS = [
  '/unplugged-404/',
  '/unplugged-404/index.html',
  '/unplugged-404/style.css',
  '/unplugged-404/script.js',
  '/unplugged-404/fonts/Geist-Variable.woff2',
  '/unplugged-404/fonts/GeistMono-Variable.woff2',
].map((p) => new URL(p, ORIGIN).href);

const INDEX_URL = ASSETS[1]; /* /unplugged-404/index.html fully resolved */

const isNav   = (r) => r.mode === 'navigate' ||
  (r.method === 'GET' && (r.headers.get('accept') || '').includes('text/html'));
const isAsset = (u) => ASSETS.includes(u);

/* ---- INSTALL --------------------------------------------------------- */
/* Pre-cache everything so the unplugged page renders without a single
   network round-trip. Missing optional fonts (or files not yet deployed)
   never fail the install — the page still renders with system fallbacks. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(ASSETS.map((url) =>
        fetch(url, { credentials: 'same-origin', cache: 'reload' })
          .then((res) => { if (res && res.ok) return cache.put(url, res); })
          .catch(() => { if (!url.endsWith('.woff2')) throw undefined; })
      ))
    ).then(() => self.skipWaiting())
  );
});

/* ---- ACTIVATE -------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ---- HELPERS --------------------------------------------------------- */

/* Serve the cached unplugged index page. We deliberately respond at the
   *original* URL the user clicked — when network returns and they tap
   Refresh, their browser re-requests the page they actually wanted.
   The in-page boot script has three independent ways to know it should
   render OFFLINE copy instead of 404 copy:
     1. navigator.onLine === false (OS tells the browser the radio is off)
     2. document.documentElement.dataset.net   (set by inline head script)
     3. window.__UNPLUGGED_START_OFFLINE       (set by same inline script)
   For the edge case where navigator.onLine lies (connected to a Wi-Fi
   that has no upstream), we ship an extra marker on the Response body: a
   tiny inline script at the top of <head> that flips the flag. That way
   the SW can inject the offline state without any URL change. */
function serveCachedUnplugged(originalRequestUrl) {
  return caches.open(CACHE)
    .then((cache) => cache.match(INDEX_URL))
    .then((res) => {
      if (!res) return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      if (!res.body || typeof res.text !== 'function') return res;
      return res.text().then((html) => {
        const headRe = /<head[^>]*>/i;
        // Resolve the folder this unplugged install lives in so ./style.css
        // and ./fonts/* always resolve correctly, even when the fallback is
        // served from a deep path e.g. /portfolio/2026/solar-case-study/.
        const baseHref = '/unplugged-404/';
        const baseAttr = baseHref.replace(/"/g, '&quot;');

        // Offline flag script: this tiny inline script runs BEFORE any other
        // script/stylesheet and flips the page into OFFLINE mode.
        const flagCode =
          'try{' +
            'window.__UNPLUGGED_START_OFFLINE=true;' +
            'var h=document.documentElement;' +
            'h.setAttribute("data-net","offline");' +
            'document.title="Offline \\u00b7 Your connection came unplugged";' +
          '}catch(e){}';
        // Avoid putting literal "</script>" bytes into the JS string that
        // eventually ends up re-parsed in an HTML context.
        const CLOSE_SCRIPT = '\x3C/script>';
        const flag = '\x3Cscript data-sw-offline="1">' + flagCode + CLOSE_SCRIPT;
        const base = '\x3Cbase href="' + baseAttr + '" data-sw-base="1">';

        // If the cached HTML already has a <base> element, replace it with
        // the SW's canonical one (HTML uses the first <base> so duplicates
        // break asset resolution). Otherwise inject next to <head>.
        let injected = html;
        const baseRe = /<base\b[^>]*>/i;
        if (baseRe.test(injected)) {
          injected = injected.replace(baseRe, base);
          // Insert flag immediately after <head>, no base to add.
          injected = injected.replace(headRe, (m) => m + flag);
        } else if (headRe.test(injected)) {
          injected = injected.replace(headRe, (m) => m + base + flag);
        } else {
          injected = '<head>' + base + flag + CLOSE_SCRIPT.slice(0,0) + /* no close needed — next tag below */
            '</head>' + injected;
        }

        const headers = new Headers(res.headers);
        headers.set('Content-Type', 'text/html; charset=utf-8');
        headers.set('Cache-Control', 'no-store');
        headers.set('X-Unplugged-Fallback', '1');
        if (originalRequestUrl) headers.set('X-Unplugged-Original', originalRequestUrl);
        return new Response(injected, { status: 200, statusText: 'OK', headers });
      });
    });
}

/* Network-first navigation. If the request fails, times out, or the server
   responds with a transient 5xx / 408 / 429, we serve unplugged instead. */
function networkNavigation(req) {
  const controller = ('AbortController' in self) ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : 0;
  return fetch(req, controller ? { signal: controller.signal, credentials: 'same-origin', redirect: 'follow' } : undefined)
    .then((res) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (!res) return serveCachedUnplugged(req.url);
      if (res.type === 'opaqueredirect') return res; // let browser follow
      const s = res.status;
      if (s === 408 || s === 429 || (s >= 500 && s <= 599)) {
        return serveCachedUnplugged(req.url);
      }
      return res;
    })
    .catch(() => {
      if (timeoutId) clearTimeout(timeoutId);
      return serveCachedUnplugged(req.url);
    });
}

/* Cache-first (with silent background update) for the unplugged assets:
   the page renders instantly, even on pure-airplane mode. */
function cacheFirstAsset(req) {
  return caches.open(CACHE).then((cache) =>
    cache.match(req).then((cached) => {
      const fresh = fetch(req, { credentials: 'same-origin', redirect: 'follow' })
        .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => cached);
      return cached || fresh;
    })
  );
}

/* ---- FETCH ----------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== ORIGIN) return; /* never proxy cross-origin */

  if (isNav(req)) {
    // When the user is already on the unplugged page (e.g. /index.html
    // directly), we still want to refresh it from cache, not force the
    // fallback path (otherwise a bad single-file load would loop).
    if (isAsset(url.href)) {
      event.respondWith(
        cacheFirstAsset(req).catch(() => serveCachedUnplugged(req.url))
      );
      return;
    }
    event.respondWith(networkNavigation(req));
    return;
  }

  if (isAsset(url.href)) {
    event.respondWith(cacheFirstAsset(req));
    return;
  }

  // Everything else: default browser behaviour. Don't slow real pages down.
});
