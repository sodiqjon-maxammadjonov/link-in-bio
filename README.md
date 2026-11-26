# Portfolio — Sodiqjon Maxamadjanov

Static site (no build step). EN / RU / UZ, dark + light.

```
index.html          page markup
css/style.css       all styles
js/data.js          ALL texts (en/ru/uz) + project list  <- edit content here
js/main.js          behaviour (theme, language, animations, dialogs)
assets/             optimized images (WebP) + beton.mp4
app-ads.txt         kept from the old site
```

## Deploy (GitHub Pages)
1. In your repo delete the old `index.html` and `assets/`.
2. Upload everything from this folder (keep `app-ads.txt` in the root).
3. Commit. Done.

## Things you may want to edit
- Texts / project descriptions: `js/data.js` (each key has en, ru, uz).
- Remove or add a project: the `PROJECTS` array at the bottom of `js/data.js`.
- CV button: in `index.html` find `id="cvBtn"`, put your real link in `href` and delete the `hidden` attribute.
- Location text: keys `hero.chip.loc`, `about.where.v`, `contact.loc.v` in `js/data.js`.
- Contact email / Telegram: search `panda281106@gmail.com` and `flutter_dev_nova`.
