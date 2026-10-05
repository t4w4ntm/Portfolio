import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Geometry is authored in metres, Y up, facing +Z. All facial components share
// one rigid head transform. No facial skin weights, morphs or animated scales.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(x => { this.result = x; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(x => { this.result = `data:${blob.type};base64,${Buffer.from(x).toString('base64')}`; this.onloadend?.(); }); }
};
const rootDir = fileURLToPath(new URL('../../', import.meta.url));
mkdirSync(rootDir + 'astronaut-review', { recursive: true });
const scene = new T.Scene();
scene.name = 'Little_Explorer';
const astronaut = new T.Group(); astronaut.name = 'Astronaut'; scene.add(astronaut);
const motion = new T.Group(); motion.name = 'MotionRoot'; astronaut.add(motion);

function material(name, color, roughness = .48, metalness = 0, extras = {}) {
  const m = new T.MeshPhysicalMaterial({ color, roughness, metalness, ...extras }); m.name = name; return m;
}
const M = {
  suit: material('Warm white woven pressure suit', '#e9edf0', .62),
  helmet: material('Pearl ceramic helmet', '#f5f8fa', .23, .1, { clearcoat: .65, clearcoatRoughness: .18 }),
  trim: material('Graphite blue flexible seals', '#28394b', .56),
  seam: material('Soft silver stitching', '#acbac8', .62),
  sole: material('Boot sole charcoal rubber', '#354554', .85),
  blue: material('Cobalt enamel', '#227ad1', .27, .2, { clearcoat: .5 }),
  blueDark: material('Navy enamel', '#194c79', .34, .12),
  red: material('Coral red controls', '#ee5147', .3, .04, { clearcoat: .4 }),
  metal: material('Brushed aluminium', '#b4c6d5', .28, .78),
  skin: material('Peach skin', '#eab78f', .51, 0, { clearcoat: .07, clearcoatRoughness: .65 }),
  skinLight: material('Soft skin highlight', '#efbc95', .54),
  ear: material('Inner ear warm peach', '#cf886d', .68),
  hair: material('Soft black hair', '#171a24', .43, .01, { clearcoat: .17, clearcoatRoughness: .40 }),
  hairLine: material('Hair strand sheen', '#292d38', .46),
  sclera: material('Warm eye whites', '#fff6e9', .24, 0, { clearcoat: .7, clearcoatRoughness: .06 }),
  iris: material('Deep brown iris', '#171a20', .24, 0, { clearcoat: .30, clearcoatRoughness: .16 }),
  pupil: material('Velvet black pupils', '#080d15', .24, 0, { clearcoat: .30, clearcoatRoughness: .16 }),
  sparkle: material('Eye catchlights', '#ffffff', .08, 0, { emissive: '#ffffff', emissiveIntensity: .4 }),
  mouth: material('Smile crease', '#6b3431', .67),
  lip: material('Lower lip warm rose', '#dc8f80', .5),
  light: material('Ice blue indicator lights', '#71d7ed', .2, .1, { emissive: '#36aaca', emissiveIntensity: .8 }),
};
let uid = 0;
function mesh(parent, name, geometry, mat, pos = [0, 0, 0], scale = null) {
  const o = new T.Mesh(geometry, mat); o.name = name + '_' + uid++; o.position.fromArray(pos); if (scale) o.scale.fromArray(scale); parent.add(o); return o;
}
const sphereGeo = new T.SphereGeometry(1, 48, 32);
function ellipsoid(p, name, pos, scale, mat) { return mesh(p, name, sphereGeo, mat, pos, scale); }
function box(p, name, pos, size, radius, mat) { return mesh(p, name, new RoundedBoxGeometry(...size, 4, radius), mat, pos); }
function cylinder(p, name, pos, r1, r2, length, mat, axis = 'y') {
  const o = mesh(p, name, new T.CylinderGeometry(r1, r2, length, 48, 1), mat, pos);
  if (axis === 'z') o.rotation.x = Math.PI / 2; if (axis === 'x') o.rotation.z = Math.PI / 2; return o;
}
function torus(p, name, pos, radius, thickness, mat, axis = 'y') {
  const o = mesh(p, name, new T.TorusGeometry(radius, thickness, 10, 64), mat, pos);
  if (axis === 'y') o.rotation.x = Math.PI / 2; if (axis === 'x') o.rotation.y = Math.PI / 2; return o;
}
function curve(p, name, points, radius, mat, closed = false, segments = 56) {
  const path = new T.CatmullRomCurve3(points.map(v => new T.Vector3(...v)), closed, 'centripetal');
  return mesh(p, name, new T.TubeGeometry(path, segments, radius, 8, closed), mat);
}
function joint(parent, name, pos) { const g = new T.Group(); g.name = name; g.position.fromArray(pos); parent.add(g); return g; }
function capsule(p, name, length, radius, mat) { return mesh(p, name, new T.CapsuleGeometry(radius, Math.max(.001, length - radius * 1.4), 10, 32), mat, [0, -length / 2, 0]); }

