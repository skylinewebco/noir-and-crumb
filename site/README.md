# Noir & Crumb — Premium 3D Cookie Website

A cinematic, fully-interactive 3D product website for the premium cookie brand **Noir & Crumb**, built around the assets in the parent folder.

## Stack
- **React 18** + **Vite 5**
- **React Three Fiber / three.js / Drei** — the interactive 3D hero (floating cookie, cocoa particle field, volumetric glow, mouse parallax, scroll response)
- **GSAP + ScrollTrigger** — scroll-driven reveals, parallax, marquees
- **Lenis** — buttery inertial smooth scrolling
- **Zustand** — cart / wishlist / auth / theme state (localStorage-persisted)
- **Tailwind CSS** — design system + theming

## Run it
```bash
cd site
npm install      # already done
npm run dev      # http://localhost:5231
```
Production build:
```bash
npm run build    # outputs to site/dist
npm run preview  # serve the built site
```

## What's included
Hero (3D) · Marquee · Featured signature · Collection (filterable, 6 flavours) · Product detail + customization modal · Ingredients · Brand story (animated counters) · Cinematic video bento · Limited/Gifting · Reviews · Contact · Footer · Cart drawer · Multi-step checkout (COD / card / bank / wallet demo) · Sign in/up + account (demo) · Dark & Light themes · Loading, empty & error-safe states · Full mobile-first responsiveness.

## Assets
Source assets (`Asset 7`, `Assets 10` … `Assets 44`) live in the parent folder. They are processed by
`../tools/process_assets.py` into optimized WebP + transparent cutouts under `public/assets/`.
Mapping is documented in `../ASSET_MAP.md`. Missing Section-7 posters (36–40) are generated as
cinematic gradient fallbacks by the same script.

To re-process assets after changing sources:
```bash
python ../tools/process_assets.py
```

## Performance notes
- Hero WebGL loop **pauses when scrolled out of view**; DPR is clamped and adapts to device performance.
- Videos are **lazy-attached** via IntersectionObserver and **pause off-screen**; posters prevent blank frames.
- Marquees pause when off-screen; reveals use a single batched ScrollTrigger.
- Images are WebP with responsive sizes; the 3D chunk is code-split and deferred.
- Everything honours `prefers-reduced-motion` (static hero fallback, no autoplay motion).
