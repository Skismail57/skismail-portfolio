# Unplugged 404

A not-found page whose power cable has been pulled out. Plug it back in to go
home.

The page arrives unpowered: the 404 is an empty tube, the message sits dim and
every few seconds the screen tries to strike, like a dead sign. The plug lies
on the desk a short way from the wall socket. Drag it over and the cable lifts
off the desk, sags and swings behind it like a real one. Let go near the socket
and the pins snap home with a click and a spark, the screen flickers on and the
page lights up with the way home.

Nobody has to drag. The plug is a real switch, a "Plug it back in" button does
the same job, and the dim look is only a look: the heading, the message and the
home link are always in the page, readable by screen readers and reachable by
keyboard.

Built with React and Framer Motion. The cable is a small physics simulation
(Verlet integration) drawn as one SVG path.

---

## What's in the box

```
src/
  Unplugged404.jsx   the component
  Unplugged404.css   all styles, scoped under .unplugged-root
  tokens.css         the design tokens the CSS reads
  fonts/             Geist + Geist Mono, self-hosted (no Google Fonts calls)
demo/
  index.html         a runnable demo
  main.jsx           the component with its props wired up
```

## Run the demo

```bash
npm install
npm run dev
```

## Install into your project

Copy `src/` into your project (keep `fonts/` next to `tokens.css`), then:

```bash
npm install framer-motion
```

```jsx
import Unplugged404 from './Unplugged404';
import './tokens.css';
import './Unplugged404.css';

<Unplugged404 homeHref="/" secondaryHref="/support" />
```

The page fills the viewport. Under a fixed site header, shorten it with the
`--up-page-height` token (see Theming).

## Use it as your 404 page

### Next.js (App Router)

`app/not-found.jsx` is rendered for every unmatched URL and for `notFound()`,
and Next.js sends it with a 404 status. The component file starts with
`'use client'`, so a server component can render it directly:

```jsx
// app/not-found.jsx
import Unplugged404 from '@/components/unplugged-404/Unplugged404';
import '@/components/unplugged-404/tokens.css';
import '@/components/unplugged-404/Unplugged404.css';

export default function NotFound() {
  return <Unplugged404 homeHref="/" secondaryHref="/support" />;
}
```

"Take me home" is a plain link, which is all a 404 needs. To route client-side
instead, render it from a client component and use the router:

```jsx
'use client';
import { useRouter } from 'next/navigation';

export function NotFoundPage() {
  const router = useRouter();
  return <Unplugged404 onHome={(e) => { e.preventDefault(); router.push('/'); }} />;
}
```

On the Pages Router, the same JSX goes in `pages/404.jsx`, and the two CSS
imports go in `pages/_app.jsx` (the only place that router allows global CSS).

### React Router

Add a catch-all route last:

```jsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import Unplugged404 from './Unplugged404';
import './tokens.css';
import './Unplugged404.css';

function NotFound() {
  const navigate = useNavigate();
  return (
    <Unplugged404
      homeHref="/"
      onHome={(e) => { e.preventDefault(); navigate('/'); }}
    />
  );
}

<Routes>
  {/* your routes */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

A single-page app can't set the HTTP status itself. If search engines matter,
have your server or host answer unknown URLs with a 404.

### Astro

With the React integration (`npx astro add react`), `src/pages/404.astro` is
your not-found page and most hosts serve it with a 404 status:

```astro
---
import Unplugged404 from '../components/unplugged-404/Unplugged404.jsx';
import '../components/unplugged-404/tokens.css';
import '../components/unplugged-404/Unplugged404.css';
---
<html lang="en" data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page not found</title>
  </head>
  <body style="margin: 0">
    <Unplugged404 client:load homeHref="/" />
  </body>