// Torso: a soft pressure suit, with a separate backpack, seams and real controls.
const chest = joint(motion, 'ChestPivot', [0, .76, 0]);
const torso = joint(chest, 'SuitAssembly', [0, -.76, 0]);
ellipsoid(torso, 'Padded_jacket', [0, .775, -.005], [.278, .285, .208], M.suit);
ellipsoid(motion, 'Suit_hips', [0, .565, 0], [.278, .162, .20], M.suit);
curve(torso, 'Waist_stitched_seam', Array.from({ length: 65 }, (_, i) => { const a = i / 64 * Math.PI * 2; return [.248 * Math.cos(a), .593, .172 * Math.sin(a)]; }), .005, M.seam, true);
curve(torso, 'Centre_zipper', [[0, .59, .190], [0, .68, .205], [0, .765, .208]], .005, M.seam);
box(torso, 'Zipper_pull', [0, .676, .218], [.019, .033, .008], .004, M.metal);
cylinder(torso, 'Neck_flexible_seal', [0, 1.008, 0], .181, .18, .09, M.trim);
for (let k = 0; k < 3; k++) torus(torso, 'Neck_seal_rib', [0, .982 + k * .019, 0], .18, .007, M.seam);
cylinder(torso, 'Helmet_lock_collar', [0, 1.046, 0], .23, .205, .047, M.metal);
torus(torso, 'Collar_blue_trim', [0, 1.063, 0], .219, .011, M.blueDark);

box(torso, 'Life_support_backpack', [0, .79, -.237], [.40, .46, .23], .055, M.helmet);
box(torso, 'Backpack_centre_panel', [0, .80, -.362], [.24, .30, .025], .028, M.blueDark);
for (let k = 0; k < 5; k++) box(torso, 'Backpack_vent', [0, .70 + k * .043, -.380], [.155, .011, .012], .004, M.trim);
for (const s of [-1, 1]) {
  capsule(joint(torso, 'Oxygen_tank', [s * .17, .998, -.32]), 'Tank', .35, .053, M.metal);
  curve(torso, 'Suit_front_seam', [[s * .19, .62, .149], [s * .236, .75, .136], [s * .208, .929, .119]], .006, M.seam);
  curve(torso, 'Chest_harness', [[s * .21, .989, .085], [s * .186, .96, .152], [s * .171, .891, .209], [s * .159, .703, .182]], .012, M.suit);
}
box(torso, 'Chest_panel_gasket', [0, .837, .201], [.338, .255, .075], .045, M.trim);
box(torso, 'Chest_panel_ceramic', [0, .842, .230], [.315, .232, .070], .038, M.helmet);
box(torso, 'Panel_display_bezel', [-.058, .887, .270], [.113, .056, .018], .009, M.blueDark);
box(torso, 'Panel_display_glass', [-.058, .888, .281], [.092, .033, .006], .005, M.light);
for (let k = 0; k < 3; k++) box(torso, 'Display_bar', [-.089 + k * .023, .886, .285], [.012, .014 + k * .004, .002], .002, M.sparkle);
cylinder(torso, 'Large_control_bezel', [.072, .86, .274], .045, .045, .013, M.metal, 'z');
cylinder(torso, 'Large_coral_button', [.072, .86, .286], .033, .033, .021, M.red, 'z');
for (const [x, mat] of [[-.079, M.blue], [-.012, M.blueDark], [.067, M.light]]) {
  cylinder(torso, 'Small_button_rim', [x, .786, .272], .024, .024, .011, M.metal, 'z');
  cylinder(torso, 'Small_button', [x, .786, .281], .017, .017, .017, mat, 'z');
}
for (const s of [-1, 1]) for (const y of [.758, .92]) cylinder(torso, 'Panel_fastener', [s * .132, y, .266], .0045, .0045, .006, M.metal, 'z');

