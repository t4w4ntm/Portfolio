# 3D scenes bundle

`vendor/scenes.js` bundles the project scene components (`src/components/sections/ProjectVisual.tsx`
and `src/components/three/*`) from the web app they were written for, so the portfolio shows the
same 3D scenes without copying their code.

Rebuild after the scenes change (`SCENES_SRC` is the folder of that app, which holds `src/` and
`node_modules/`):

```bash
export SCENES_SRC=/path/to/source-app
ln -sfn "$SCENES_SRC/node_modules" tools/scenes/node_modules
"$SCENES_SRC/node_modules/.bin/vite" build --config tools/scenes/vite.config.mjs
```

The models the scenes load are in `models/` (see `models/ATTRIBUTION.md`).
The scene styles live in `style.css` under "3D project scenes".

## Still images for phones

On phones the project cards show a still image instead of a live scene
(`img/work/3d-<visual>.jpg`). To recapture one, serve the portfolio folder, run a small
receiver on `127.0.0.1:5501` that saves a POSTed data URL as a JPEG, and open
`tools/scenes/capture.html?v=<visual>` (sleep, pulse, vision, water, farm).
The page posts its canvas as `3d-<visual>` once the scene has rendered.