</html>
```

`client:load` makes the plug interactive. Without JavaScript the page still
renders, unpowered, with a working "Take me home" link.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `homeHref` | `string \| null` | `'/'` | Where "Take me home" goes. `null` together with `onHome` renders a button instead of a link |
| `onHome` | `(event) => void` | none | Called on click. `event.preventDefault()` to route client-side |
| `code` | `string` | `'404'` | The big number, e.g. `'410'` |
| `title` | `ReactNode` | `'This page came unplugged.'` | The `h1` |
| `message` | `ReactNode` | a short "couldn't find it" line | Pass `null` to hide it |
| `secondaryHref` | `string` | none | A second link, e.g. `'/support'`. Omit to hide it |
| `secondaryLabel` | `string` | `'Contact support'` | Its text |
| `startPlugged` | `boolean` | `false` | Open with the page already lit and the plug in |
| `onPlug` | `(pluggedIn) => void` | none | Called each time the plug goes in or comes out |
| `labels` | `object` | English | Replace any built-in string, e.g. to translate |

`labels` takes any of these keys; the rest keep their defaults:

```jsx
<Unplugged404
  labels={{
    home: 'Take me home',
    plugIn: 'Plug it back in',
    unplug: 'Unplug it',
    hint: 'Drag the plug into the socket',
    cable: 'Power cable',            // the plug switch's accessible name
    lost: 'Signal lost',             // status line and announcement, unplugged
    restored: 'Power restored',      // status line and announcement, plugged in
  }}
/>
```

## How the plug behaves

- **Drag** the plug anywhere over the desk. Near the socket a magnet lines
  the pins up with the holes; let go within reach and it seats with a click.
  Let go too far away and it drops back onto the desk and slides home.
- **Click or tap** the plug, press **Enter** or **Space** on it, or use the
  **Plug it back in** button: the plug lifts, carries itself over and seats.
- **Unplug** by dragging it out (the power dies the moment the pins leave the
  holes), clicking it again, or the **Unplug it** button.

The simulation only runs while something moves and sleeps as soon as the cable
settles, so an idle 404 page costs nothing.

## Theming

Every colour, radius and easing reads a CSS custom property from `tokens.css`,
so you can retheme it without touching the component. The hardware has its own
tokens:

```css
.unplugged-root {
  --up-cable: #fbfbfd;           /* the cable, and */
  --up-plug-hi: #ffffff;         /* the plug's body, top to bottom */
  --up-plug-lo: #e6e4ec;
  --up-socket-face: #ffffff;     /* the socket */
  --up-light-rgb: 22, 18, 31;    /* the spark and LED, as r, g, b */
  --up-dim: 0.26;                /* how dim the page sits unplugged */
}
```

Three layout tokens size the page:

```css
.unplugged-root {
  --up-page-height: calc(100dvh - 64px);   /* under a 64px site header */
  --up-code-size: 180px;                   /* the big 404 */
  --up-rig-height: 220px;                  /* the desk, plug and socket */
}
```

Tokens are scoped to `.unplugged-root`, so they never clash with your app's own
custom properties. The page is light by default. Put `data-theme="dark"` on any
ancestor, usually `<html>`, for the dark page.

The component brings its own scoped reset and sets no global styles.

### Fonts

Geist and Geist Mono ship in `src/fonts/` and load from your own origin, so the
component makes no third-party requests. To use a different typeface, change
`--font-sans` and `--font-mono` in `tokens.css` and delete the `@font-face`
blocks and the `fonts/` folder.

## Accessibility

- The heading is a real `h1`, the code is read as "Error 404", and the dim
  unpowered look is visual only: screen readers get the full page in every
  state, and keyboard focus on the home link lights the page up.
- The plug is a `role="switch"` button labelled "Power cable", with its state
  in `aria-checked`. Enter and Space plug it in or pull it out, and it has a
  visible focus ring. The "Plug it back in" button does the same, so nobody
  ever has to drag.
- A polite live region announces "Power restored" and "Signal lost". The
  cable, desk, socket and spark are decorative and hidden from assistive tech.
- The flicker is slow and low contrast, well under flash thresholds. With
  `prefers-reduced-motion` there is no flicker, no spark and no animation:
  the plug moves straight to its place and the page changes state in one step.
- Touch works: the plug has a finger-sized hit area and owns its drag, so the
  page doesn't scroll under your thumb. On a phone the rig sits below the text
  and the button is full width.

## Browser support

Chrome, Edge, Firefox and Safari 15.4+.

## Requirements

- React 18 or 19
- `framer-motion` 11+ (or the `motion` package, which has the same API)

---

## License

Commercial use is permitted. Redistribution is not. See [LICENSE.md](./LICENSE.md).

Support: email billing@susanoo.ai with your order email. We'll help with setup,
bug fixes and small changes. See the terms at ui.susanoo.ai/terms.
