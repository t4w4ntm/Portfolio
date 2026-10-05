# Zeptek 3D scenes bundle

`vendor/zeptek-scenes.js` is built from the Zeptek Technologies site's own project visuals
(`src/components/sections/ProjectVisual.tsx` and `src/components/three/*`), so the
portfolio shows exactly the same 3D scenes without copying their code.

Rebuild after the Zeptek scenes change:

```bash
ln -sfn /Users/wan/Desktop/zeptekkkk/node_modules tools/zeptek-scenes/node_modules
cd /Users/wan/Desktop/zeptekkkk && ./node_modules/.bin/vite build --config /Users/wan/Desktop/Portfolio-main/tools/zeptek-scenes/vite.config.mjs
```

The models the scenes load are copied into `models/` (see `models/ATTRIBUTION.md`).
The scene styles live in `style.css` under "Zeptek 3D scenes".

## Still images for phones

On phones the project cards show a still image instead of a live scene
(`img/zeptek/3d-<visual>.jpg`). To recapture one, serve the portfolio folder, run a small
receiver on `127.0.0.1:5501` that saves a POSTed data URL as a JPEG, and open
`tools/zeptek-scenes/capture.html?v=<visual>` (sleep, pulse, vision, water, farm).
The page posts its canvas as `3d-<visual>` once the scene has rendered.
