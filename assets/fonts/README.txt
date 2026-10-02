CONCIELIAN — how to activate the club's real display font
============================================================

Right now every headline on the site (SOLUS, DRIVE. MACHINES. PEOPLE.,
section titles, etc.) renders in Anton, loaded from Google Fonts. That's
the fallback. Concielian is the font the CSS actually asks for first —
it just needs the real files dropped in here to switch on.

Where to get it
----------------
Concielian is a free-for-personal-use techno/sci-fi display font by
Daniel Zadorozny of Iconian Fonts. Official source:
  https://www.iconian.com

Commercial use (merch, sponsored content, anything money-making once
Solus is more than a hobby project) needs separate clearance — see:
  https://www.iconian.com/commercial.html

What to drop in here
----------------------
The CSS (assets/css/core.css) expects these exact filenames:

  assets/fonts/concielian.woff2
  assets/fonts/concielian.woff
  assets/fonts/concielian-bold.woff2
  assets/fonts/concielian-bold.woff

Iconian distributes Concielian as .ttf. To convert a .ttf you've
downloaded into .woff2/.woff for the web, the fonttools package does
it in one line each:

  pip install fonttools brotli
  fonttools varLib.instancer concielian.ttf  # skip if not variable
  fonttools ttLib.woff2 compress concielian.ttf
  # for plain .woff:
  python3 -c "from fontTools.ttLib import TTFont; f=TTFont('concielian.ttf'); f.flavor='woff'; f.save('concielian.woff')"

Do the same for the bold weight (concielianbold.ttf -> concielian-bold.woff2/woff).

Once all four files are sitting in this folder with those exact names,
refresh the site — no other change needed, @font-face picks it up
automatically and every --display heading switches over.