// Arms and legs have rounded overlapping joint volumes, so bending exposes no gaps.
const limbs = {};
for (const side of [-1, 1]) {
  const label = side < 0 ? 'Right' : 'Left';
  const shoulder = joint(chest, label + 'Shoulder', [side * .279, .175, 0]);
  shoulder.rotation.z = side * .22;
  ellipsoid(shoulder, 'Shoulder_cap', [0, -.033, 0], [.119, .125, .121], M.suit);
  capsule(shoulder, 'Upper_sleeve', .238, .100, M.suit);
  cylinder(shoulder, 'Mission_blue_arm_band', [0, -.138, 0], .102, .10, .04, M.blue);
  for (const y of [-.116, -.160]) torus(shoulder, 'Arm_band_stitch', [0, y, 0], .10, .0035, M.seam);
  const patch = box(shoulder, 'Mission_patch', [0, -.071, .105], [.089, .072, .014], .016, M.blueDark);
  cylinder(patch, 'Patch_planet', [0, 0, .013], .021, .021, .004, M.suit, 'z');
  const orbit = torus(patch, 'Patch_orbit', [0, 0, .02], .028, .0032, M.red, 'z'); orbit.rotation.z = -.45; orbit.scale.y = .35;
  const elbow = joint(shoulder, label + 'Elbow', [0, -.238, 0]);
  ellipsoid(elbow, 'Elbow_padding', [0, 0, 0], [.093, .086, .091], M.suit);
  capsule(elbow, 'Forearm_sleeve', .215, .087, M.suit);
  for (let k = 0; k < 3; k++) torus(elbow, 'Sleeve_flex_fold', [0, -.038 - k * .021, 0], .085, .0055, M.suit);
  cylinder(elbow, 'Wrist_gasket', [0, -.210, 0], .078, .079, .042, M.trim);
  cylinder(elbow, 'Wrist_cuff', [0, -.192, 0], .096, .092, .046, M.helmet);
  torus(elbow, 'Wrist_cuff_blue_edge', [0, -.211, 0], .091, .005, M.blue);
  ellipsoid(elbow, 'Glove_palm', [0, -.278, .013], [.078, .092, .068], M.suit);
  const thumb = ellipsoid(elbow, 'Glove_thumb', [-side * .063, -.256, .046], [.031, .064, .032], M.suit); thumb.rotation.z = -side * .45;
  for (let k = 0; k < 3; k++) curve(elbow, 'Glove_finger_seam', [[-.043 + k * .034, -.299, .070], [-.043 + k * .034, -.33, .054], [-.039 + k * .032, -.351, .027]], .002, M.seam);
  const hip = joint(motion, label + 'Hip', [side * .16, .556, 0]);
  capsule(hip, 'Upper_trouser', .226, .123, M.suit);
  ellipsoid(hip, 'Outer_thigh_padding', [side * .031, -.097, .004], [.112, .125, .111], M.suit);
  const knee = joint(hip, label + 'Knee', [0, -.226, 0]);
  ellipsoid(knee, 'Knee_joint_padding', [0, 0, 0], [.112, .098, .11], M.suit);
  box(knee, 'Knee_cap', [0, -.006, .102], [.155, .109, .037], .029, M.helmet);
  capsule(knee, 'Lower_trouser', .201, .111, M.suit);
  for (let k = 0; k < 3; k++) torus(knee, 'Trouser_flex_fold', [0, -.082 - k * .023, 0], .109, .005, M.suit);
  const ankle = joint(knee, label + 'Ankle', [0, -.201, 0]);
  cylinder(ankle, 'Boot_ankle_seal', [0, .015, 0], .108, .117, .082, M.trim);
  cylinder(ankle, 'Boot_padded_cuff', [0, .029, .007], .127, .129, .054, M.helmet);
  torus(ankle, 'Boot_blue_cuff_edge', [0, .009, .007], .128, .005, M.blueDark);
  box(ankle, 'Boot_upper', [0, -.045, .052], [.258, .164, .349], .058, M.suit);
  box(ankle, 'Boot_toe_guard', [0, -.055, .165], [.249, .111, .133], .044, M.helmet);
  const sole = box(ankle, 'Boot_sole', [0, -.121, .055], [.273, .039, .367], .013, M.sole);
  for (let k = 0; k < 6; k++) box(ankle, 'Sole_tread', [0, -.140, -.071 + k * .05], [.233, .009, .018], .003, M.sole);
  box(ankle, 'Boot_front_blue_accent', [0, -.086, .235], [.12, .018, .005], .005, M.blueDark);
  limbs[label] = { shoulder, elbow, hip, knee, ankle, sole };
}

