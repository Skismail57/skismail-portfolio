'use client';

/**
 * Unplugged404: a not-found page whose power cable has been pulled out.
 * susanoo.ui
 *
 * The page arrives unpowered. The big 404 and the message sit dim and now
 * and then flicker, like a dead sign, and the plug lies on the desk a short
 * way from the wall socket. Drag it over: the cable lifts off the desk, sags
 * and swings behind it, the plug snaps into the socket with a spark, the
 * screen flickers on and the page lights up with a way home.
 *
 * Nobody has to drag. The plug is a real switch (Enter or Space) and a
 * visible "Plug it back in" button does the same. The dimness is visual
 * only: the heading, the message and the home link are in the page and
 * reachable in every state, and keyboard focus lights them up.
 *
 * This component is presentational. It owns no routing: "Take me home" is a
 * plain link to homeHref, and onHome lets you route client-side instead.
 *
 * ---------------------------------------------------------------------------
 * PROPS
 *
 *   homeHref           where "Take me home" goes. Default '/'. Pass null
 *                      together with onHome to render a button instead.
 *   onHome(event)      called when it's clicked. Call event.preventDefault()
 *                      to route client-side (router.push, navigate).
 *   code               the big number. Default '404'.
 *   title              the h1. Default 'This page came unplugged.'
 *   message            the line under it: a string or a node.
 *   secondaryHref      a second link, e.g. '/support'. Omit to hide it.
 *   secondaryLabel     its text. Default 'Contact support'.
 *   startPlugged       boolean. Open with the page already lit.
 *   onPlug(pluggedIn)  called each time the plug goes in or comes out.
 *   labels             replace any built-in string, e.g. to translate it:
 *                      { home, plugIn, unplug, hint, cable, lost, restored }
 *
 * ---------------------------------------------------------------------------
 * USAGE
 *
 *   import Unplugged404 from './Unplugged404';
 *   import './tokens.css';
 *   import './Unplugged404.css';
 *
 *   <Unplugged404
 *     homeHref="/"
 *     secondaryHref="/support"
 *     onHome={(e) => { e.preventDefault(); router.push('/'); }}
 *   />
 *
 * Requires: react >= 18, framer-motion >= 11 (or the `motion` package).
 * Styles are fully scoped under .unplugged-root; nothing leaks out.
 */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  MotionConfig,
  animate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

/* useLayoutEffect warns during server rendering; the rig only measures in
   the browser anyway. */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* Reduced motion, from the same media query the CSS uses. It starts false so
   the server and the browser render the same markup, is read before the
   first paint, and follows the setting if it changes. */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduce;
}

const LABELS = {
  home: 'Take me home',
  plugIn: 'Plug it back in',
  unplug: 'Unplug it',
  hint: 'Drag the plug into the socket',
  cable: 'Power cable',
  lost: 'Signal lost',
  restored: 'Power restored',
};

/* ------------------------------------------------------------------------ */
/* Geometry                                                                  */
/* ------------------------------------------------------------------------ */

/* The hardware at scale 1, in px. The plug's artwork is an 82×32 box whose
   nose (the face the pins stick out of) is at x = 62. */
const PLUG = { boot: 16, body: 46, h: 32, pin: 20 };
const CABLE_W = 7;

/* Where everything sits, in px from the stage's top-left corner. The plug's
   position is its nose. k scales the hardware: bigger on a desktop page,
   actual size on a phone. */
function measure(w, h) {
  const k = w < 520 ? 1 : Math.max(1, Math.min(1.3, (h - 20) / 140));
  const deskY = h - 46 * k;                 // top of the desk
  const deskLeft = 6;                       // the edge the cable hangs over
  const wallX = w - 20 * k;                 // face of the wall
  const plateX = wallX - 6 * k;             // the socket's wall plate
  const faceX = plateX - 26 * k;            // the socket's face, where the holes are
  const mouthY = deskY - 74 * k;            // height of the holes' centre line
  const len = (PLUG.boot + PLUG.body) * k;  // cable exit to nose
  const pin = PLUG.pin * k;
  const half = (PLUG.h * k) / 2;
  const pre = { x: faceX - pin, y: mouthY };            // pin tips touching the face
  const gap = Math.min(150 * k, (pre.x - deskLeft - len) * 0.55);
  return {
    w, h, k, deskY, deskLeft, deskH: 10 * k, wallX, plateX, faceX, mouthY,
    sockH: 26 * k, faceRx: 8 * k, len, pin, half, r: (CABLE_W * k) / 2,
    seat: { x: faceX, y: mouthY },                      // pins all the way in
    pre,
    rest: { x: pre.x - gap, y: deskY - half },          // lying on the desk
    minX: deskLeft + len + 12,
    minY: half + 2,
    magnet: 44 * k,                                     // pull starts here
    snap: 52 * k,                                       // let go inside this and it seats
    align: 9 * k,                                       // pins must be this close to the holes
  };
}

