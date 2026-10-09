/* ============================================================================
   Unplugged404 – vanilla JS port
   susanoo.ui
   ----------------------------------------------------------------------------
   Exact behavioural equivalent of the React + framer-motion version, with a
   tiny motion-value + spring + tween runtime, Verlet cable simulation, and
   the same drag, magnet, snap, flicker and spark effects. Offline-safe.
   ============================================================================ */

(function () {
  'use strict';

  /* ======================================================================== */
  /* ============== Minimal motion-value / spring / tween runtime ============ */
  /* ======================================================================== */

  class MotionValue {
    constructor(initial) {
      this._v = initial;
      this._cbs = new Set();
    }
    get() { return this._v; }
    set(v) {
      if (this._v === v) return;
      this._v = v;
      this._cbs.forEach((fn) => { try { fn(v); } catch (_) {} });
    }
    on(_evt, fn) {
      this._cbs.add(fn);
      return () => this._cbs.delete(fn);
    }
  }

  /* Cubic bezier sampling, used by duration tweens. */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const g = sx(t) - x;
        if (Math.abs(g) < 1e-6) break;
        const d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= g / d;
      }
      return sy(t);
    };
  }
  const easeOutQuart = bezier(0.25, 1, 0.5, 1);
  const easeOut = bezier(0, 0, 0.58, 1);

  /* Easing name lookup. */
  function easingFrom(desc) {
    if (typeof desc === 'function') return desc;
    if (Array.isArray(desc)) return bezier(desc[0], desc[1], desc[2], desc[3]);
    if (desc === 'easeOut') return easeOut;
    return easeOutQuart;
  }

  /* A single animation: tweens a MotionValue, returns a { stop(), finished }
     handle. Supports spring + duration(keyframes) modes exactly like the
     original framer-motion calls. */
  function animate_(mv, to, opts) {
    const from = mv.get();
    opts = opts || {};
    let raf = 0;
    let stopped = false;
    const start = performance.now();

    /* Keyframes (array) or a single target. */
    const kfs = Array.isArray(to) ? to.slice() : [to];
    if (kfs[0] !== from) kfs.unshift(from);

    const finish = { promise: null, resolve: null };
    finish.promise = new Promise((r) => { finish.resolve = r; });

    if (opts.type === 'spring' || (!opts.duration && !Array.isArray(to) &&
        (opts.stiffness || opts.damping))) {
      /* ----- Spring ----- */
      const k = opts.stiffness != null ? opts.stiffness : 100;
      const d = opts.damping != null ? opts.damping : 10;
      const mass = opts.mass || 1;
      const target = Array.isArray(to) ? to[to.length - 1] : to;
      let velocity = opts.velocity || 0;
      let cur = from;
      let prev = performance.now();
      const step = (now) => {
        if (stopped) return;
        const dt = Math.min(32, now - prev) / 1000;
        prev = now;
        /* Two sub-steps for stability on stiff springs. */
        for (let s = 0; s < 2; s++) {
          const h = dt / 2;
          const f = -k * (cur - target) - d * velocity;
          velocity += (f / mass) * h;
          cur += velocity * h;
        }
        mv.set(cur);
        if (Math.abs(cur - target) < 0.01 && Math.abs(velocity) < 0.08) {
          mv.set(target);
          finish.resolve();
          return;
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    } else {
      /* ----- Duration tween (+ optional keyframes) ----- */
      const duration = (opts.duration || 0.3) * 1000;
      const ease = easingFrom(opts.ease || easeOutQuart);
      const segments = kfs.length - 1;
      const segDur = duration / segments;
      const step = (now) => {
        if (stopped) return;
        const elapsed = now - start;
        const p = segments === 1
          ? ease(Math.min(1, elapsed / duration))
          : Math.min(1, elapsed / duration);
        if (segments === 1) {
          mv.set(from + (kfs[1] - from) * p);
        } else {
          const segsF = p * segments;
          const si = Math.min(segments - 1, Math.floor(segsF));
          const st = segsF - si;
          const se = ease(st);
          mv.set(kfs[si] + (kfs[si + 1] - kfs[si]) * se);
        }
        if (elapsed >= duration) {
          mv.set(kfs[kfs.length - 1]);
          finish.resolve();
          return;
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    return {
      stop() { stopped = true; if (raf) cancelAnimationFrame(raf); raf = 0; },
      finished: finish.promise,
    };
  }

  /* A spring MotionValue that continuously follows another MotionValue.
     Mirrors the original { stiffness: 260, damping: 16 } tilt spring. */
  function useSpring(follow, springOpts) {
    const out = new MotionValue(follow.get());
    const k = springOpts.stiffness, d = springOpts.damping;
    const mass = springOpts.mass || 1;
    let cur = follow.get(), vel = 0;
    let raf = 0, prev = 0, idle = 0;
    const tick = (now) => {
      const dt = Math.min(32, now - prev) / 1000; prev = now;
      const target = follow.get();
      for (let s = 0; s < 2; s++) {
        const h = dt / 2;
        const f = -k * (cur - target) - d * vel;
        vel += (f / mass) * h;
        cur += vel * h;
      }
      out.set(cur);
      if (Math.abs(cur - target) < 0.008 && Math.abs(vel) < 0.02) {
        if (++idle > 3) { cur = target; out.set(cur); raf = 0; return; }
      } else idle = 0;
      raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) { prev = performance.now(); idle = 0; raf = requestAnimationFrame(tick); } };
    follow.on('change', wake);
    out._wakeFollow = follow;
    out.jump = (v) => { follow.set(v); cur = v; vel = 0; out.set(v); };
    return out;
  }

  /* ======================================================================== */
  /* ========================= Geometry & physics =========================== */
  /* ======================================================================== */

  const PLUG = { boot: 16, body: 46, h: 32, pin: 20 };
  const CABLE_W = 7;

  function measure(w, h) {
    const k = w < 520 ? 1 : Math.max(1, Math.min(1.3, (h - 20) / 140));
    const deskY = h - 46 * k;
    const deskLeft = 6;
    const wallX = w - 20 * k;
    const plateX = wallX - 6 * k;
    const faceX = plateX - 26 * k;
    const mouthY = deskY - 74 * k;
    const len = (PLUG.boot + PLUG.body) * k;
    const pin = PLUG.pin * k;
    const half = (PLUG.h * k) / 2;
    const pre = { x: faceX - pin, y: mouthY };
    const gap = Math.min(150 * k, (pre.x - deskLeft - len) * 0.55);
    return {
      w, h, k, deskY, deskLeft, deskH: 10 * k, wallX, plateX, faceX, mouthY,
      sockH: 26 * k, faceRx: 8 * k, len, pin, half, r: (CABLE_W * k) / 2,
      seat: { x: faceX, y: mouthY },
      pre,
      rest: { x: pre.x - gap, y: deskY - half },
      minX: deskLeft + len + 12,
      minY: half + 2,
      magnet: 44 * k,
      snap: 52 * k,
      align: 9 * k,
    };
  }

  function rubber(v, min, max, give = 50) {
    if (v < min) return min - give * (1 - 1 / (1 + (min - v) / give));
    if (v > max) return max + give * (1 - 1 / (1 + (v - max) / give));
    return v;
  }

  function land(t) {
    if (t < 0.62) return Math.pow(t / 0.62, 2);
    const bounce = (a, b, height) => { const u = (t - a) / (b - a); return 1 - height * 4 * u * (1 - u); };
    return t < 0.86 ? bounce(0.62, 0.86, 0.09) : bounce(0.86, 1, 0.022);
  }

  const nearSocket = (g, x, y) => x > g.pre.x - 1 || Math.hypot(g.pre.x - x, g.pre.y - y) < g.snap;

  function constrain(g, x, y) {
    x = rubber(x, g.minX, Infinity);
    y = Math.min(rubber(y, g.minY, Infinity), g.rest.y);

    const dx = g.pre.x - x;
    const dy = g.pre.y - y;
    const d = Math.hypot(dx, dy);
    if (x <= g.pre.x && d < g.magnet) {
      const pull = Math.pow(1 - d / g.magnet, 2);
      x += dx * pull * 0.6;
      y += dy * pull;
    }

    if (x > g.pre.x) {
      if (Math.abs(y - g.pre.y) <= g.align) {
        y = g.pre.y;
        x = Math.min(x, g.seat.x);
      } else if (Math.abs(y - g.mouthY) < g.half + g.sockH) {
        x = g.pre.x;
      } else {
        x = Math.min(x, g.wallX - g.pin - 1);
      }
    }
    return [x, y];
  }

  /* ---- Cable ---- */
  const SEG = 10;
  const DT = 1 / 120;
  const ITER = 30;
  const GRAVITY = 2400;
  const SAG = 60;
  const PULL = 5;

  function tailOf(g, x, y, deg) {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a), s = Math.sin(a);
    return { x: x - g.len * c, y: y - g.len * s, c, s };
  }

  function anchorOf(g, rope, tail) {
    const a = SAG * g.k;
    const neckX = tail.x - tail.c * SEG;
    const neckY = tail.y - tail.s * SEG;
    const h = Math.max(0, g.deskY - g.r - neckY);
    const s = Math.min(rope.len - 2 * SEG, Math.sqrt(h * h + 2 * h * a));
    const x = a * Math.acosh(1 + h / a);
    const ax = neckX - x - (rope.len - SEG - s) - PULL * g.k;
    if (ax >= g.deskLeft) return { x: ax, y: g.deskY - g.r };
    const corner = g.deskLeft - rope.rail;
    return { x: rope.rail, y: g.deskY - g.r + Math.max(0, g.deskLeft - ax - corner) };
  }

  function makeRope(g, tail) {
    const a = SAG * g.k;
    const hMax = g.deskY - g.minY;
    const want = Math.sqrt(hMax * hMax + 2 * hMax * a) + 36 * g.k;
    const n = Math.ceil(want / SEG) + 1;
    const rope = { pts: [], n, len: (n - 1) * SEG, rail: g.deskLeft - g.r - 0.5 };

    const head = anchorOf(g, rope, tail);
    const top = g.deskY - g.r;
    const path = [[head.x, head.y]];
    if (head.y > top) path.push([rope.rail, top]);
    const lastPt = path[path.length - 1];
    path.push([Math.max(lastPt[0], tail.x - SEG * 2), top], [tail.x, tail.y]);
    const lens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
    const total = lens.reduce((aa, bb) => aa + bb, 0) || 1;
    for (let i = 0, leg = 0, done = 0; i < n; i++) {
      const want_ = (total * i) / (n - 1);
      while (leg < lens.length - 1 && done + lens[leg] < want_) done += lens[leg++];
      const t = lens[leg] ? Math.min(1, (want_ - done) / lens[leg]) : 0;
      const px = path[leg][0] + (path[leg + 1][0] - path[leg][0]) * t;
      const py = path[leg][1] + (path[leg + 1][1] - path[leg][1]) * t;
      rope.pts.push({ x: px, y: py, px, py });
    }
    return rope;
  }

  function collide(p, g) {
    const r = g.r;
    if (p.x > g.wallX - r) p.x = g.wallX - r;

    const top = g.deskY - r;
    const bottom = g.deskY + g.deskH + r;
    const left = g.deskLeft - r;
    if (p.x > left && p.y > top && p.y < bottom) {
      const up = p.y - top, out = p.x - left, down = bottom - p.y;
      if (up <= out && up <= down) p.y = top;
      else if (out <= down) p.x = left;
      else p.y = bottom;
    }

    const sTop = g.mouthY - g.sockH - r;
    const sBottom = g.mouthY + g.sockH + r;
    const sLeft = g.faceX - g.faceRx - r;
    if (p.x > sLeft && p.y > sTop && p.y < sBottom) {
      const up = p.y - sTop, out = p.x - sLeft, down = sBottom - p.y;
      if (out <= up && out <= down) p.x = sLeft;
      else if (up <= down) p.y = sTop;
      else p.y = sBottom;
    }
  }

  function stepRope(rope, g, tail, damp) {
    const { pts, n } = rope;
    const grav = GRAVITY * DT * DT;

    for (let i = 1; i < n - 2; i++) {
      const p = pts[i];
      const vx = (p.x - p.px) * damp;
      const vy = (p.y - p.py) * damp;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + grav;
    }

    const end = pts[n - 1], neck = pts[n - 2];
    end.x = tail.x; end.y = tail.y;
    neck.x = tail.x - tail.c * SEG; neck.y = tail.y - tail.s * SEG;
    const head = anchorOf(g, rope, tail);
    pts[0].x += (head.x - pts[0].x) * 0.25;
    pts[0].y += (head.y - pts[0].y) * 0.25;

    for (let it = 0; it < ITER; it++) {
      for (let i = 0; i < n - 1; i++) {
        const aa = pts[i], bb = pts[i + 1];
        const wa = i > 0 && i < n - 2 ? 1 : 0;
        const wb = i + 1 < n - 2 ? 1 : 0;
        if (!wa && !wb) continue;
        const dx = bb.x - aa.x, dy = bb.y - aa.y;
        const dd = Math.hypot(dx, dy) || 1e-6;
        const f = (dd - SEG) / dd / (wa + wb);
        aa.x += dx * f * wa; aa.y += dy * f * wa;
        bb.x -= dx * f * wb; bb.y -= dy * f * wb;
      }
      for (let i = 0; i < n - 2; i++) {
        const aa = pts[i], bb = pts[i + 2];
        const wa = i > 0 ? 1 : 0;
        const wb = i + 2 < n - 2 ? 1 : 0;
        if (!wa && !wb) continue;
        const dx = bb.x - aa.x, dy = bb.y - aa.y;
        const dd = Math.hypot(dx, dy) || 1e-6;
        const min = SEG * 1.8;
        if (dd >= min) continue;
        const f = ((dd - min) / dd / (wa + wb)) * 0.5;
        aa.x += dx * f * wa; aa.y += dy * f * wa;
        bb.x -= dx * f * wb; bb.y -= dy * f * wb;
      }
      for (let j = 1; j <= 2; j++) {
        const p = pts[n - 2 - j];
        const pull = j === 1 ? 0.3 : 0.1;
        p.x += (neck.x - tail.c * SEG * j - p.x) * pull;
        p.y += (neck.y - tail.s * SEG * j - p.y) * pull;
      }
      for (let i = 1; i < n - 2; i++) collide(pts[i], g);
    }

    for (let i = 1; i < n - 2; i++) {
      const p = pts[i], aa = pts[i - 1], bb = pts[i + 1];
      p.x += ((aa.x + bb.x) / 2 - p.x) * 0.3;
      p.y += ((aa.y + bb.y) / 2 - p.y) * 0.3;
      collide(p, g);
    }

    for (let i = 1; i < n - 2; i++) {
      const p = pts[i];
      if (p.x > g.deskLeft && p.y >= g.deskY - g.r - 0.2) p.px += (p.x - p.px) * 0.3;
    }
  }

  function ropePath(rope, g) {
    const { pts, n, rail } = rope;
    const f = (v) => Math.round(v * 10) / 10;
    const head = pts[0];
    const top = g.deskY - g.r;
    let d = `M${f(rail)} ${f(g.h + 40)}`;
    if (head.y <= top + 0.5) {
      const bend = 2 * g.r;
      d += `V${f(top + bend)}Q${f(rail)} ${f(top)} ${f(rail + bend)} ${f(top)}L${f(head.x)} ${f(head.y)}`;
    } else {
      d += `L${f(head.x)} ${f(head.y)}`;
    }
    for (let i = 1; i < n - 1; i++) {
      const aa = pts[i], bb = pts[i + 1];
      d += `Q${f(aa.x)} ${f(aa.y)} ${f((aa.x + bb.x) / 2)} ${f((aa.y + bb.y) / 2)}`;
    }
    const end = pts[n - 1];
    return `${d}L${f(end.x)} ${f(end.y)}`;
  }

  /* Cable RAF loop driver. */
  function makeCableDriver(geoRef, nx, ny, rot, stillRef, dSetter) {
    let rope = null;
    let raf = 0, last = 0, acc = 0, quiet = 0, moved = true;
    const wake = () => { moved = true; if (!raf) { last = performance.now(); acc = 0; raf = requestAnimationFrame(tick); } };
    nx.on('change', wake); ny.on('change', wake); rot.on('change', wake);

    function tail() { return tailOf(geoRef(), nx.get(), ny.get(), rot.get()); }

    function rebuild() {
      const g = geoRef();
      rope = makeRope(g, tail());
      for (let i = 0; i < 480; i++) stepRope(rope, g, tail(), 0.9);
      dSetter(ropePath(rope, g));
      wake();
    }
    function settle() {
      if (!rope) return;
      const g = geoRef();
      for (let i = 0; i < 360; i++) stepRope(rope, g, tail(), 0.6);
      dSetter(ropePath(rope, g));
    }
    function tick(now) {
      const r = rope;
      if (!r) { raf = 0; return; }
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = geoRef();
      const t = tail();
      const damp = stillRef() ? 0.6 : 0.988;
      let steps = 0;
      while (acc >= DT && steps < 8) { stepRope(r, g, t, damp); acc -= DT; steps++; }
      dSetter(ropePath(r, g));

      let motion = 0;
      for (const p of r.pts) motion = Math.max(motion, Math.abs(p.x - p.px) + Math.abs(p.y - p.py));
      quiet = moved || motion > 0.015 ? 0 : quiet + 1;
      moved = false;
      if (quiet > 45) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
    }
    return { rebuild, settle };
  }

  /* ======================================================================== */
  /* =============================== DOM build ============================== */
  /* ======================================================================== */

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, children = []) => {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]);
      else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  };
  const svg = (tag, attrs = {}, children = []) => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) {
      if (k === 'class') e.setAttribute('class', attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  };

  /* Arrow + Plug icons. */
  function ArrowIcon() {
    return svg('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round',
      'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [
      svg('path', { d: 'M19 12H5M11 6l-6 6 6 6' }),
    ]);
  }
  function PlugIcon() {
    return svg('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round',
      'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [
      svg('path', { d: 'M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5' }),
    ]);
  }

  const RAYS = [-168, -140, -112, -86, 94, 118, 146, 176];
  function SparkEl(x, y, k) {
    const kids = [svg('circle', { class: 'up-flash', cx: x, cy: y, r: 24 * k })];
    RAYS.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const c = Math.cos(a), s = Math.sin(a);
      const inner = 6 * k, outer = (i % 2 ? 16 : 23) * k;
      kids.push(svg('path', {
        class: 'up-ray', pathLength: '1',
        d: `M${x + c * inner} ${y + s * inner}L${x + c * outer} ${y + s * outer}`,
        style: `animation-delay:${(i % 3) * 22}ms`,
      }));
    });
    return svg('g', { class: 'up-spark' }, kids);
  }

  /* ======================================================================== */
  /* =========================== Component mount ============================ */
  /* ======================================================================== */

  function mount(rootEl, opts) {
    opts = opts || {};
    const labels = Object.assign({
      home: 'Take me home',
      plugIn: 'Plug it back in',
      unplug: 'Unplug it',
      hint: 'Drag the plug into the socket',
      cable: 'Power cable',
      lost: 'Signal lost',
      restored: 'Power restored',
    }, opts.labels || {});
    const offlineLabels = Object.assign({
      home: 'Take me home',
      plugIn: 'Reconnect now',
      unplug: 'Disconnect',
      hint: 'Drag the Wi-Fi plug into the socket',
      cable: 'Network cable',
      lost: 'No connection',
      restored: 'Back online',
    }, opts.offlineLabels || {});
    const homeHref = opts.homeHref != null ? opts.homeHref : '/';
    const secondaryHref = opts.secondaryHref || null;
    const secondaryLabel = opts.secondaryLabel || 'Contact support';
    const code = opts.code || '404';
    const title = opts.title || 'This page came unplugged.';
    const message = opts.message != null ? opts.message
      : "We couldn't find the page you were looking for. It may have moved, or the link may be broken.";
    const offlineCode = opts.offlineCode != null ? opts.offlineCode : 'OFFLINE';
    const offlineTitle = opts.offlineTitle || "Your connection came unplugged.";
    const offlineMessage = opts.offlineMessage != null ? opts.offlineMessage
      : "It looks like your network dropped out. Plug it back in once you're online, or head home and try again later.";
    const startPlugged = !!opts.startPlugged;
    const autoOffline = opts.autoOffline !== false;      // default ON
    const onHome = opts.onHome || null;
    const onPlug = opts.onPlug || null;
    const onMode = opts.onMode || null;

    /* What the page is currently showing. Switches live if the network
       drops or comes back (autoOffline only). Sources that force 'offline':
         – window.__UNPLUGGED_START_OFFLINE (set by the in-head boot script
           for navigator.onLine=false, ?__offline=1 SW fallback flag, or
           manual override)
         – navigator.onLine === false
         – the data-net="offline" attribute the head script sets on <html>
       This ensures users who click a portfolio link while offline (and are
       served this page via SW fallback) see the OFFLINE variant immediately
       instead of a 404 flash. */
    let forcedOffline = false;
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.__UNPLUGGED_START_OFFLINE === 'boolean') {
          forcedOffline = window.__UNPLUGGED_START_OFFLINE;
        } else if (document.documentElement.getAttribute('data-net') === 'offline') {
          forcedOffline = true;
        } else if (/[?&]__offline=1(&|#|$)/.test(window.location.search)) {
          forcedOffline = true;
        }
      }
    } catch (_) {}
    const navOffline =
      autoOffline && typeof navigator !== 'undefined' && navigator.onLine === false;
    let mode = (autoOffline && (forcedOffline || navOffline)) ? 'offline' : 'notfound';
    function currentLabels() { return mode === 'offline' ? offlineLabels : labels; }
    function currentCode()   { return mode === 'offline' ? offlineCode : code; }
    function currentTitle()  { return mode === 'offline' ? offlineTitle : title; }
    function currentMessage(){ return mode === 'offline' ? offlineMessage : message; }

    /* Reduced motion. */
    let reduced = false;
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      reduced = mq.matches;
      mq.addEventListener('change', () => { reduced = mq.matches; });
    } catch (_) {}
    const stillRef = () => reduced;

    /* State. */
    let plugged = startPlugged;
    let phase = null; // 'booting' | 'dying' | null
    let spark = 0;
    let dragging = false;
    let near = false;

    /* Geometry. */
    let geo = measure(660, 210);
    const geoRef = () => geo;

    /* Motion values. */
    const startPos = startPlugged ? geo.seat : geo.rest;
    const nx = new MotionValue(startPos.x);
    const ny = new MotionValue(startPos.y);
    const tilt = new MotionValue(0);
    const rot = useSpring(tilt, { stiffness: 260, damping: 16 });

    /* Plug state refs. */
    const pluggedRef = () => plugged;
    const onPlugRef = (v) => { if (onPlug) onPlug(v); };
    const labelsRef = () => currentLabels();

    /* ---------- Build DOM ---------- */
    const uid = 'u' + Math.random().toString(36).slice(2, 9);

    const root = el('div', { class: 'unplugged-root', 'data-power': plugged ? 'on' : 'off',
      style: { '--up-k': String(geo.k) } });
    rootEl.appendChild(root);

    function setRootClasses() {
      root.classList.toggle('is-booting', phase === 'booting');
      root.classList.toggle('is-dying', phase === 'dying');
      root.classList.toggle('is-dragging', dragging);
      root.classList.toggle('is-near', near);
    }

    /* Status line. */
    const statusDot = el('span', { class: 'up-status-dot' });
    const statusText = document.createTextNode(plugged ? currentLabels().restored : currentLabels().lost);
    root.appendChild(el('p', { class: 'up-status', 'aria-hidden': 'true' }, [statusDot, statusText]));
    const srAnnounce = el('p', { class: 'up-sr', role: 'status' });
    root.appendChild(srAnnounce);
    function updateStatus() {
      statusText.textContent = plugged ? currentLabels().restored : currentLabels().lost;
      root.setAttribute('data-power', plugged ? 'on' : 'off');
    }

    /* Screen: text nodes are kept in variables so a network -> offline/online
       flip can swap their text without rebuilding any DOM. */
    const codePrefix = el('span', { class: 'up-sr' }, (mode === 'offline' ? 'Status ' : 'Error '));
    const codeText = document.createTextNode(currentCode());
    const codeEl = el('p', { class: 'up-code' }, [codePrefix, codeText]);
    const titleText = document.createTextNode(currentTitle());
    const titleEl = el('h1', { class: 'up-title' }, [titleText]);
    const messageText = document.createTextNode(currentMessage() || '');
    const msgEl = currentMessage()
      ? el('p', { class: 'up-message' }, [messageText])
      : null;
    const screen = el('div', { class: 'up-screen' }, [codeEl, titleEl, msgEl].filter(Boolean));
    const actions = el('div', { class: 'up-actions' });
    const homeText = document.createTextNode(currentLabels().home);
    const homeEl = (() => {
      const content = [ArrowIcon(), el('span', {}, [homeText])];
      if (homeHref != null) {
        return el('a', { class: 'up-home', href: homeHref,
          onclick: (e) => { if (onHome) onHome(e); } }, content);
      }
      return el('button', { type: 'button', class: 'up-home',
        onclick: (e) => { if (onHome) onHome(e); } }, content);
    })();
    actions.appendChild(homeEl);
    if (secondaryHref) {
      actions.appendChild(el('a', { class: 'up-secondary', href: secondaryHref }, [secondaryLabel]));
    }
    screen.appendChild(actions);
    root.appendChild(screen);

    /* Rig. */
    const rig = el('div', { class: 'up-rig' });
    const hintText = document.createTextNode(currentLabels().hint);
    const hintEl = el('p', { class: 'up-hint', 'aria-hidden': 'true' }, [hintText]);
    const fallbackText = document.createTextNode(plugged ? currentLabels().unplug : currentLabels().plugIn);
    const fallbackBtn = el('button', { type: 'button', class: 'up-fallback' }, [PlugIcon(), el('span', {}, [fallbackText])]);
    function updateFallbackText() {
      fallbackText.textContent = plugged ? currentLabels().unplug : currentLabels().plugIn;
    }
    rig.appendChild(el('div', { class: 'up-controls' }, [hintEl, fallbackBtn]));

    const stage = el('div', { class: 'up-stage' });
    rig.appendChild(stage);

    /* Scene SVG (desk + wall). */
    const sceneSvg = svg('svg', { class: 'up-scene', 'aria-hidden': 'true', focusable: 'false' });
    const sceneDefs = svg('defs');
    const wallGrad = svg('linearGradient', { id: `${uid}-wall`, x1: '0', y1: '0', x2: '1', y2: '0' }, [
      svg('stop', { offset: '0', class: 'up-stop-wall' }),
      svg('stop', { offset: '1', class: 'up-stop-wall', 'stop-opacity': '0' }),
    ]);
    const fadeGrad = svg('linearGradient', { id: `${uid}-fade`, x1: '0', y1: '0', x2: '0', y2: '1' }, [
      svg('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '0' }),
      svg('stop', { offset: '0.6', 'stop-color': '#fff' }),
    ]);
    const wallMask = svg('mask', { id: `${uid}-wall-mask` });
    const wallMaskRect = svg('rect', { x: '0', y: '0', width: '0', height: '0', fill: `url(#${uid}-fade)` });
    wallMask.appendChild(wallMaskRect);
    sceneDefs.appendChild(wallGrad);
    sceneDefs.appendChild(fadeGrad);
    sceneDefs.appendChild(wallMask);
    sceneSvg.appendChild(sceneDefs);
    const wallGroup = svg('g', { mask: `url(#${uid}-wall-mask)` });
    const wallRect = svg('rect', { x: '0', y: '0', width: '0', height: '0', fill: `url(#${uid}-wall)` });
    const wallLine = svg('rect', { class: 'up-wall-line', x: '0', y: '0', width: '1', height: '0' });
    wallGroup.appendChild(wallRect); wallGroup.appendChild(wallLine);
    sceneSvg.appendChild(wallGroup);
    const deskRect = svg('rect', { class: 'up-desk', x: '0', y: '0', width: '0', height: '0', rx: '0' });
    const deskEdge = svg('rect', { class: 'up-desk-edge', x: '0', y: '0', width: '0', height: '1' });
    sceneSvg.appendChild(deskRect); sceneSvg.appendChild(deskEdge);
    stage.appendChild(sceneSvg);

    /* Socket SVG. */
    const sockSvg = svg('svg', { class: 'up-socket', 'aria-hidden': 'true', focusable: 'false' });
    const sockDefs = svg('defs');
    const barrelGrad = svg('linearGradient', { id: `${uid}-barrel`, x1: '0', y1: '0', x2: '0', y2: '1' }, [
      svg('stop', { offset: '0', class: 'up-stop-socket-lo' }),
      svg('stop', { offset: '0.22', class: 'up-stop-socket-hi' }),
      svg('stop', { offset: '1', class: 'up-stop-socket-lo' }),
    ]);
    sockDefs.appendChild(barrelGrad);
    sockSvg.appendChild(sockDefs);
    const barrelRect = svg('rect', { class: 'up-barrel', x: '0', y: '0', width: '0', height: '0', fill: `url(#${uid}-barrel)` });
    const plateRect = svg('rect', { class: 'up-plate', x: '0', y: '0', width: '0', height: '0', rx: '0' });
    const sockFace = svg('ellipse', { class: 'up-socket-face', cx: '0', cy: '0', rx: '0', ry: '0' });
    const recess = svg('ellipse', { class: 'up-recess', cx: '0', cy: '0', rx: '0', ry: '0' });
    const hole1 = svg('ellipse', { class: 'up-hole', cx: '0', cy: '0', rx: '0', ry: '0' });
    const hole2 = svg('ellipse', { class: 'up-hole', cx: '0', cy: '0', rx: '0', ry: '0' });
    const sockLed = svg('circle', { class: 'up-led', cx: '0', cy: '0', r: '0' });
    sockSvg.appendChild(barrelRect); sockSvg.appendChild(plateRect); sockSvg.appendChild(sockFace);
    sockSvg.appendChild(recess); sockSvg.appendChild(hole1); sockSvg.appendChild(hole2); sockSvg.appendChild(sockLed);
    stage.appendChild(sockSvg);

    /* Cable SVG (3 paths). */
    const cableSvg = svg('svg', { class: 'up-cable', 'aria-hidden': 'true', focusable: 'false' });
    const cableEdge = svg('path', { class: 'up-cable-edge', d: '' });
    const cableBody = svg('path', { class: 'up-cable-body', d: '' });
    const cableShine = svg('path', { class: 'up-cable-shine', d: '' });
    cableSvg.appendChild(cableEdge); cableSvg.appendChild(cableBody); cableSvg.appendChild(cableShine);
    stage.appendChild(cableSvg);

    /* Plug button + artwork. */
    const plugBtn = el('button', { type: 'button', class: 'up-plug',
      role: 'switch', 'aria-checked': plugged ? 'true' : 'false', 'aria-label': labels.cable });
    plugBtn.style.transformOrigin = '100% 50%';

    const plugSvg = svg('svg', { viewBox: '0 0 82 32', 'aria-hidden': 'true', focusable: 'false' });
    const plugDefs = svg('defs');
    const plugBodyGrad = svg('linearGradient', { id: `${uid}-body`, x1: '0', y1: '0', x2: '0', y2: '1' }, [
      svg('stop', { offset: '0', class: 'up-stop-plug-hi' }),
      svg('stop', { offset: '1', class: 'up-stop-plug-lo' }),
    ]);
    const plugPinGrad = svg('linearGradient', { id: `${uid}-pin`, x1: '0', y1: '0', x2: '0', y2: '1' }, [
      svg('stop', { offset: '0', class: 'up-stop-pin-hi' }),
      svg('stop', { offset: '1', class: 'up-stop-pin-lo' }),
    ]);
    plugDefs.appendChild(plugBodyGrad); plugDefs.appendChild(plugPinGrad);
    plugSvg.appendChild(plugDefs);
    plugSvg.appendChild(svg('rect', { x: '58', y: '5.5', width: '23.5', height: '5', rx: '2.5', fill: `url(#${uid}-pin)` }));
    plugSvg.appendChild(svg('rect', { x: '58', y: '21.5', width: '23.5', height: '5', rx: '2.5', fill: `url(#${uid}-pin)` }));
    plugSvg.appendChild(svg('path', { class: 'up-boot',
      d: 'M18 5.5C11 7 6 11 1.5 12.6a1.6 1.6 0 0 0-1.5 1.6v3.6a1.6 1.6 0 0 0 1.5 1.6C6 21 11 25 18 26.5Z' }));
    plugSvg.appendChild(svg('path', { class: 'up-groove', d: 'M5.5 11.4v9.2M10 9.2v13.6' }));
    plugSvg.appendChild(svg('rect', { class: 'up-body', x: '15', y: '0.5', width: '47', height: '31', rx: '7', fill: `url(#${uid}-body)` }));
    plugSvg.appendChild(svg('path', { class: 'up-groove', d: 'M24 8.5v15M29 8.5v15M34 8.5v15' }));
    plugSvg.appendChild(svg('path', { class: 'up-sheen', d: 'M21 2.2h34' }));
    plugSvg.appendChild(svg('rect', { class: 'up-face', x: '57', y: '3.5', width: '5', height: '25', rx: '2' }));
    plugBtn.appendChild(plugSvg);
    stage.appendChild(plugBtn);

    /* FX layer for spark. */
    const fxSvg = svg('svg', { class: 'up-fx', 'aria-hidden': 'true', focusable: 'false' });
    stage.appendChild(fxSvg);

    root.appendChild(rig);

    /* ---------- Cable driver (writes d attrs) ---------- */
    const dSetter = (d) => {
      cableEdge.setAttribute('d', d);
      cableBody.setAttribute('d', d);
      cableShine.setAttribute('d', d);
    };
    const cable = makeCableDriver(geoRef, nx, ny, rot, stillRef, dSetter);

    /* ---------- Apply plug transform, pin clip, shine translate ---------- */
    function applyPlugTransform() {
      const x = nx.get(), y = ny.get(), r = rot.get();
      plugBtn.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
      // Pin clip: clipPath on the plug SVG
      const inside = x + PLUG.pin * geo.k - geo.faceX;
      if (inside > 0) {
        plugSvg.style.clipPath = `inset(-24px ${inside.toFixed(2)}px -24px -24px)`;
      } else {
        plugSvg.style.clipPath = 'none';
      }
      // Cable shine translate
      cableShine.setAttribute('transform', `translate(0 ${(-1.6 * geo.k).toFixed(3)})`);
      // Cable stroke widths (depend on k)
      cableEdge.setAttribute('stroke-width', (CABLE_W * geo.k + 2).toFixed(3));
      cableBody.setAttribute('stroke-width', (CABLE_W * geo.k).toFixed(3));
      cableShine.setAttribute('stroke-width', (1.5 * geo.k).toFixed(3));
    }
    nx.on('change', applyPlugTransform);
    ny.on('change', applyPlugTransform);
    rot.on('change', applyPlugTransform);

    /* ---------- Geometry -> render scene/socket sizes ---------- */
    function applyGeometry() {
      const g = geo;
      root.style.setProperty('--up-k', String(g.k));

      // Scene
      wallMaskRect.setAttribute('x', (g.wallX - 2).toFixed(2));
      wallMaskRect.setAttribute('height', String(g.h));
      wallMaskRect.setAttribute('width', String(90 * g.k));
      wallRect.setAttribute('x', String(g.wallX));
      wallRect.setAttribute('width', String(80 * g.k));
      wallRect.setAttribute('height', String(g.h));
      wallLine.setAttribute('x', String(g.wallX));
      wallLine.setAttribute('height', String(g.h));
      deskRect.setAttribute('x', String(g.deskLeft));
      deskRect.setAttribute('y', String(g.deskY));
      deskRect.setAttribute('width', String(g.wallX - g.deskLeft));
      deskRect.setAttribute('height', String(g.deskH));
      deskRect.setAttribute('rx', String(2.5 * g.k));
      deskEdge.setAttribute('x', String(g.deskLeft + 2));
      deskEdge.setAttribute('y', String(g.deskY));
      deskEdge.setAttribute('width', String(g.wallX - g.deskLeft - 2));

      // Socket
      const top = g.mouthY - g.sockH;
      barrelRect.setAttribute('x', String(g.faceX));
      barrelRect.setAttribute('y', String(top));
      barrelRect.setAttribute('width', String(g.plateX - g.faceX + 2));
      barrelRect.setAttribute('height', String(g.sockH * 2));
      plateRect.setAttribute('x', String(g.plateX));
      plateRect.setAttribute('y', String(g.mouthY - 50 * g.k));
      plateRect.setAttribute('width', String(g.wallX - g.plateX + 1));
      plateRect.setAttribute('height', String(100 * g.k));
      plateRect.setAttribute('rx', String(2 * g.k));
      sockFace.setAttribute('cx', String(g.faceX));
      sockFace.setAttribute('cy', String(g.mouthY));
      sockFace.setAttribute('rx', String(g.faceRx));
      sockFace.setAttribute('ry', String(g.sockH));
      recess.setAttribute('cx', String(g.faceX - 0.5 * g.k));
      recess.setAttribute('cy', String(g.mouthY));
      recess.setAttribute('rx', String(g.faceRx * 0.6));
      recess.setAttribute('ry', String(g.sockH * 0.74));
      hole1.setAttribute('cx', String(g.faceX - 0.6 * g.k));
      hole1.setAttribute('cy', String(g.mouthY - 8 * g.k));
      hole1.setAttribute('rx', String(1.8 * g.k));
      hole1.setAttribute('ry', String(3.4 * g.k));
      hole2.setAttribute('cx', String(g.faceX - 0.6 * g.k));
      hole2.setAttribute('cy', String(g.mouthY + 8 * g.k));
      hole2.setAttribute('rx', String(1.8 * g.k));
      hole2.setAttribute('ry', String(3.4 * g.k));
      sockLed.setAttribute('cx', String(g.plateX - 8 * g.k));
      sockLed.setAttribute('cy', String(top + 7 * g.k));
      sockLed.setAttribute('r', String(2.3 * g.k));
    }

    /* ---------- Power -------------------------------------------------- */
    let phaseTimer = 0;
    function power(on) {
      if (pluggedRef() === on) return;
      plugged = on;
      plugBtn.setAttribute('aria-checked', on ? 'true' : 'false');
      phase = on ? 'booting' : 'dying';
      srAnnounce.textContent = on ? labelsRef().restored : labelsRef().lost;
      if (on) {
        spark++;
        // Re-render spark element with new key (re-mount via innerHTML replacement)
        if (!reduced) {
          fxSvg.innerHTML = '';
          fxSvg.appendChild(SparkEl(geo.faceX, geo.mouthY, geo.k));
          // Auto remove after animation
          setTimeout(() => { fxSvg.innerHTML = ''; }, 500);
        }
      }
      updateStatus();
      updateFallbackText();
      setRootClasses();
      if (phaseTimer) clearTimeout(phaseTimer);
      phaseTimer = setTimeout(() => { phase = null; setRootClasses(); }, phase === 'booting' ? 1000 : 520);
      onPlugRef(on);
    }

    /* ---------- Plug animations (seat/drop/plugIn/unplug) ------------- */
    let moves = [];
    let moveId = 0;
    const newMove = () => { moves.forEach((a) => a.stop()); moves = []; return ++moveId; };
    const run = (mv, to, opts) => { const a = animate_(mv, to, opts); moves.push(a); return a; };
    const stale = (id) => id !== moveId;
    const place = (at) => { nx.set(at.x); ny.set(at.y); tilt.set(0); rot.jump(0); cable.settle(); applyPlugTransform(); };

    async function seat(id) {
      if (id === undefined) id = newMove();
      const g = geoRef();
      if (reduced) { place(g.seat); power(true); return; }
      tilt.set(0);
      if (nx.get() < g.pre.x - 0.5 || Math.abs(ny.get() - g.pre.y) > 0.5) {
        await Promise.all([
          run(nx, g.pre.x, { type: 'spring', stiffness: 520, damping: 38 }).finished,
          run(ny, g.pre.y, { type: 'spring', stiffness: 700, damping: 42 }).finished,
        ]);
        if (stale(id)) return;
      }
      await run(nx, g.seat.x, { duration: 0.09, ease: [0.6, 0, 1, 0.5] }).finished;
      if (stale(id)) return;
      power(true);
      run(nx, [g.seat.x, g.seat.x - 1.4 * g.k, g.seat.x], { duration: 0.16, ease: 'easeOut' });
    }

    function drop(id) {
      if (id === undefined) id = newMove();
      const g = geoRef();
      if (reduced) { place(g.rest); return id; }
      const fall = Math.max(0, g.rest.y - ny.get());
      tilt.set(0);
      run(ny, g.rest.y, { duration: 0.26 + Math.sqrt(fall) * 0.028, ease: land });
      run(nx, g.rest.x, { type: 'spring', stiffness: 70, damping: 14 });
      return id;
    }

    async function plugIn() {
      const id = newMove();
      const g = geoRef();
      if (reduced) { place(g.seat); power(true); return; }
      tilt.set(-5);
      await Promise.all([
        run(nx, g.pre.x, { type: 'spring', stiffness: 80, damping: 17 }).finished,
        run(ny, g.pre.y, { type: 'spring', stiffness: 170, damping: 21 }).finished,
      ]);
      if (stale(id)) return;
      seat(id);
    }

    async function unplug() {
      const id = newMove();
      const g = geoRef();
      power(false);
      if (reduced) { place(g.rest); return; }
      await run(nx, g.pre.x - 8 * g.k, { duration: 0.16, ease: [0.3, 0, 0.2, 1] }).finished;
      if (stale(id)) return;
      drop(id);
    }

    const toggle = () => (pluggedRef() ? unplug() : plugIn());

    /* ---------- Pointer drag ----------------------------------------- */
    let grab = null;
    let clickGuard = 0;
    let tiltTimer = 0;

    // Cancel native touchmove while on the plug (prevents pull-to-refresh)
    plugBtn.addEventListener('touchmove', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });

    plugBtn.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      clickGuard = 0;
      try { plugBtn.setPointerCapture(e.pointerId); } catch (_) {}
      newMove();
      const rect = stage.getBoundingClientRect();
      const scale = rect.width / stage.offsetWidth || 1;
      grab = {
        id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: nx.get(), oy: ny.get(),
        scale, moved: false, vy: 0, lastY: ny.get(), lastT: e.timeStamp,
      };
    });

    window.addEventListener('pointermove', (e) => {
      if (!grab || grab.id !== e.pointerId) return;
      const dx = (e.clientX - grab.sx) / grab.scale;
      const dy = (e.clientY - grab.sy) / grab.scale;
      if (!grab.moved) {
        if (Math.hypot(dx, dy) < 4) return;
        grab.moved = true;
        dragging = true;
        setRootClasses();
      }
      const g = geoRef();
      const [x, y] = constrain(g, grab.ox + dx, grab.oy + dy);
      nx.set(x); ny.set(y);

      if (pluggedRef() && x < g.seat.x - 3 * g.k) power(false);

      const isNear = nearSocket(g, x, y);
      if (isNear !== near) { near = isNear; setRootClasses(); }

      if (!reduced) {
        const dt = Math.max(1, e.timeStamp - grab.lastT) / 1000;
        grab.vy = grab.vy * 0.6 + ((y - grab.lastY) / dt) * 0.4;
        grab.lastY = y; grab.lastT = e.timeStamp;
        const lifted = y < g.rest.y - 1;
        const toMouth = Math.min(1, Math.hypot(g.pre.x - x, g.pre.y - y) / g.magnet);
        const base = lifted ? -4 : 0;
        tilt.set(x > g.pre.x ? 0 : (base + Math.max(-14, Math.min(14, grab.vy * 0.012))) * toMouth);
        clearTimeout(tiltTimer);
        tiltTimer = setTimeout(() => {
          if (!grab) return;
          const gg = geoRef();
          tilt.set(ny.get() < gg.rest.y - 1 && nx.get() <= gg.pre.x ? -4 * toMouth : 0);
        }, 90);
      }
    });

    const endDrag = (e) => {
      if (!grab || grab.id !== e.pointerId) return;
      grab = null;
      clearTimeout(tiltTimer);
      near = false;
      if (!e.type || e.type.indexOf('cancel') === -1 || e.type === 'lostpointercapture') {
        // handled below
      }
      setRootClasses();
      const ev = e;
      if (!grab /* (cleared above means we had one) */ && true) {
        // Use clickGuard check: if moved, swallow click that follows
      }
      // Re-check moved: we already lost grab state, so check via event timestamp
      // Workaround: re-read from closure via a trick — instead, track moved separately
    };

    // Simpler up handler:
    function onPointerUp(e) {
      if (!grab || grab.id !== e.pointerId) return;
      const wasMoved = grab.moved;
      grab = null;
      clearTimeout(tiltTimer);
      near = false;
      setRootClasses();
      if (!wasMoved) return;
      dragging = false;
      clickGuard = e.timeStamp;
      setRootClasses();
      const g = geoRef();
      if (nearSocket(g, nx.get(), ny.get())) seat();
      else drop();
    }
    plugBtn.addEventListener('pointerup', onPointerUp);
    plugBtn.addEventListener('pointercancel', onPointerUp);
    plugBtn.addEventListener('lostpointercapture', onPointerUp);

    plugBtn.addEventListener('click', (e) => {
      if (clickGuard && e.timeStamp - clickGuard < 400) { clickGuard = 0; return; }
      toggle();
    });

    fallbackBtn.addEventListener('click', () => toggle());

    // Keyboard on the plug switch: Enter or Space toggles
    plugBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
    });

    /* ---------- Resize ------------------------------------------------ */
    let sizeKey = '';
    const applySize = () => {
      const key = `${stage.clientWidth}x${stage.clientHeight}`;
      if (key === sizeKey || !stage.clientWidth) return;
      sizeKey = key;
      geo = measure(stage.clientWidth, stage.clientHeight);
      // geoRef returns geo automatically
      newMove();
      const at = pluggedRef() ? geo.seat : geo.rest;
      nx.set(at.x); ny.set(at.y);
      tilt.set(0); rot.jump(0);
      applyGeometry();
      applyPlugTransform();
      cable.rebuild();
    };
    applyGeometry();
    applyPlugTransform();
    setRootClasses();
    // Kick physics to show initial settled cable
    requestAnimationFrame(() => { applySize(); cable.rebuild(); applyPlugTransform(); });

    let ro = null;
    try {
      ro = new ResizeObserver(applySize);
      ro.observe(stage);
    } catch (_) {
      window.addEventListener('resize', applySize);
    }

    /* ==================================================================== */
    /* ====== Offline / network-error mode (autoOffline: true by default)  */
    /* ==================================================================== */
    /* Swap every visible text string between the "404 not found" set and
       the "your network is down" set. DOM never rebuilds, so the cable,
       the plug, the spring and the RAF loop keep running undisturbed. */
    function applyMode(next) {
      if (!next || next === mode) return;
      mode = next;
      codePrefix.textContent = mode === 'offline' ? 'Status ' : 'Error ';
      codeText.textContent = currentCode();
      titleText.textContent = currentTitle();
      if (msgEl && messageText) messageText.textContent = currentMessage();
      hintText.textContent = currentLabels().hint;
      homeText.textContent = currentLabels().home;
      plugBtn.setAttribute('aria-label', currentLabels().cable);
      updateStatus();
      updateFallbackText();
      if (mode === 'offline') root.setAttribute('data-mode', 'offline');
      else root.removeAttribute('data-mode');
      try { onMode && onMode(mode); } catch (_) {}
    }

    /* Apply initial mode attribute (for CSS targeting) + aria-label. */
    plugBtn.setAttribute('aria-label', currentLabels().cable);
    if (mode === 'offline') root.setAttribute('data-mode', 'offline');

    let netHandlers = null;
    if (autoOffline && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      netHandlers = {
        on: () => {
          /* The user just came back online. Treat it like a plug-in:
             animate the plug into the socket, spark, then power on. */
          applyMode('notfound');
          if (!pluggedRef()) plugIn();
        },
        off: () => {
          /* Network just dropped. Treat it like an unplug: power dies,
             the plug falls back onto the desk. */
          applyMode('offline');
          if (pluggedRef()) unplug();
        },
      };
      window.addEventListener('online',  netHandlers.on);
      window.addEventListener('offline', netHandlers.off);
    }

    /* Cleanup if ever removed. */
    return {
      destroy() {
        moves.forEach((a) => a.stop());
        clearTimeout(tiltTimer);
        clearTimeout(phaseTimer);
        if (ro) ro.disconnect();
        if (netHandlers) {
          window.removeEventListener('online',  netHandlers.on);
          window.removeEventListener('offline', netHandlers.off);
        }
        root.remove();
      },
      /* Exposed in case the user wants a custom trigger:
           var api = mount(...); api.setMode('offline'); */
      setMode: applyMode,
      getMode: () => mode,
    };
  }

  /* ======================================================================== */
  /* ============================= Bootstrap ================================= */
  /* ======================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    mount(app, {
      homeHref: '/',
      secondaryHref: '/#contact',
      secondaryLabel: 'Contact me',
    });
  });

})();
