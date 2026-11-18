# Yolo Nest PG Manager — PWA

Files
- index.html            your app (unchanged logic; PWA tags + update/offline bar added)
- manifest.webmanifest  name, colours, icons, standalone display
- sw.js                 caches the app shell only (never Supabase data)
- vendor/supabase.min.js  self-hosted supabase-js 2.45.4 (was loaded from jsDelivr)
- icons/                192, 512, maskable, apple-touch, favicon

Deploy (needs HTTPS — service workers don't run on file://)
- Netlify Drop / Cloudflare Pages / Vercel / GitHub Pages: upload the whole folder.
- Local test:  cd yolo-nest-pwa && python3 -m http.server 8080   (localhost counts as secure)

Supabase: add your deployed URL under Authentication → URL Configuration → Site URL / Redirect URLs.

Updating later: edit files, change VERSION in sw.js (v1 -> v2), redeploy.
Users see an "Update" bar and tap it.