/* Past an edge the plug keeps moving, just less and less, like the cable is
   holding it back. */
function rubber(v, min, max, give = 50) {
  if (v < min) return min - give * (1 - 1 / (1 + (min - v) / give));
  if (v > max) return max + give * (1 - 1 / (1 + (v - max) / give));
  return v;
}

/* The plug drops onto the desk and bounces twice, never through it. */
function land(t) {
  if (t < 0.62) return (t / 0.62) ** 2;
  const bounce = (a, b, height) => { const u = (t - a) / (b - a); return 1 - height * 4 * u * (1 - u); };
  return t < 0.86 ? bounce(0.62, 0.86, 0.09) : bounce(0.86, 1, 0.022);
}

const nearSocket = (g, x, y) => x > g.pre.x - 1 || Math.hypot(g.pre.x - x, g.pre.y - y) < g.snap;

/* ---- Dragging the plug -------------------------------------------------
   Where the plug can go. It rides on the desk, it can't pass through the
   socket or the wall, and it resists past the edges of the stage. Near the
   socket's mouth a magnet lines the pins up with the slots, and they only
   slide in once they're lined up, so it seats with a clean click. */
function constrain(g, x, y) {
  x = rubber(x, g.minX, Infinity);
  y = Math.min(rubber(y, g.minY, Infinity), g.rest.y);   // the desk is solid

  const dx = g.pre.x - x;
  const dy = g.pre.y - y;
  const d = Math.hypot(dx, dy);
  if (x <= g.pre.x && d < g.magnet) {
    const pull = (1 - d / g.magnet) ** 2;                // gentle, then strong
    x += dx * pull * 0.6;
    y += dy * pull;
  }

  if (x > g.pre.x) {
    if (Math.abs(y - g.pre.y) <= g.align) {
      y = g.pre.y;                                       // in the slots: straight in, straight out
      x = Math.min(x, g.seat.x);
    } else if (Math.abs(y - g.mouthY) < g.half + g.sockH) {
      x = g.pre.x;                                       // pins against the socket's face
    } else {
      x = Math.min(x, g.wallX - g.pin - 1);              // pins against the wall
    }
  }
  return [x, y];
}

/* ------------------------------------------------------------------------ */
/* The cable                                                                 */
/* ------------------------------------------------------------------------ */

/* ---- The cable ----------------------------------------------------------
   Only the part of the cable that can leave the desk is simulated: a short
   rope of point masses (Verlet integration) from the plug back to where it
   touches down. The rest is drawn lying flat along the desk and hanging over
   its edge; seen side on, that part never changes shape. */
const SEG = 10;         // px between points on the rope
const DT = 1 / 120;     // fixed physics step
const ITER = 30;        // constraint passes per step
const GRAVITY = 2400;   // px/s²
const SAG = 60;         // catenary parameter: bigger lies flatter, tauter
const PULL = 5;         // px of extra tension, so the cable never arches

/* Where the cable leaves the plug, and the plug's axis there. The plug turns
   about its nose, so the tail swings around it. */
function tailOf(g, x, y, deg) {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: x - g.len * c, y: y - g.len * s, c, s };
}

/* Where the rope's far end rests. A cable lifted to height h off a surface
   hangs in a catenary that touches down a horizontal distance x away, using
   up s of its length; the rest lies flat behind the touchdown point. Putting
   the end there keeps the rope gently in tension, so it hangs in a clean
   curve and never bunches up on the desk. Past the desk's edge the end
   carries on down the side. */
function anchorOf(g, rope, tail) {
  const a = SAG * g.k;
  const neckX = tail.x - tail.c * SEG;      // the strain relief holds the first
  const neckY = tail.y - tail.s * SEG;      // segment straight, so hang from there
  const h = Math.max(0, g.deskY - g.r - neckY);
  const s = Math.min(rope.len - 2 * SEG, Math.sqrt(h * h + 2 * h * a));
  const x = a * Math.acosh(1 + h / a);
  const ax = neckX - x - (rope.len - SEG - s) - PULL * g.k;
  if (ax >= g.deskLeft) return { x: ax, y: g.deskY - g.r };
  // Over the edge: what's left runs round the corner, then down the side.
  const corner = g.deskLeft - rope.rail;
  return { x: rope.rail, y: g.deskY - g.r + Math.max(0, g.deskLeft - ax - corner) };
}

