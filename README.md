# Solus — Website Concept

Concept build for the Solus website: homepage, the photo archive, and the
access/application page. Black-and-red, loud, brutalist-leaning. This is a
design concept meant to be built on, not a finished product — see **Status**
below for what's real and what's a placeholder.

**Live pages:** open `index.html` in a browser. No build step, no install.

## File structure

```
index.html          Homepage — loader, hero, collective, drives, detail, access CTA
gallery.html         The Archive — photo grid with load-folder / drag-drop / lightbox
access.html          "You don't apply, you get invited" + introduction request form
assets/
  css/core.css        Shared design system: colors, type, buttons, cursor, drawer nav
  img/                All photography + the logo, as plain files (not base64)
```

Each HTML file also has a `<style>` block below the `core.css` link for
page-specific layout — hero sizing, the gallery grid, the drives track, etc.
`core.css` is the stuff shared by all three pages (color variables, type
scale, the nav drawer, the custom cursor, buttons).

## Running it locally

Just open `index.html` directly — everything is relative paths, no server
needed. If you want it running on `localhost` (some browsers are stricter
about local file access), from this folder run:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Status — what's real vs. placeholder

- **Numbers are fake.** Member count (63), machine count (47), and every
  drive's stats (machines / people / km) are placeholders. Search each file
  for the numbers to find them, or grep: `grep -rn "MACHINES\|MEMBERS" *.html`
- **The access form doesn't send anywhere.** Submitting it in `access.html`
  fakes a "logged for review" response client-side. It needs to be wired to
  an actual inbox, sheet, or form service (Formspree, a Google Form, etc.)
  before it's real.
- **The gallery's "load folder" and drag-drop features are session-only.**
  Photos added that way live in browser memory and vanish on refresh —
  nothing uploads anywhere. That's by design for a concept, but worth
  deciding whether the real site needs actual persistence.
- **Typography** is Anton + Inter + IBM Plex Mono, loaded from Google Fonts
  in each file's `<head>`. Needs an internet connection to render as
  intended; offline it falls back to Impact / Arial Narrow and still holds
  together, just not as sharp.

## Notes for whoever picks this up

- Colors, spacing, and font variables all live at the top of `core.css` —
  start there before touching anything else.
- The custom cursor hides the real one everywhere except text inputs
  (`cursor:none` in `core.css`). If that ever feels broken while you're
  editing, check that rule first.
- Images are already reasonably compressed for web (resized + JPEG quality
  ~70-78). If you swap in new photography, keep an eye on file size —
  nothing here should be pushing multiple megabytes per image.
- No JS framework, no build step, no bundler — everything is vanilla
  HTML/CSS/JS on purpose, so it's easy for anyone to jump in and edit
  directly. If the project grows past three pages this will probably want
  a proper framework and a build step; that's a good future conversation,
  not a today problem.

## Contributing

Small project, so keeping it simple:

- Work off `main` directly for small tweaks, or branch (`feature/whatever`)
  for anything bigger and open a pull request.
- Commit messages don't need to be formal — just say what changed.
- If you're not sure whether a change is small or big, open a PR anyway;
  costs nothing and makes it easy to look at a diff before it lands.