// Rigid head assembly. The parenting relationship is the deformation safeguard.
const head = joint(chest, 'HeadPivot', [0, .277, 0]);
const headParts = joint(head, 'RigidHeadAssembly', [0, -1.037, 0]);
head.userData = { deformation: 'rigid', facialSkinning: false };

// Continuous helmet shells, rather than a sphere covering the face.
function helmetShell(name, scale, mat) {
  const p = [], indices = [], rings = 48, around = 96, open = .81;
  for (let j = 0; j <= rings; j++) {
    const theta = open + (Math.PI - open) * j / rings;
    for (let k = 0; k <= around; k++) {
      const phi = k / around * Math.PI * 2;
      const r = Math.sin(theta);
      p.push(.586 * r * Math.cos(phi) * scale, 1.427 + .556 * (r * Math.sin(phi) + .28 * Math.pow(Math.min(0, r * Math.sin(phi)), 2)) * scale,
        -.035 + (.531 * Math.cos(theta) + .117 * Math.exp(-Math.pow((theta - open) / .39, 2))) * scale);
      if (j < rings && k < around) { const a = j * (around + 1) + k, b = a + around + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
    }
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(p, 3)); g.setIndex(indices); g.computeVertexNormals(); return mesh(headParts, name, g, mat);
}
helmetShell('Continuous_pearl_helmet_shell', 1, M.helmet);
const innerMat = M.trim.clone(); innerMat.name = 'Helmet interior lining'; innerMat.side = T.DoubleSide;
helmetShell('Dark_inner_helmet_lining', .974, innerMat);
const rx = .586 * Math.sin(.81), ry = .556 * Math.sin(.81), rz = -.035 + .531 * Math.cos(.81) + .117;
const ringPoints = (factor = 1, zoffset = 0) => Array.from({ length: 97 }, (_, i) => { const a = i / 96 * Math.PI * 2; return [rx * factor * Math.cos(a), 1.427 + (ry * Math.sin(a) + .28 * .556 * Math.pow(Math.min(0, Math.sin(.81) * Math.sin(a)), 2)) * factor, rz + zoffset]; });
curve(headParts, 'Thick_visor_rim', ringPoints(), .028, M.helmet, true, 128);
curve(headParts, 'Inner_visor_graphite_seal', ringPoints(.941, .005), .009, M.trim, true, 128);
curve(headParts, 'Visor_silver_edge', ringPoints(1.016, .020), .007, M.metal, true, 128);
// A pair of short rim reflections suggest a clear open visor without refraction.
curve(headParts, 'Visor_rim_highlight', Array.from({ length: 22 }, (_, i) => { const a = 1.86 + i / 21 * .54; return [rx * Math.cos(a), 1.427 + ry * Math.sin(a), rz + .030]; }), .005, M.sparkle);
for (const s of [-1, 1]) {
  cylinder(headParts, 'Helmet_ear_housing', [s * .578, 1.429, -.025], .123, .123, .094, M.helmet, 'x');
  cylinder(headParts, 'Ear_pod_navy_ring', [s * .629, 1.429, -.025], .098, .098, .014, M.blueDark, 'x');
  cylinder(headParts, 'Ear_pod_silver_disc', [s * .64, 1.429, -.025], .071, .071, .017, M.metal, 'x');
  cylinder(headParts, 'Ear_pod_blue_centre', [s * .651, 1.429, -.025], .041, .041, .019, M.blue, 'x');
  ellipsoid(headParts, 'Ear_pod_status_light', [s * .619, 1.518, .030], [.013, .013, .018], M.light);
}
box(headParts, 'Helmet_top_lamp_housing', [0, 1.986, .036], [.132, .041, .10], .015, M.helmet);
box(headParts, 'Helmet_top_lamp', [0, 1.991, .089], [.089, .021, .009], .007, M.light);

// Smooth face, cheeks and ears. Vertex colours add a soft blush to the skin.
const faceGeo = new T.SphereGeometry(1, 192, 128);
const facePos = faceGeo.getAttribute('position'); const colors = [];
const baseSkin = new T.Color('#edbb95'), blush = new T.Color('#e89185');
for (let i = 0; i < facePos.count; i++) {
  const x = facePos.getX(i), y = facePos.getY(i), z = facePos.getZ(i);
  // Softer forehead and fuller cheeks, tapering to a gently rounded chin.
  const width = 1 + .055 * Math.exp(-Math.pow((y + .23) / .36, 2)) - .08 * Math.pow(Math.max(0, -y), 3);
  const cheek = .017 * Math.exp(-Math.pow((Math.abs(x) - .53) / .27, 2) - Math.pow((y + .19) / .35, 2)) * Math.pow(Math.max(0, z), 3);
  const fx=x*.362*width, fy=y*.314+1.409;
  const front=Math.pow(Math.max(0,z),8);
  const nose=.053*Math.exp(-Math.pow(fx/.043,2)-Math.pow((fy-1.329)/.033,2));
  const bridge=.024*Math.exp(-Math.pow(fx/.028,2)-Math.pow((fy-1.366)/.064,2));
  facePos.setXYZ(i, fx, y * .314, z * .236 + cheek + (nose+bridge)*front);
  const amount = .38 * Math.exp(-Math.pow((Math.abs(x) - .65) / .25, 2) - Math.pow((y + .13) / .27, 2)) * Math.max(0, z);
  const c = baseSkin.clone().lerp(blush, amount); colors.push(c.r, c.g, c.b);
}
faceGeo.setAttribute('color', new T.Float32BufferAttribute(colors, 3)); faceGeo.computeVertexNormals();
const faceMat = M.skin.clone(); faceMat.name = 'Peach skin with subtle cheek blush'; faceMat.color.set('#ffffff'); faceMat.vertexColors = true;
const face = mesh(headParts, 'Sculpted_face', faceGeo, faceMat, [0, 1.409, .221]);
for (const s of [-1, 1]) {
  ellipsoid(headParts, 'Ear', [s * .34, 1.357, .205], [.058, .092, .051], M.skin);
  ellipsoid(headParts, 'Inner_ear', [s * .365, 1.355, .239], [.028, .054, .012], M.ear);
}
// Eyes sit in the face, with symmetric sockets and shared immutable geometry.
for (const s of [-1, 1]) {
  const eye = joint(headParts, s < 0 ? 'RightEye' : 'LeftEye', [s * .148, 1.419, .415]);
  eye.rotation.y = s * .12;
  ellipsoid(eye, 'Eye_socket', [0, -.002, -.004], [.109, .094, .012], M.skin);
  ellipsoid(eye, 'Eye_white', [0, 0, .009], [.102, .085, .029], M.sclera);
  ellipsoid(eye, 'Brown_iris', [-s * .006, 0, .033], [.072, .078, .010], M.iris);
  
  ellipsoid(eye, 'Main_catchlight', [-.024, .032, .042], [.014, .016, .004], M.sparkle);
  ellipsoid(eye, 'Small_catchlight', [.023, -.029, .042], [.005, .006, .003], M.sparkle);
  curve(eye, 'Upper_lid', [[-.100, .008, .012], [-.078, .060, .023], [0, .084, .023], [.077, .061, .022], [.1, .005, .011]], .004, M.hair);
  curve(eye, 'Lower_lid', [[-.1, -.008, .009], [-.065, -.066, .018], [0, -.083, .017], [.068, -.067, .018], [.1, -.006, .008]], .0035, M.skinLight);
  curve(headParts, 'Expressive_eyebrow', [[s * .072, 1.540, .431], [s * .128, 1.556, .426], [s * .184, 1.550, .406], [s * .223, 1.535, .386]], .0058, M.hair);
}



curve(headParts, 'Gentle_smile', [[-.083, 1.255, .423], [-.055, 1.239, .421], [0, 1.233, .419], [.055, 1.239, .421], [.083, 1.255, .423]], .004, M.mouth);
ellipsoid(headParts, 'Soft_lower_lip', [0, 1.216, .410], [.039, .006, .004], M.lip);
cylinder(headParts, 'Neck_skin', [0, 1.098, .14], .097, .091, .115, M.skin);

// A scalp cap and individually lofted, softly tapered swept locks.
const capP=[],capI=[],capRows=40,capCols=80;
for(let i=0;i<=capRows;i++) for(let j=0;j<=capCols;j++) {
  const phi=j/capCols*Math.PI*2, maxTheta=1.70-.64*Math.pow(Math.max(0,Math.sin(phi)),1.5), theta=i/capRows*maxTheta;
  capP.push(.374*Math.sin(theta)*Math.cos(phi),1.419+.373*Math.cos(theta),.203+.255*Math.sin(theta)*Math.sin(phi));
  if(i<capRows&&j<capCols){const a=i*(capCols+1)+j,b=a+capCols+1;capI.push(a,a+1,b,a+1,b+1,b);}
}
const cap=new T.BufferGeometry();cap.setAttribute('position',new T.Float32BufferAttribute(capP,3));cap.setIndex(capI);cap.computeVertexNormals();
mesh(headParts, 'Hair_scalp_cap', cap, M.hair);
function hairLock(name, controls, width, thickness) {
  const path = new T.CatmullRomCurve3(controls.map(p => new T.Vector3(...p)));
  const verts = [], indices = [], n = 36, sides = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n, c = path.getPoint(t), tangent = path.getTangent(t);
    const sideways = new T.Vector3(-tangent.y, tangent.x, 0).normalize();
    const taper = Math.pow(Math.sin(Math.PI * t), .75) * (1 - .20 * t);
    for (let j = 0; j <= sides; j++) {
      const a = j / sides * Math.PI * 2;
      const v = c.clone().addScaledVector(sideways, Math.cos(a) * width * taper);
      v.z += Math.sin(a) * thickness * taper; verts.push(v.x, v.y, v.z);
      if (i < n && j < sides) { const k = i * (sides + 1) + j, b = k + sides + 1; indices.push(k, k + 1, b, k + 1, b + 1, b); }
    }
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(verts, 3)); g.setIndex(indices); g.computeVertexNormals(); mesh(headParts, name, g, M.hair);
  for (const off of [-.38, .18, .54]) {
    const points = [];
    for (let i = 3; i <= 29; i++) { const t = i / n, c = path.getPoint(t), tangent = path.getTangent(t), side = new T.Vector3(-tangent.y, tangent.x, 0).normalize(); const taper = Math.pow(Math.sin(Math.PI * t), .75) * (1 - .2 * t); c.addScaledVector(side, off * width * taper); c.z += thickness * Math.sqrt(1 - off * off) * taper + .0005; points.push(c.toArray()); }
    curve(headParts, 'Subtle_hair_strand', points, .0009, M.hairLine, false, 32);
  }
}
hairLock('Left_swept_fringe', [[-.19, 1.72, .357], [-.236, 1.655, .415], [-.265, 1.578, .411], [-.278, 1.537, .365]], .066, .024);
hairLock('Central_swept_fringe', [[-.131, 1.742, .365], [-.111, 1.673, .448], [-.056, 1.615, .452], [.030, 1.563, .414]], .085, .030);
hairLock('Middle_swept_fringe', [[-.035, 1.756, .353], [.013, 1.685, .443], [.083, 1.620, .450], [.164, 1.573, .395]], .084, .031);
hairLock('Right_swept_fringe', [[.071, 1.741, .337], [.145, 1.679, .414], [.224, 1.605, .414], [.297, 1.541, .325]], .081, .026);
hairLock('Right_side_lock', [[.256, 1.659, .297], [.315, 1.543, .325], [.333, 1.392, .287], [.303, 1.305, .262]], .039, .020);
hairLock('Left_side_lock', [[-.266, 1.655, .291], [-.317, 1.529, .330], [-.333, 1.385, .286], [-.306, 1.305, .263]], .039, .020);