/* Long enough to reach the highest the plug can be lifted, with some to
   spare lying on the desk. */
function makeRope(g, tail) {
  const a = SAG * g.k;
  const hMax = g.deskY - g.minY;
  const want = Math.sqrt(hMax * hMax + 2 * hMax * a) + 36 * g.k;
  const n = Math.ceil(want / SEG) + 1;
  const rope = { pts: [], n, len: (n - 1) * SEG, rail: g.deskLeft - g.r - 0.5 };

  // Lay it the way it would really lie: up the side of the desk, round the
  // edge, along the top and up to the plug, so it can't start out threaded
  // through the desk.
  const head = anchorOf(g, rope, tail);
  const top = g.deskY - g.r;
  const path = [[head.x, head.y]];
  if (head.y > top) path.push([rope.rail, top]);
  path.push([Math.max(path.at(-1)[0], tail.x - SEG * 2), top], [tail.x, tail.y]);
  const lens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  for (let i = 0, leg = 0, done = 0; i < n; i++) {
    const want = (total * i) / (n - 1);
    while (leg < lens.length - 1 && done + lens[leg] < want) done += lens[leg++];
    const t = lens[leg] ? Math.min(1, (want - done) / lens[leg]) : 0;
    const x = path[leg][0] + (path[leg + 1][0] - path[leg][0]) * t;
    const y = path[leg][1] + (path[leg + 1][1] - path[leg][1]) * t;
    rope.pts.push({ x, y, px: x, py: y });
  }
  return rope;
}

/* Pushes a point out of the desk, the wall and the socket. */
function collide(p, g) {
  const r = g.r;
  if (p.x > g.wallX - r) p.x = g.wallX - r;

  const top = g.deskY - r;
  const bottom = g.deskY + g.deskH + r;
  const left = g.deskLeft - r;
  if (p.x > left && p.y > top && p.y < bottom) {
    const up = p.y - top;
    const out = p.x - left;
    const down = bottom - p.y;
    if (up <= out && up <= down) p.y = top;
    else if (out <= down) p.x = left;
    else p.y = bottom;
  }

  const sTop = g.mouthY - g.sockH - r;
  const sBottom = g.mouthY + g.sockH + r;
  const sLeft = g.faceX - g.faceRx - r;
  if (p.x > sLeft && p.y > sTop && p.y < sBottom) {
    const up = p.y - sTop;
    const out = p.x - sLeft;
    const down = sBottom - p.y;
    if (out <= up && out <= down) p.x = sLeft;
    else if (up <= down) p.y = sTop;
    else p.y = sBottom;
  }
}

/* One physics step: Verlet integration, then constraints.
   Both ends are placed, not simulated: one at the plug,
   one where the cable touches down. */
function stepRope(rope, g, tail, damp) {
  const { pts, n } = rope;
  const grav = GRAVITY * DT * DT;

  for (let i = 1; i < n - 2; i++) {
    const p = pts[i];
    const vx = (p.x - p.px) * damp;
    const vy = (p.y - p.py) * damp;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + grav;
  }

  // The cable leaves the plug along its axis (strain relief).
  const end = pts[n - 1];
  const neck = pts[n - 2];
  end.x = tail.x; end.y = tail.y;
  neck.x = tail.x - tail.c * SEG; neck.y = tail.y - tail.s * SEG;
  // The touchdown point eases after the plug, so a flick
  // doesn't make it jump.
  const head = anchorOf(g, rope, tail);
  pts[0].x += (head.x - pts[0].x) * 0.25;
  pts[0].y += (head.y - pts[0].y) * 0.25;

  for (let it = 0; it < ITER; it++) {
    // Keep the spacing. Only the inner points move.
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const wa = i > 0 && i < n - 2 ? 1 : 0;
      const wb = i + 1 < n - 2 ? 1 : 0;
      if (!wa && !wb) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-6;
      const f = (d - SEG) / d / (wa + wb);
      a.x += dx * f * wa; a.y += dy * f * wa;
      b.x -= dx * f * wb; b.y -= dy * f * wb;
    }
    // A power cable is stiff: it won't fold sharply.
    for (let i = 0; i < n - 2; i++) {
      const a = pts[i];
      const b = pts[i + 2];
      const wa = i > 0 ? 1 : 0;
      const wb = i + 2 < n - 2 ? 1 : 0;
      if (!wa && !wb) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-6;
      const min = SEG * 1.8;
      if (d >= min) continue;
      const f = ((d - min) / d / (wa + wb)) * 0.5;
      a.x += dx * f * wa; a.y += dy * f * wa;
      b.x -= dx * f * wb; b.y -= dy * f * wb;
    }
    // The strain relief stiffens the next stretch too, so
    // it bends away gradually, never kinks behind the boot.
    for (let j = 1; j <= 2; j++) {
      const p = pts[n - 2 - j];
      const pull = j === 1 ? 0.3 : 0.1;
      p.x += (neck.x - tail.c * SEG * j - p.x) * pull;
      p.y += (neck.y - tail.s * SEG * j - p.y) * pull;
    }
    for (let i = 1; i < n - 2; i++) collide(pts[i], g);
  }

  // Nudge each point towards the line through its
  // neighbours: kinks straighten, smooth curves barely move.
  for (let i = 1; i < n - 2; i++) {
    const p = pts[i];
    const a = pts[i - 1];
    const b = pts[i + 1];
    p.x += ((a.x + b.x) / 2 - p.x) * 0.3;
    p.y += ((a.y + b.y) / 2 - p.y) * 0.3;
    collide(p, g);
  }

  // Friction: cable lying on the desk doesn't skate about.
  for (let i = 1; i < n - 2; i++) {
    const p = pts[i];
    if (p.x > g.deskLeft && p.y >= g.deskY - g.r - 0.2) p.px += (p.x - p.px) * 0.3;
  }
}

