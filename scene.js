/**
 * Hero 3D scene: a small studio turntable where "mini Tawan" (model-web.glb)
 * walks laps around a floating T monogram wrapped in a wireframe cage, orbit
 * rings and a point shell. Drag to orbit (fine pointers), click to make him run.
 *
 * model-web.glb uses the original textured astronaut with a fully opaque visor.
 * tools/visor/build.py fits the visor and binds it and the lower helmet to Head.
 * Walking and Running are the original clips; see visor-review/README.md to rebuild.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const canvas = document.getElementById('hero-canvas');
const stage = canvas?.closest('[data-stage]');

const CYAN = new THREE.Color('#00e5ff');
const CYAN_DEEP = new THREE.Color('#00a9bd');
const WALK_RADIUS = 1.55;
const CORE_Y = 1.55;

if (canvas && stage) {
  const whenIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 400));
  const start = () => whenIdle(() => init(), { timeout: 1500 });
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}

function init() {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const loaderEl = stage.querySelector('[data-stage-loader]');
  const readout = stage.querySelector('[data-stage-readout]');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    if (loaderEl) loaderEl.lastElementChild.textContent = 'WebGL ไม่พร้อมใช้งานบนอุปกรณ์นี้';
    loaderEl?.querySelector('.spinner')?.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, finePointer ? 1.75 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(3.2, 2.6, 8.2);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1.05, 0);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.6;
  controls.minPolarAngle = Math.PI * 0.26;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.45;
  // On touch screens the canvas must never trap vertical page scrolling.
  controls.enabled = finePointer;

  /* ---------------- Lights ---------------- */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3.5, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 16;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.bias = -0.0005;
  key.shadow.radius = 4;
  scene.add(key);
  const rimA = new THREE.PointLight(CYAN, 18, 10);
  rimA.position.set(-3, 2, -2.5);
  scene.add(rimA);
  const rimB = new THREE.PointLight(CYAN, 10, 8);
  rimB.position.set(2.8, 0.4, -2.2);
  scene.add(rimB);

  /* ---------------- Turntable ---------------- */
  const world = new THREE.Group();
  scene.add(world);

  const discMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.7, metalness: 0 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.34, 0.12, 128), discMat);
  disc.position.y = -0.06;
  disc.receiveShadow = true;
  world.add(disc);

  const rimRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.31, 0.012, 8, 200),
    new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false })
  );
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = 0.0;
  world.add(rimRing);

  const grid = new THREE.PolarGridHelper(2.2, 16, 6, 96, 0xffffff, 0xffffff);
  grid.position.y = 0.004;
  grid.material.transparent = true;
  grid.material.opacity = 0.12;
  world.add(grid);

  // Dashed walking path
  const pathPts = [];
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    pathPts.push(new THREE.Vector3(Math.cos(a) * WALK_RADIUS, 0.008, Math.sin(a) * WALK_RADIUS));
  }
  const pathMat = new THREE.LineDashedMaterial({ color: CYAN_DEEP, dashSize: 0.08, gapSize: 0.08, transparent: true, opacity: 0.9 });
  const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathPts), pathMat);
  path.computeLineDistances();
  world.add(path);

  /* ---------------- T monogram core ---------------- */
  const core = new THREE.Group();
  core.position.y = CORE_Y;
  world.add(core);

  const tShape = new THREE.Shape();
  [
    [-0.5, 0.5], [0.5, 0.5], [0.5, 0.25], [0.14, 0.25],
    [0.14, -0.5], [-0.14, -0.5], [-0.14, 0.25], [-0.5, 0.25],
  ].forEach(([x, y], i) => (i ? tShape.lineTo(x, y) : tShape.moveTo(x, y)));
  tShape.closePath();
  const tGeo = new THREE.ExtrudeGeometry(tShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 3,
  });
  tGeo.center();
  const tMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0a,
    metalness: 0.85,
    roughness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
  const tMesh = new THREE.Mesh(tGeo, tMat);
  tMesh.castShadow = true;
  const tEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(tGeo, 25),
    new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.75, toneMapped: false })
  );
  const monogram = new THREE.Group();
  monogram.add(tMesh, tEdges);
  monogram.scale.setScalar(0.95);
  core.add(monogram);

  const cageMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, wireframe: true, transparent: true, opacity: 0.16 });
  const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 1), cageMat);
  core.add(cage);

  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.8, 0)),
    new THREE.LineBasicMaterial({ color: CYAN_DEEP, transparent: true, opacity: 0.55 })
  );
  core.add(shell);

  const ringInkMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.45 });
  const ringA = new THREE.Group();
  ringA.rotation.set(Math.PI / 2.3, 0.2, 0);
  ringA.add(new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.004, 8, 180), ringInkMat));
  const nodeMat = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false });
  [0, 2.1, 4.2].forEach((a) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), nodeMat);
    node.position.set(Math.cos(a) * 1.32, Math.sin(a) * 1.32, 0);
    ringA.add(node);
  });
  core.add(ringA);

  const ringB = new THREE.Group();
  ringB.rotation.set(-Math.PI / 3, -0.5, 0.4);
  ringB.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(1.52, 0.003, 8, 200),
      new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.85, toneMapped: false })
    )
  );
  const cubeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), cubeMat);
  cube.position.set(1.52, 0, 0);
  ringB.add(cube);
  core.add(ringB);

  const ptsCount = 420;
  const ptsPos = new Float32Array(ptsCount * 3);
  for (let i = 0; i < ptsCount; i++) {
    const t = i / ptsCount;
    const inc = Math.acos(1 - 2 * t);
    const az = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 1.75 * (0.92 + ((i * 7919) % 100) / 1250);
    ptsPos[i * 3] = r * Math.sin(inc) * Math.cos(az);
    ptsPos[i * 3 + 1] = r * Math.sin(inc) * Math.sin(az);
    ptsPos[i * 3 + 2] = r * Math.cos(inc);
  }
  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(ptsPos, 3));
  const ptsMat = new THREE.PointsMaterial({ color: 0x0a0a0a, size: 0.014, transparent: true, opacity: 0.45, depthWrite: false });
  const points = new THREE.Points(ptsGeo, ptsMat);
  core.add(points);

  // Soft glow puddle under the monogram
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,229,255,0.55)');
    grad.addColorStop(1, 'rgba(0,229,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.01;
  world.add(glow);

  /* ---------------- Theme ---------------- */
  const applyTheme = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const ink = new THREE.Color(dark ? 0xf2f2f2 : 0x0a0a0a);
    discMat.color.set(dark ? 0x161616 : 0xf2f2f2);
    grid.material.color.copy(ink);
    grid.material.opacity = dark ? 0.1 : 0.12;
    cageMat.color.copy(ink);
    cageMat.opacity = dark ? 0.14 : 0.16;
    ringInkMat.color.copy(ink);
    cubeMat.color.copy(ink);
    ptsMat.color.copy(ink);
    tMat.color.set(dark ? 0xe8e8e8 : 0x0a0a0a);
    tMat.metalness = dark ? 0.6 : 0.85;
    requestRender();
  };
  document.addEventListener('themechange', applyTheme);

  /* ---------------- Character ---------------- */
  let mixer = null;
  let walkAction = null;
  let runAction = null;
  let character = null;
  let running = false;
  let runUntil = 0;
  let angle = Math.PI * 0.35;
  let distance = 0;

  const gltfLoader = new GLTFLoader();
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  gltfLoader.load(
    'model-web.glb',
    (gltf) => {
      character = gltf.scene;
      const box = new THREE.Box3().setFromObject(character);
      const size = box.getSize(new THREE.Vector3());
      const scale = 1.3 / size.y;
      character.scale.setScalar(scale);
      const scaledBox = new THREE.Box3().setFromObject(character);
      const center = scaledBox.getCenter(new THREE.Vector3());
      const holder = new THREE.Group();
      character.position.x -= center.x;
      character.position.z -= center.z;
      character.position.y -= scaledBox.min.y;
      character.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.frustumCulled = false;
        }
      });
      holder.add(character);
      world.add(holder);
      character = holder;

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        const find = (name) => gltf.animations.find((c) => c.name.toLowerCase().includes(name));
        const walkClip = find('walk') || gltf.animations[0];
        const runClip = find('run');
        walkAction = mixer.clipAction(walkClip);
        walkAction.play();
        if (runClip) {
          runAction = mixer.clipAction(runClip);
          runAction.setEffectiveWeight(0);
          runAction.play();
        }
      }
      placeCharacter(0);
      stage.classList.add('is-live');
      requestRender();
    },
    undefined,
    () => {
      // The monogram scene still works without the character.
      stage.classList.add('is-live');
      readout && (readout.textContent = 'MODEL OFFLINE');
      requestRender();
    }
  );

  const tangent = new THREE.Vector3();
  function placeCharacter(dt) {
    if (!character) return;
    const speed = running ? 1.25 : 0.5; // metres per second along the path
    if (!reduceMotion) {
      angle += (speed / WALK_RADIUS) * dt;
      distance += speed * dt;
    }
    character.position.set(Math.cos(angle) * WALK_RADIUS, 0, Math.sin(angle) * WALK_RADIUS);
    tangent.set(-Math.sin(angle), 0, Math.cos(angle));
    const targetYaw = Math.atan2(tangent.x, tangent.z);
    character.rotation.y = targetYaw;
  }

  function setRunning(on) {
    if (!walkAction || !runAction || on === running) return;
    running = on;
    const from = on ? walkAction : runAction;
    const to = on ? runAction : walkAction;
    to.enabled = true;
    to.setEffectiveTimeScale(1);
    to.setEffectiveWeight(1);
    to.time = 0;
    from.crossFadeTo(to, 0.35, true);
  }

  // Click (not drag) on the stage: run for a few seconds.
  let downAt = null;
  canvas.addEventListener('pointerdown', (e) => {
    downAt = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved < 6 && runAction && !reduceMotion) {
      setRunning(true);
      runUntil = performance.now() + 3200;
      requestRender();
    }
  });

  /* ---------------- Pointer parallax ---------------- */
  const pointer = { x: 0, y: 0 };
  if (finePointer && !reduceMotion) {
    addEventListener(
      'pointermove',
      (e) => {
        pointer.x = (e.clientX / innerWidth) * 2 - 1;
        pointer.y = (e.clientY / innerHeight) * 2 - 1;
      },
      { passive: true }
    );
  }

  /* ---------------- Sizing ---------------- */
  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait stages (phones) need a wider view so the turntable fits.
    camera.fov = camera.aspect < 0.9 ? 40 : camera.aspect < 1.2 ? 34 : 30;
    const dist = camera.aspect < 0.9 ? 10.2 : 8.8;
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, dist);
    camera.updateProjectionMatrix();
    requestRender();
  };
  new ResizeObserver(resize).observe(stage);

  /* ---------------- Loop ---------------- */
  const clock = new THREE.Clock();
  let inView = true;
  let running3d = false;
  let lastReadout = 0;

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) startLoop();
  }, { rootMargin: '80px' }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) startLoop();
  });
  controls.addEventListener('change', requestRender);

  function frame() {
    const dt = Math.min(clock.getDelta(), 1 / 20);
    const t = clock.elapsedTime;

    if (runUntil && performance.now() > runUntil) {
      runUntil = 0;
      setRunning(false);
    }

    if (!reduceMotion) {
      core.position.y = CORE_Y + Math.sin(t * 1.2) * 0.06;
      monogram.rotation.y = Math.sin(t * 0.5) * 0.6;
      monogram.rotation.x = Math.sin(t * 0.33) * 0.1;
      cage.rotation.y += dt * 0.12;
      cage.rotation.x += dt * 0.05;
      shell.rotation.y -= dt * 0.22;
      shell.rotation.z += dt * 0.08;
      ringA.rotation.z += dt * 0.35;
      ringB.rotation.z -= dt * 0.22;
      points.rotation.y += dt * 0.03;
      pathMat.dashOffset = (pathMat.dashOffset || 0) - dt * 0.12;
      world.rotation.x = THREE.MathUtils.damp(world.rotation.x, pointer.y * 0.06, 3, dt);
      world.position.x = THREE.MathUtils.damp(world.position.x, pointer.x * 0.12, 3, dt);
      mixer?.update(dt);
    }
    placeCharacter(dt);
    controls.update();
    renderer.render(scene, camera);

    if (readout && character && t - lastReadout > 0.2) {
      lastReadout = t;
      readout.textContent = `${running ? 'RUN' : 'WALK'} · ${distance.toFixed(1)} m`;
    }
  }

  function loop() {
    if (!inView || document.hidden || reduceMotion) {
      running3d = false;
      return;
    }
    frame();
    requestAnimationFrame(loop);
  }

  function startLoop() {
    if (running3d || reduceMotion) {
      if (reduceMotion) requestRender();
      return;
    }
    running3d = true;
    clock.getDelta();
    requestAnimationFrame(loop);
  }

  let pending = false;
  function requestRender() {
    if (running3d || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (!running3d) frame();
    });
  }

  applyTheme();
  resize();
  startLoop();
}