const restRotations = new Map();
astronaut.traverse(o => restRotations.set(o, o.quaternion.clone()));
const clips = [];
const animated = [motion, chest, head, ...Object.values(limbs).flatMap(l => [l.shoulder, l.elbow, l.hip, l.knee, l.ankle])];
const soles = Object.values(limbs).map(x => x.sole);
const up = new T.Vector3(0, 1, 0);
function pose(phase, running) {
  for (const o of animated) { o.quaternion.copy(restRotations.get(o)); }
  motion.position.set(0, 0, 0);
  const swing = Math.sin(phase);
  chest.rotation.set(running ? .14 : .025, (running ? .065 : .038) * swing, (running ? .045 : .022) * swing);
  head.rotation.set(running ? -.105 : -.02, -.028 * swing, -(running ? .026 : .013) * swing);
  for (const [index, l] of Object.values(limbs).entries()) {
    const s = index === 0 ? -1 : 1, a = phase + index * Math.PI, v = Math.sin(a);
    l.hip.rotation.x = -(running ? .80 : .41) * v;
    l.hip.rotation.z = s * .025;
    l.knee.rotation.x = (running ? .20 : .085) + (running ? 1.14 : .52) * Math.pow(Math.max(0, -Math.cos(a)), 1.3);
    l.ankle.rotation.x = -.68 * l.hip.rotation.x - .56 * l.knee.rotation.x;
    l.shoulder.rotation.set((running ? .68 : .39) * v, 0, s * (running ? .17 : .22));
    l.elbow.rotation.x = running ? -1.10 - .13 * v : -.25 - .13 * Math.cos(a);
  }
  astronaut.updateMatrixWorld(true);
  // Ground the lowest boot sole, with a brief flight phase in the run cycle.
  let minY = Infinity;
  for (const l of Object.values(limbs)) {
    l.ankle.traverse(o => { if (!o.isMesh || !(o.name.startsWith('Sole_tread') || o.name.startsWith('Boot_sole'))) return; o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); minY = Math.min(minY, b.min.y); });
  }
  const flight = running ? .037 * Math.pow(Math.max(0, Math.cos(phase * 2)), 2) : 0;
  motion.position.y = -minY + flight;
  motion.position.x = (running ? .011 : .007) * swing;
  astronaut.updateMatrixWorld(true);
}
const audit = { headMeshCount: 0, skinnedMeshes: 0, maxHeadScaleError: 0, maxFaceDistanceChange: 0, animationSamples: 0, cycles: {} };
head.traverse(o => { if (o.isMesh) audit.headMeshCount++; if (o.isSkinnedMesh) audit.skinnedMeshes++; });
const eyeR = headParts.getObjectByName('RightEye'), eyeL = headParts.getObjectByName('LeftEye');
const baseEyeDistance = eyeR.position.distanceTo(eyeL.position);
for (const running of [false, true]) {
  const name = running ? 'Running' : 'Walking', duration = running ? .70 : 1.18, frames = 80;
  const times = [], rotations = new Map(animated.map(o => [o, []])), positions = [];
  let minGround = Infinity, maxGround = -Infinity;
  for (let i = 0; i <= frames; i++) {
    const phase = i === frames ? 0 : i / frames * Math.PI * 2; pose(phase, running); times.push(i / frames * duration);
    for (const o of animated) rotations.get(o).push(...o.quaternion.toArray());
    positions.push(...motion.position.toArray());
    const worldScale = head.getWorldScale(new T.Vector3()); audit.maxHeadScaleError = Math.max(audit.maxHeadScaleError, ...worldScale.toArray().map(v => Math.abs(v - 1)));
    const d = eyeL.getWorldPosition(new T.Vector3()).distanceTo(eyeR.getWorldPosition(new T.Vector3())); audit.maxFaceDistanceChange = Math.max(audit.maxFaceDistanceChange, Math.abs(d - baseEyeDistance)); audit.animationSamples++;
    minGround = Math.min(minGround, motion.position.y); maxGround = Math.max(maxGround, motion.position.y);
  }
  const tracks = [new T.VectorKeyframeTrack('MotionRoot.position', times, positions)];
  for (const o of animated) tracks.push(new T.QuaternionKeyframeTrack(o.name + '.quaternion', times, rotations.get(o)));
  clips.push(new T.AnimationClip(name, duration, tracks));
  audit.cycles[name] = { duration, frames: frames + 1, rootYRange: [minGround, maxGround] };
}
// Neutral standing pose for DCC import and static thumbnails.
for (const o of animated) o.quaternion.copy(restRotations.get(o));
motion.position.set(0, .0155, 0);
for (const l of Object.values(limbs)) { l.elbow.rotation.x = -.16; }
astronaut.updateMatrixWorld(true);
audit.geometryCount = 0; audit.triangles = 0;
astronaut.traverse(o => { if (o.isMesh) { audit.geometryCount++; audit.triangles += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3; } });
if (audit.maxHeadScaleError > 1e-6 || audit.maxFaceDistanceChange > 1e-6 || audit.skinnedMeshes !== 0) throw new Error('Rigid face verification failed');
astronaut.traverse(o => { if (o.isMesh && o.geometry.attributes.uv) o.geometry.deleteAttribute('uv'); });
scene.userData = { title: 'Little Explorer', authoring: 'Original parametric model', forward: '+Z', up: '+Y', animation: 'Looping in-place Walking and Running', faceRig: 'Rigid head assembly; no facial skin weights or animated scale' };
const glb = await new GLTFExporter().parseAsync(scene, { binary: true, animations: clips, onlyVisible: true });
writeFileSync(rootDir + 'astronaut-new.glb', Buffer.from(glb));
writeFileSync(rootDir + 'astronaut-review/rig-audit.json', JSON.stringify(audit, null, 2));
console.log(JSON.stringify({ output: 'astronaut-new.glb', bytes: glb.byteLength, ...audit }, null, 2));