/* The whole cable as one SVG path: down off the page, up the side of the
   desk, round its edge, flat along the top to the rope, then a smooth curve
   through the rope's points (quadratic segments through the midpoints). */
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
    const a = pts[i];
    const b = pts[i + 1];
    d += `Q${f(a.x)} ${f(a.y)} ${f((a.x + b.x) / 2)} ${f((a.y + b.y) / 2)}`;
  }
  const end = pts[n - 1];
  return `${d}L${f(end.x)} ${f(end.y)}`;
}

/* Runs the rope while anything moves and puts it to sleep when it settles,
   so an idle 404 page costs nothing. The path goes into a motion value, so
   drawing it never re-renders React. */
function useCable(geoRef, nx, ny, rot, still) {
  const d = useMotionValue('');
  const rope = useRef(null);
  const wakeRef = useRef(() => {});
  const stillRef = useRef(still);
  stillRef.current = still;

  const tail = () => tailOf(geoRef.current, nx.get(), ny.get(), rot.get());

  /* Lay a fresh rope for the current geometry and let it settle at once, so
     the first frame already shows a cable at rest. */
  const rebuild = useCallback(() => {
    const g = geoRef.current;
    rope.current = makeRope(g, tail());
    for (let i = 0; i < 480; i++) stepRope(rope.current, g, tail(), 0.9);
    d.set(ropePath(rope.current, g));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Reduced motion: jump straight to the resting shape, no swing. */
  const settle = useCallback(() => {
    if (!rope.current) return;
    const g = geoRef.current;
    for (let i = 0; i < 360; i++) stepRope(rope.current, g, tail(), 0.6);
    d.set(ropePath(rope.current, g));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let acc = 0;
    let quiet = 0;
    let moved = true;

    const tick = (now) => {
      const r = rope.current;
      if (!r) { raf = 0; return; }
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = geoRef.current;
      const t = tail();
      const damp = stillRef.current ? 0.6 : 0.988;
      let steps = 0;
      while (acc >= DT && steps < 8) { stepRope(r, g, t, damp); acc -= DT; steps++; }
      d.set(ropePath(r, g));

      let motion = 0;
      for (const p of r.pts) motion = Math.max(motion, Math.abs(p.x - p.px) + Math.abs(p.y - p.py));
      quiet = moved || motion > 0.015 ? 0 : quiet + 1;
      moved = false;
      if (quiet > 45) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      moved = true;
      if (!raf) { last = performance.now(); acc = 0; raf = requestAnimationFrame(tick); }
    };
    wakeRef.current = wake;
    const offs = [nx.on('change', wake), ny.on('change', wake), rot.on('change', wake)];
    wake();
    return () => { offs.forEach((off) => off()); cancelAnimationFrame(raf); raf = 0; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { d, rebuild, settle };
}

/* ------------------------------------------------------------------------ */
/* Artwork                                                                   */
/* ------------------------------------------------------------------------ */

/* The plug, side on: strain relief, grip, and two pins. Drawn in an 82×32
   box whose nose is at x = 62, where the button's box ends; the pins stick
   out past it. `clip` hides whatever part of the pins is inside the socket. */
function PlugArt({ id, clip }) {
  return (
    <motion.svg viewBox="0 0 82 32" style={{ clipPath: clip }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="up-stop-plug-hi" />
          <stop offset="1" className="up-stop-plug-lo" />
        </linearGradient>
        <linearGradient id={`${id}-pin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="up-stop-pin-hi" />
          <stop offset="1" className="up-stop-pin-lo" />
        </linearGradient>
      </defs>
      <rect x="58" y="5.5" width="23.5" height="5" rx="2.5" fill={`url(#${id}-pin)`} />
      <rect x="58" y="21.5" width="23.5" height="5" rx="2.5" fill={`url(#${id}-pin)`} />
      <path className="up-boot" d="M18 5.5C11 7 6 11 1.5 12.6a1.6 1.6 0 0 0-1.5 1.6v3.6a1.6 1.6 0 0 0 1.5 1.6C6 21 11 25 18 26.5Z" />
      <path className="up-groove" d="M5.5 11.4v9.2M10 9.2v13.6" />
      <rect className="up-body" x="15" y="0.5" width="47" height="31" rx="7" fill={`url(#${id}-body)`} />
      <path className="up-groove" d="M24 8.5v15M29 8.5v15M34 8.5v15" />
      <path className="up-sheen" d="M21 2.2h34" />
      <rect className="up-face" x="57" y="3.5" width="5" height="25" rx="2" />
    </motion.svg>
  );
}

/* The wall and the desk, behind everything, seen side on. The wall fades out
   upward and away, so the rig sits in the page rather than in a box. */
function Scene({ g, id }) {
  const { k } = g;
  return (
    <svg className="up-scene" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="up-stop-wall" />
          <stop offset="1" className="up-stop-wall" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.6" stopColor="#fff" />
        </linearGradient>
        <mask id={`${id}-wall-mask`}>
          <rect x={g.wallX - 2} y="0" width={90 * k} height={g.h} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-wall-mask)`}>
        <rect x={g.wallX} y="0" width={80 * k} height={g.h} fill={`url(#${id}-wall)`} />
        <rect className="up-wall-line" x={g.wallX} y="0" width="1" height={g.h} />
      </g>
      <rect className="up-desk" x={g.deskLeft} y={g.deskY} width={g.wallX - g.deskLeft} height={g.deskH} rx={2.5 * k} />
      <rect className="up-desk-edge" x={g.deskLeft + 2} y={g.deskY} width={g.wallX - g.deskLeft - 2} height="1" />
    </svg>
  );
}

/* A round wall socket, turned a little towards you: the wall plate, the
   socket's barrel, and its face with a recess and two holes. The plug is
   drawn over it, and its pins are clipped where they meet the holes, so they
   slide in. */
function Socket({ g, id }) {
  const { k } = g;
  const top = g.mouthY - g.sockH;
  return (
    <svg className="up-socket" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-barrel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="up-stop-socket-lo" />
          <stop offset="0.22" className="up-stop-socket-hi" />
          <stop offset="1" className="up-stop-socket-lo" />
        </linearGradient>
      </defs>
      <rect className="up-barrel" x={g.faceX} y={top} width={g.plateX - g.faceX + 2} height={g.sockH * 2}
            fill={`url(#${id}-barrel)`} />
      <rect className="up-plate" x={g.plateX} y={g.mouthY - 50 * k} width={g.wallX - g.plateX + 1} height={100 * k} rx={2 * k} />
      <ellipse className="up-socket-face" cx={g.faceX} cy={g.mouthY} rx={g.faceRx} ry={g.sockH} />
      <ellipse className="up-recess" cx={g.faceX - 0.5 * k} cy={g.mouthY} rx={g.faceRx * 0.6} ry={g.sockH * 0.74} />
      <ellipse className="up-hole" cx={g.faceX - 0.6 * k} cy={g.mouthY - 8 * k} rx={1.8 * k} ry={3.4 * k} />
      <ellipse className="up-hole" cx={g.faceX - 0.6 * k} cy={g.mouthY + 8 * k} rx={1.8 * k} ry={3.4 * k} />
      <circle className="up-led" cx={g.plateX - 8 * k} cy={top + 7 * k} r={2.3 * k} />
    </svg>
  );
}

/* A flash and a few streaks from the gap as the pins make contact. Drawn
   over the plug; re-mounted (new key) for every spark. */
const RAYS = [-168, -140, -112, -86, 94, 118, 146, 176];
function Spark({ x, y, k }) {
  return (
    <g className="up-spark">
      <circle className="up-flash" cx={x} cy={y} r={24 * k} />
      {RAYS.map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const inner = 6 * k;
        const outer = (i % 2 ? 16 : 23) * k;
        return (
          <path
            key={deg}
            className="up-ray"
            pathLength="1"
            d={`M${x + c * inner} ${y + s * inner}L${x + c * outer} ${y + s * outer}`}
            style={{ animationDelay: `${(i % 3) * 22}ms` }}
          />
        );
      })}
    </g>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5" />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Component                                                                 */
/* ------------------------------------------------------------------------ */

export default function Unplugged404({
  homeHref = '/',
  onHome,
  code = '404',
  title = 'This page came unplugged.',
  message = "We couldn't find the page you were looking for. It may have moved, or the link may be broken.",
  secondaryHref,
  secondaryLabel = 'Contact support',
  startPlugged = false,
  onPlug,
  labels: labelOverrides,
}) {
  const labels = { ...LABELS, ...labelOverrides };
  const still = usePrefersReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const [plugged, setPlugged] = useState(startPlugged);
  const [phase, setPhase] = useState(null);          // 'booting' | 'dying' while the screen flickers
  const [spark, setSpark] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [dragging, setDragging] = useState(false);
  const [near, setNear] = useState(false);

  const stageRef = useRef(null);
  const [geo, setGeo] = useState(() => measure(660, 210));
  const geoRef = useRef(geo);
  const pluggedRef = useRef(startPlugged);
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
  const onPlugRef = useRef(onPlug);
  onPlugRef.current = onPlug;

  /* The plug's nose position and tilt. The tilt goes through a spring, so
     it swings rather than snaps. */
  const start = startPlugged ? geo.seat : geo.rest;
  const nx = useMotionValue(start.x);
  const ny = useMotionValue(start.y);
  const tilt = useMotionValue(0);
  const rot = useSpring(tilt, { stiffness: 260, damping: 16 });
  const cable = useCable(geoRef, nx, ny, rot, still);

  /* The pins disappear into the holes: clip off whatever part of them is
     past the socket's face. The artwork's right edge is 20 units past the
     nose, so that's how far in the pins can go. */
  const pinClip = useTransform(nx, (x) => {
    const g = geoRef.current;
    const inside = x + PLUG.pin * g.k - g.faceX;
    return inside > 0 ? `inset(-24px ${inside.toFixed(2)}px -24px -24px)` : 'none';
  });

  /* ---- Power ------------------------------------------------------------ */
  const power = useCallback((on) => {
    if (pluggedRef.current === on) return;
    pluggedRef.current = on;
    setPlugged(on);
    setPhase(on ? 'booting' : 'dying');
    setAnnouncement(on ? labelsRef.current.restored : labelsRef.current.lost);
    if (on) setSpark((s) => s + 1);
    onPlugRef.current?.(on);
  }, []);

  useEffect(() => {
    if (!phase) return undefined;
    const t = setTimeout(() => setPhase(null), phase === 'booting' ? 1000 : 520);
    return () => clearTimeout(t);
  }, [phase]);

  /* ---- Moving the plug on its own --------------------------------------
     Every animated move gets an id. Grabbing the plug, or starting another
     move, stops the running animations and makes the old move's remaining
     steps bail out. */
  const moves = useRef([]);
  const moveId = useRef(0);
  const newMove = () => {
    moves.current.forEach((a) => a.stop());
    moves.current = [];
    return ++moveId.current;
  };
  const run = (value, to, options) => {
    const a = animate(value, to, options);
    moves.current.push(a);
    return a;
  };
  const stale = (id) => id !== moveId.current;

  const place = (at) => { nx.set(at.x); ny.set(at.y); tilt.set(0); rot.jump(0); cable.settle(); };

  /* Pins line up, slide home with a click, and the power comes on. */
  async function seat(id = newMove()) {
    const g = geoRef.current;
    if (still) { place(g.seat); power(true); return; }
    tilt.set(0);
    if (nx.get() < g.pre.x - 0.5 || Math.abs(ny.get() - g.pre.y) > 0.5) {
      await Promise.all([
        run(nx, g.pre.x, { type: 'spring', stiffness: 520, damping: 38 }),
        run(ny, g.pre.y, { type: 'spring', stiffness: 700, damping: 42 }),
      ]);
      if (stale(id)) return;
    }
    await run(nx, g.seat.x, { duration: 0.09, ease: [0.6, 0, 1, 0.5] });
    if (stale(id)) return;
    power(true);
    run(nx, [g.seat.x, g.seat.x - 1.4 * g.k, g.seat.x], { duration: 0.16, ease: 'easeOut' });
  }

  /* Falls back onto the desk and slides to where it was lying. */
  function drop(id = newMove()) {
    const g = geoRef.current;
    if (still) { place(g.rest); return; }
    const fall = Math.max(0, g.rest.y - ny.get());
    tilt.set(0);
    run(ny, g.rest.y, { duration: 0.26 + Math.sqrt(fall) * 0.028, ease: land });
    run(nx, g.rest.x, { type: 'spring', stiffness: 70, damping: 14 });
    return id;
  }

  /* Keyboard, click and the fallback button: carry the plug over in an arc,
     lifting first, then seat it. */
  async function plugIn() {
    const id = newMove();
    const g = geoRef.current;
    if (still) { place(g.seat); power(true); return; }
    tilt.set(-5);
    await Promise.all([
      run(nx, g.pre.x, { type: 'spring', stiffness: 80, damping: 17 }),
      run(ny, g.pre.y, { type: 'spring', stiffness: 170, damping: 21 }),
    ]);
    if (stale(id)) return;
    seat(id);
  }

  /* Pull straight out (the power dies as the pins leave), then drop it. */
  async function unplug() {
    const id = newMove();
    const g = geoRef.current;
    power(false);
    if (still) { place(g.rest); return; }
    await run(nx, g.pre.x - 8 * g.k, { duration: 0.16, ease: [0.3, 0, 0.2, 1] });
    if (stale(id)) return;
    drop(id);
  }

  const toggle = () => (pluggedRef.current ? unplug() : plugIn());

  /* ---- Pointer: drag the plug ------------------------------------------ */
  const grab = useRef(null);
  const clickGuard = useRef(0);
  const tiltTimer = useRef(0);

  /* On phones a drag with any downward travel is also the browser's own
     gesture (Chrome's pull-to-refresh, iOS overscroll, page scroll), and it
     can win over the plug. Cancelling the finger's native move while it's on
     the plug keeps the drag ours. Non-passive, so preventDefault is
     honoured; taps are untouched since only touchmove is cancelled. */
  const plugRef = useRef(null);
  useEffect(() => {
    const el = plugRef.current;
    if (!el) return undefined;
    const stop = (e) => { if (e.cancelable) e.preventDefault(); };
    el.addEventListener('touchmove', stop, { passive: false });
    return () => el.removeEventListener('touchmove', stop);
  }, []);

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const stage = stageRef.current;
    if (!stage) return;
    /* A new press is never the end of the last drag: a tap right after a
       drag (on a phone, a drag often ends without a click) must still work. */
    clickGuard.current = 0;
    // Keep receiving moves when the pointer outruns the plug. (It can throw
    // for a pointer the browser doesn't know, e.g. a synthetic event.)
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* moves still arrive while over the plug */ }
    newMove();
    // CSS zoom or a transform on an ancestor scales pointer deltas; undo it.
    const scale = stage.getBoundingClientRect().width / stage.offsetWidth || 1;
    grab.current = {
      id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: nx.get(), oy: ny.get(),
      scale, moved: false, vy: 0, lastY: ny.get(), lastT: e.timeStamp,
    };
  }

  function onPointerMove(e) {
    const gr = grab.current;
    if (!gr || gr.id !== e.pointerId) return;
    const dx = (e.clientX - gr.sx) / gr.scale;
    const dy = (e.clientY - gr.sy) / gr.scale;
    if (!gr.moved) {
      if (Math.hypot(dx, dy) < 4) return;
      gr.moved = true;
      setDragging(true);
    }
    const g = geoRef.current;
    const [x, y] = constrain(g, gr.ox + dx, gr.oy + dy);
    nx.set(x);
    ny.set(y);

    // The power dies the moment the pins leave the slots.
    if (pluggedRef.current && x < g.seat.x - 3 * g.k) power(false);

    const isNear = nearSocket(g, x, y);
    setNear((was) => (was === isNear ? was : isNear));

    // Held up, the cable's weight tips the nose up a little; quick moves swing
    // it; lined up at the socket it straightens out.
    if (!still) {
      const dt = Math.max(1, e.timeStamp - gr.lastT) / 1000;
      gr.vy = gr.vy * 0.6 + ((y - gr.lastY) / dt) * 0.4;
      gr.lastY = y;
      gr.lastT = e.timeStamp;
      const lifted = y < g.rest.y - 1;
      const toMouth = Math.min(1, Math.hypot(g.pre.x - x, g.pre.y - y) / g.magnet);
      const base = lifted ? -4 : 0;
      tilt.set(x > g.pre.x ? 0 : (base + Math.max(-14, Math.min(14, gr.vy * 0.012))) * toMouth);
      clearTimeout(tiltTimer.current);
      tiltTimer.current = setTimeout(() => {
        if (grab.current) tilt.set(ny.get() < g.rest.y - 1 && nx.get() <= g.pre.x ? -4 * toMouth : 0);
      }, 90);
    }
  }

  function onPointerUp(e) {
    const gr = grab.current;
    if (!gr || gr.id !== e.pointerId) return;
    grab.current = null;
    clearTimeout(tiltTimer.current);
    setNear(false);
    if (!gr.moved) return;                  // a tap: the click that follows toggles
    setDragging(false);
    clickGuard.current = e.timeStamp;       // swallow the click a drag ends with
    const g = geoRef.current;
    if (nearSocket(g, nx.get(), ny.get())) seat();
    else drop();
  }

  function onClick(e) {
    if (clickGuard.current && e.timeStamp - clickGuard.current < 400) { clickGuard.current = 0; return; }
    toggle();
  }

  /* ---- Measure the stage ------------------------------------------------ */
  useIsoLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    let size = '';
    const apply = () => {
      const key = `${el.clientWidth}x${el.clientHeight}`;
      if (key === size || !el.clientWidth) return;
      size = key;
      const g = measure(el.clientWidth, el.clientHeight);
      geoRef.current = g;
      setGeo(g);
      newMove();
      const at = pluggedRef.current ? g.seat : g.rest;
      nx.set(at.x);
      ny.set(at.y);
      tilt.set(0);
      rot.jump(0);
      cable.rebuild();
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    moves.current.forEach((a) => a.stop());
    clearTimeout(tiltTimer.current);
  }, []);

  const rootClass = [
    'unplugged-root',
    phase && `is-${phase}`,
    dragging && 'is-dragging',
    near && 'is-near',
  ].filter(Boolean).join(' ');

  const homeContent = (<><ArrowIcon /><span>{labels.home}</span></>);

  return (
    <MotionConfig reducedMotion="user">
      <div className={rootClass} data-power={plugged ? 'on' : 'off'} style={{ '--up-k': geo.k }}>
        {/* Flavour for sighted users; screen readers get the live region below. */}
        <p className="up-status" aria-hidden="true">
          <span className="up-status-dot" />
          {plugged ? labels.restored : labels.lost}
        </p>
        <p className="up-sr" role="status">{announcement}</p>

        {/* The "screen". Dim while unplugged, but always real, readable,
            focusable content: the dimness is only a look. */}
        <div className="up-screen">
          <p className="up-code"><span className="up-sr">Error </span>{code}</p>
          <h1 className="up-title">{title}</h1>
          {message && <p className="up-message">{message}</p>}
          <div className="up-actions">
            {homeHref ? (
              <a className="up-home" href={homeHref} onClick={onHome}>{homeContent}</a>
            ) : (
              <button type="button" className="up-home" onClick={onHome}>{homeContent}</button>
            )}
            {secondaryHref && <a className="up-secondary" href={secondaryHref}>{secondaryLabel}</a>}
          </div>
        </div>

        <div className="up-rig">
          <div className="up-controls">
            <p className="up-hint" aria-hidden="true">{labels.hint}</p>
            <button type="button" className="up-fallback" onClick={toggle}>
              <PlugIcon />
              <span>{plugged ? labels.unplug : labels.plugIn}</span>
            </button>
          </div>

          <div className="up-stage" ref={stageRef}>
            <Scene g={geo} id={uid} />
            <Socket g={geo} id={uid} />
            <svg className="up-cable" aria-hidden="true" focusable="false">
              <motion.path className="up-cable-edge" d={cable.d} strokeWidth={CABLE_W * geo.k + 2} />
              <motion.path className="up-cable-body" d={cable.d} strokeWidth={CABLE_W * geo.k} />
              <motion.path className="up-cable-shine" d={cable.d} strokeWidth={1.5 * geo.k}
                           transform={`translate(0 ${-1.6 * geo.k})`} />
            </svg>

            {/* The plug is a real switch: role, label, state, keyboard, focus
                ring. Dragging is one way to flip it, never the only one. */}
            <motion.button
              ref={plugRef}
              type="button"
              className="up-plug"
              role="switch"
              aria-checked={plugged}
              aria-label={labels.cable}
              style={{ x: nx, y: ny, rotate: rot, originX: 1, originY: 0.5 }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onLostPointerCapture={onPointerUp}
              onClick={onClick}
            >
              <PlugArt id={uid} clip={pinClip} />
            </motion.button>

            <svg className="up-fx" aria-hidden="true" focusable="false">
              {spark > 0 && !still && <Spark key={spark} x={geo.faceX} y={geo.mouthY} k={geo.k} />}
            </svg>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
