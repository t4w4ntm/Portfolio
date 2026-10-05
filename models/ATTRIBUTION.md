# TUG human model

David - Adobe Mixamo rigged, textured human, embedded in this web demonstration.
Source catalog: https://three.ws/api/avatars/library (entry `david`, source `mixamo`).
Source asset: https://pub-2534e921bf9c4314addcd4d8a6e98b7b.r2.dev/avatars/mixamo/glb/david.glb
Mixamo usage FAQ: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html

Optimized locally with glTF Transform 4.5.0: deduplicated geometry, 1024px WebP
textures, original skin and bone names retained. File reduced from 45.35 MB to
2.03 MB. Custom PBR material setup replaces the source FBX unlit conversion;
custom TUG posing drives the skeleton instead of the bundled idle animation.
The VR CPR portfolio scene shares this asset with a separately cloned skeleton and
custom kneeling pose; the headset, training manikin and room are procedural geometry.
Do not treat this embedded character as an independently redistributable model pack.

## SnoreTrack pillow

`snoretrack-pillow.glb` is the project's original travel pillow model, downloaded
from `zepteksolutions-alt/snoreTrack`, branch `main`,
`assets/models/snoretrack_travel_pillow_v1.glb` through GitHub on 2026-09-15.
The embedded fabric texture is retained. The sofa is procedural and the sleeping
human shares the David model above with a separate skeleton pose.

## TonNam buoy

`tonnam-buoy.glb` is the project's own WaterGuard / TonNam buoy model from
`asset/waterguard/waterguard.glb` (source asset, not deployed; see the README there), meshopt-compressed with
glTF Transform 4.5.0 (2.13 MB to 437 KB). Node names and the `Explode` animation are kept.
The water surface and ripples are procedural.

## Coffee tree (Smart Farm card)

"A coffee tree" by rvezy, https://sketchfab.com/3d-models/a-coffee-tree-045dba854c8d4b9e8a5dff2d18892df1,
licensed CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Changes: removed the cobblestone
ground square, recentred, simplified to about half the triangles and meshopt-compressed
(`coffee-tree.glb`, 4.68 MB to 478 KB). The source file is kept in `asset/a_coffee_tree.glb`.
