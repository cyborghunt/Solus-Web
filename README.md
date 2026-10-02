# Solus — Website

v1-launch build. Homepage, photo archive, access page, and four legal
pages. Black-and-red, loud on the homepage, calm on everything you'd
actually sit and read.

**Open it:** `index.html` in a browser. No build step, no install.

## File structure

```
index.html       Homepage — loader, hero, collective, drives, detail, access CTA
gallery.html      The Archive — a fixed, curated grid of 13 photos + lightbox
access.html       "You don't apply, you get invited" + introduction request form
terms.html        Terms & Conditions
privacy.html      Privacy Policy
cookies.html      Cookie Policy (short — this site doesn't use cookies)
copyright.html    Copyright, licensing, trademark notes
assets/
  css/core.css      Shared design system: colors, type, motion, a11y, legal-page layout
  img/              All photography + the logo + favicon, as plain files
  fonts/            Empty until you add Concielian — see fonts/README.txt
```

## What changed for v1

- **Gallery is static now.** The old "load a folder" / drag-and-drop
  feature is gone. The 13 photos in `assets/img/` are the real gallery;
  to add more, add the image file and one more `<figure class="cell">`
  block in `gallery.html` following the existing pattern.
- **Four legal pages added**, linked from every footer. Read
  `privacy.html` and `cookies.html` especially before launch — they
  describe exactly what the site does and doesn't collect, and that's
  only true as long as the site doesn't start quietly collecting more
  than that.
- **Concielian font is wired up but not active.** `core.css` asks for
  it first and falls back to Anton until the actual font files are
  dropped into `assets/fonts/`. Full instructions in that folder's
  README, including the commercial-use licensing note.
- **Accessibility pass:** color contrast fixed (the muted grey text
  was failing WCAG AA, now passes), every image has real alt text,
  keyboard users get a visible "skip intro" link, focus states are
  visible, the custom cursor only hides the real one once JS has
  actually loaded (so nobody loses their pointer if a script fails),
  and `prefers-reduced-motion` is honored — the grain, loader flicker,
  and marquee skew all calm down or stop for anyone with that OS
  setting on.
- **Calmer by default** even without that setting: background grain
  is slower and fainter, the loader's flicker is slower (the old pace
  was fast enough to be a real photosensitivity concern), and the
  marquee skew on scroll is subtler.

## Status — what's real vs. placeholder

- Member count (63), machine count (47), and each drive's stats are
  still placeholders. Search for `MACHINES` / `MEMBERS` in `index.html`.
- The access form doesn't send anywhere yet — see `privacy.html`,
  which says this plainly. Submitting it fakes a review confirmation
  client-side only.
- No cookie-consent banner, on purpose: the site sets zero cookies, so
  there's nothing to get consent for. If analytics or a real backend
  are added later, `cookies.html` needs updating *first*, and a
  consent banner goes in at that point, not after.

## Running it locally

Just open `index.html`. If you want it on `localhost` instead of
`file://`, from this folder:

```bash
python3 -m http.server 8000
```

## Contributing

- Small project — work off `main` for small tweaks, branch for
  anything bigger.
- Colors, type, and motion rules all live at the top of
  `assets/css/core.css`. Start there.
- No framework, no bundler, on purpose. Keep it that way unless the
  site genuinely outgrows plain HTML/CSS/JS.
