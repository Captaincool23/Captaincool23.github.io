const journey = document.querySelector('.space-journey');
const shell = journey.querySelector('.page-shell');
const canvas = document.querySelector('#portfolio-scene');
const card = document.querySelector('#welcome-card');
const menu = document.querySelector('#space-menu');
const menuToggle = document.querySelector('#space-menu-toggle');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const worldState = { progress: 0, portal: document.documentElement.classList.contains('welcome-open') ? 0 : 1, ready: false };
let resetFlight = () => {};

function closeMenu() {
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}
menuToggle.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
menu.addEventListener('click', (event) => { if (event.target.closest('a, button')) closeMenu(); });
document.addEventListener('pointerdown', (event) => { if (!event.target.closest('.space-hud')) closeMenu(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuToggle.focus(); }
});
window.addEventListener('welcome:portal', (event) => { worldState.portal = event.detail.progress; });
window.addEventListener('welcome:start', () => { worldState.portal = 0; resetFlight(); });
window.addEventListener('welcome:complete', () => { worldState.portal = 1; });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.scroll-reveal').forEach((element) => observer.observe(element));
document.documentElement.classList.add('motion-ready');
Promise.all([import('lucide-element'), import('lucide-menu')]).then(([{ default: createElement }, { default: menuIcon }]) => {
  const icon = createElement(menuIcon, { 'aria-hidden': 'true', width: '19', height: '19' });
  menuToggle.querySelector('[data-lucide]').replaceWith(icon);
}).catch(() => {});

function setHud(progress) {
  const chapter = progress < 0.12 ? 0 : progress < 0.7 ? 1 : 2;
  shell.dataset.scene = ['overlook', 'flight', 'hangar'][chapter];
  shell.style.setProperty('--flight-progress', progress.toFixed(4));
  shell.classList.toggle('is-departed', progress > 0.94);
  shell.style.setProperty('--overlook-opacity', String(Math.max(0, 1 - progress / 0.15)));
  document.querySelector('#chapter-number').textContent = `0${chapter + 1} / 03`;
  document.querySelector('#chapter-name').textContent = ['The overlook', 'Through the docking corridor', 'Starship hangar deck'][chapter];
  document.querySelector('#flight-progress-number').textContent = String(Math.round(progress * 100)).padStart(2, '0');
  document.querySelector('.world-progress').setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  const cardOpacity = Math.max(0, Math.min(1, (progress - 0.75) / 0.11)) * (motion.matches ? 1 : 1 - Math.max(0, Math.min(1, (progress - 0.88) / 0.07)));
  card.hidden = cardOpacity <= 0;
  card.inert = cardOpacity < 0.85;
  shell.style.setProperty('--card-opacity', cardOpacity.toFixed(4));
  document.querySelector('#flight-cue').textContent = progress >= 0.86 && !motion.matches ? 'Launching…' : progress >= 0.75 ? 'Scroll to launch' : 'Explore the orbit';
}

async function initializeSpaceWorld() {
  const [THREE, { gsap }, { ScrollTrigger }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
    import('three'), import('gsap'), import('gsap/ScrollTrigger'),
    import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'), import('three/addons/postprocessing/OutputPass.js'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.2 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050815);
  scene.fog = new THREE.FogExp2(0x080d1c, 0.0035);
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 650);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(800, 600), 0.3, 0.45, 1.5));
  composer.addPass(new OutputPass());
  const loader = new THREE.TextureLoader();
  let sceneDirty = true;
  const vector = (x, y, z) => new THREE.Vector3(x, y, z);
  const matte = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.66, metalness: 0.4, flatShading: true, ...options });
  const glow = (color, strength = 1.9) => matte(color, { emissive: color, emissiveIntensity: strength, roughness: 0.4 });
  const metal = matte(0x25374a, { metalness: 0.6, roughness: 0.63 });
  const dark = matte(0x0c1520);
  const silver = matte(0x96aeb8, { metalness: 0.85, roughness: 0.24 });
  const cyan = glow(0x56e9ed);
  const purple = glow(0x9c79ea, 2.4);
  const orange = glow(0xffaa76, 2.4);

  function mesh(geometry, material, parent, position = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    parent.add(object);
    return object;
  }
  function box(parent, size, position, material = metal) { return mesh(new THREE.BoxGeometry(...size), material, parent, position); }
  function tube(parent, start, end, radius, material = metal) {
    const from = vector(...start), to = vector(...end);
    const object = mesh(new THREE.CylinderGeometry(radius, radius, from.distanceTo(to), 8), material, parent);
    object.position.copy(from).add(to).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(vector(0, 1, 0), to.sub(from).normalize());
    return object;
  }
  function torus(parent, radius, thickness, position, material, segments = 64) {
    return mesh(new THREE.TorusGeometry(radius, thickness, 6, segments), material, parent, position);
  }
  scene.add(new THREE.HemisphereLight(0xa3cfed, 0x18213d, 2));
  const sun = new THREE.DirectionalLight(0xb3e6ff, 2.1);
  sun.position.set(-12, 30, 14);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xb09aef, 2.1);
  rim.position.set(16, 10, -40);
  scene.add(rim);
  [[0, 6, 3, 0x72e8ff, 140], [0, 7, -42, 0x7e8eff, 220], [-5, 6, -80, 0x69f2d6, 230], [7, 5, -88, 0xce9fff, 210]].forEach(([x, y, z, color, intensity]) => {
    const light = new THREE.PointLight(color, intensity, 40, 2);
    light.position.set(x, y, z);
    scene.add(light);
  });
  const warmRim = new THREE.DirectionalLight(0xffc46a, 1.5);
  warmRim.position.set(48, 34, -38);
  warmRim.target.position.set(27, 20, -86);
  scene.add(warmRim, warmRim.target);
  [[0xa98aff, 520, 70, 8, 30, -62], [0x4fe4ff, 360, 70, 48, 8, -66], [0x56e9ed, 380, 42, -19, 16, -52]].forEach(([color, intensity, distance, x, y, z]) => {
    const light = new THREE.PointLight(color, intensity, distance, 2);
    light.position.set(x, y, z);
    scene.add(light);
  });
  const blastLight = new THREE.PointLight(0xffa56a, 0, 55, 2);
  scene.add(blastLight);
  const skyReady = loader.loadAsync('assets/welcome-space.jpg').then((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    const sky = mesh(new THREE.SphereGeometry(290, 40, 24), new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, color: 0x4a4864, fog: false }), scene, [0, 0, -40]);
    sky.rotation.y = 1.3;
    sceneDirty = true;
  }).catch(() => {});

  let randomSeed = 42;
  const random = () => { randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0; return randomSeed / 4294967296; };
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(6600), starColors = new Float32Array(6600);
  for (let index = 0; index < 2200; index += 1) {
    starPositions[index * 3] = (random() - 0.5) * 400;
    starPositions[index * 3 + 1] = (random() - 0.5) * 240;
    starPositions[index * 3 + 2] = 50 - random() * 360;
    new THREE.Color().setHSL(0.5 + random() * 0.23, 0.3, 0.55 + random() * 0.4).toArray(starColors, index * 3);
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false }));
  scene.add(stars);

  const planetGroup = new THREE.Group();
  planetGroup.position.set(27, 20, -86);
  planetGroup.rotation.z = -0.36;
  scene.add(planetGroup);
  const planet = mesh(new THREE.IcosahedronGeometry(17, 3), matte(0x7f7ac2, { roughness: 0.84, emissive: 0x171a46, emissiveIntensity: 0.7 }), planetGroup);
  for (let band = 0; band < 9; band += 1) {
    const ring = mesh(new THREE.RingGeometry(20 + band * 1.05, 20.7 + band * 1.05, 100), new THREE.MeshStandardMaterial({ color: band % 2 ? 0x7eaaae : 0xb3a2cf, side: THREE.DoubleSide, transparent: true, opacity: 0.46, roughness: 0.6 }), planetGroup);
    ring.rotation.x = Math.PI / 2.7;
  }
  mesh(new THREE.SphereGeometry(17.4, 28, 20), new THREE.MeshBasicMaterial({ color: 0x8998ed, transparent: true, opacity: 0.07, side: THREE.BackSide, depthWrite: false }), planetGroup);

  const station = new THREE.Group();
  station.position.set(-29, 12, -66);
  station.rotation.set(0.3, 0.3, 0.25);
  scene.add(station);
  torus(station, 7, 0.5, [0, 0, 0], metal);
  torus(station, 7.6, 0.035, [0, 0, 0], cyan);
  mesh(new THREE.CylinderGeometry(1.5, 1.5, 5, 8), silver, station).rotation.x = Math.PI / 2;
  for (let index = 0; index < 6; index += 1) {
    const angle = index / 6 * Math.PI * 2;
    tube(station, [0, 0, 0], [Math.cos(angle) * 7, Math.sin(angle) * 7, 0], 0.16, silver);
    box(station, [1.4, 2.3, 1.8], [Math.cos(angle) * 7, Math.sin(angle) * 7, 0], dark).rotation.z = angle;
  }
  function satellite(position, scale) {
    const group = new THREE.Group();
    group.position.set(...position);
    group.scale.setScalar(scale);
    scene.add(group);
    box(group, [1.1, 1.3, 1.1], [0, 0, 0], silver);
    tube(group, [-3.7, 0, 0], [3.7, 0, 0], 0.06);
    [-1, 1].forEach((side) => {
      box(group, [2.6, 0.07, 1.9], [side * 2.3, 0, 0], matte(0x254b70, { metalness: 0.8, roughness: 0.24 }));
      for (let line = 0; line < 6; line += 1) box(group, [0.018, 0.012, 1.82], [side * 2.3 - 1.1 + line * 0.43, 0.045, 0], cyan);
    });
    mesh(new THREE.ConeGeometry(0.65, 0.3, 12, 1, true), silver, group, [0, 1, 0]).rotation.x = 0.6;
    return group;
  }
  const satellites = [satellite([-14, 8, -22], 0.7), satellite([17, 9, -48], 1), satellite([-19, 4, -85], 0.7)];

  const goldWarm = new THREE.Color(0xffc46a), lunarCool = new THREE.Color(0x74c8ff);
  const rimPurple = new THREE.Color(0xb09aef), rimCool = new THREE.Color(0x7fd6ff);
  const glowTexture = (() => {
    const art = document.createElement('canvas');
    art.width = art.height = 128;
    const paint = art.getContext('2d');
    const gradient = paint.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.14)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(art);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  })();

  const solar = new THREE.Group();
  solar.position.set(-14, 12, -38);
  solar.visible = false;
  scene.add(solar);
  const sunCoreMaterial = new THREE.MeshStandardMaterial({ color: 0xff9a2e, emissive: 0xff7410, emissiveIntensity: 1.5, roughness: 0.6, flatShading: true, transparent: true, opacity: 0 });
  const sunCore = mesh(new THREE.IcosahedronGeometry(4.4, 2), sunCoreMaterial, solar);
  const coronas = [[0xffb84d, 17], [0xff7a2a, 31]].map(([color, size]) => {
    const material = new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.setScalar(size);
    solar.add(sprite);
    return { material, sprite, size };
  });
  const flareCount = 150;
  const flarePositions = new Float32Array(flareCount * 3), flareColors = new Float32Array(flareCount * 3);
  const flareSeeds = Array.from({ length: flareCount }, () => ({
    direction: vector(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
    bend: vector(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(2.2),
    speed: 0.28 + random() * 0.4,
    offset: random(),
  }));
  const flareGeometry = new THREE.BufferGeometry();
  flareGeometry.setAttribute('position', new THREE.BufferAttribute(flarePositions, 3));
  flareGeometry.setAttribute('color', new THREE.BufferAttribute(flareColors, 3));
  const flareMaterial = new THREE.PointsMaterial({ size: 0.9, map: glowTexture, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const flares = new THREE.Points(flareGeometry, flareMaterial);
  flares.frustumCulled = false;
  solar.add(flares);
  const sunLight = new THREE.PointLight(0xffc766, 0, 130, 2);
  sunLight.position.copy(solar.position);
  scene.add(sunLight);
  let solarAmount = 0;
  function updateSolar(viewProgress) {
    solarAmount = THREE.MathUtils.smoothstep(viewProgress, 0.1, 0.18) * (1 - THREE.MathUtils.smoothstep(viewProgress, 0.43, 0.52));
    solar.visible = solarAmount > 0.002;
    sunLight.intensity = solarAmount * 1300 * (0.95 + 0.05 * Math.sin(elapsed * 2.2));
    if (!solar.visible) return;
    sunCoreMaterial.opacity = solarAmount;
    sunCore.rotation.y = elapsed * 0.05;
    coronas.forEach((corona, index) => {
      const wave = Math.sin(elapsed * (1.7 - index * 0.6) + index * 1.3);
      corona.sprite.scale.setScalar(corona.size * (1 + 0.06 * wave));
      corona.material.opacity = solarAmount * (index ? 0.3 + 0.1 * wave : 0.62 + 0.14 * wave);
    });
    flareMaterial.opacity = solarAmount;
    flareSeeds.forEach((seed, index) => {
      const life = (elapsed * seed.speed + seed.offset) % 1;
      const radius = 4.5 + life * 6.5;
      flarePositions[index * 3] = seed.direction.x * radius + seed.bend.x * life * life * 3;
      flarePositions[index * 3 + 1] = seed.direction.y * radius + seed.bend.y * life * life * 3;
      flarePositions[index * 3 + 2] = seed.direction.z * radius + seed.bend.z * life * life * 3;
      const fade = (1 - life) ** 1.6;
      flareColors[index * 3] = fade;
      flareColors[index * 3 + 1] = fade * (0.55 + 0.3 * (1 - life));
      flareColors[index * 3 + 2] = fade * 0.18;
    });
    flareGeometry.attributes.position.needsUpdate = true;
    flareGeometry.attributes.color.needsUpdate = true;
  }

  const moon = new THREE.Group();
  moon.position.set(-10, 9, -112);
  moon.visible = false;
  scene.add(moon);
  const moonGeometry = new THREE.IcosahedronGeometry(6, 4);
  const craters = Array.from({ length: 24 }, () => ({
    direction: vector(random() - 0.5, random() - 0.5, random() * 0.9 + 0.35).normalize(),
    radius: 0.13 + random() * 0.22,
    depth: 0.06 + random() * 0.07,
  }));
  const moonPositions = moonGeometry.attributes.position;
  const moonPoint = vector(0, 0, 0);
  for (let index = 0; index < moonPositions.count; index += 1) {
    moonPoint.fromBufferAttribute(moonPositions, index).normalize();
    let height = 0;
    craters.forEach((crater) => {
      const angle = Math.acos(Math.min(1, moonPoint.dot(crater.direction)));
      if (angle < crater.radius) height -= crater.depth * (1 - (angle / crater.radius) ** 2);
      else if (angle < crater.radius * 1.28) height += crater.depth * 0.35 * (1 - (angle - crater.radius) / (crater.radius * 0.28));
    });
    moonPositions.setXYZ(index, moonPoint.x * 6 * (1 + height), moonPoint.y * 6 * (1 + height), moonPoint.z * 6 * (1 + height));
  }
  moonGeometry.computeVertexNormals();
  const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xb4c4d2, emissive: 0x0b2a38, emissiveIntensity: 0.9, roughness: 0.95, metalness: 0.05, flatShading: true, transparent: true, opacity: 0 });
  const moonBody = mesh(moonGeometry, moonMaterial, moon);
  const moonRingPivot = new THREE.Group();
  moonRingPivot.rotation.set(1.18, 0.1, 0.38);
  moon.add(moonRingPivot);
  const moonRingMaterial = new THREE.MeshBasicMaterial({ color: 0x7fe9ff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
  mesh(new THREE.RingGeometry(8.35, 8.5, 120), moonRingMaterial, moonRingPivot);
  const moonBeadMaterial = new THREE.MeshBasicMaterial({ color: 0xbff7ff, transparent: true, opacity: 0, toneMapped: false, fog: false });
  const moonBead = mesh(new THREE.SphereGeometry(0.3, 10, 8), moonBeadMaterial, moonRingPivot);
  let moonAmount = 0;
  function updateMoon(viewProgress) {
    moonAmount = THREE.MathUtils.smoothstep(viewProgress, 0.36, 0.5);
    moon.visible = moonAmount > 0.002;
    if (!moon.visible) return;
    moonMaterial.opacity = moonAmount;
    moonRingMaterial.opacity = 0.55 * moonAmount;
    moonBeadMaterial.opacity = moonAmount;
    moonBody.rotation.y = elapsed * 0.03;
    const orbit = elapsed * 0.4;
    moonBead.position.set(Math.cos(orbit) * 8.425, Math.sin(orbit) * 8.425, 0);
  }
  function updateLighting(viewProgress) {
    const shift = THREE.MathUtils.smoothstep(viewProgress, 0.4, 0.65);
    warmRim.color.copy(goldWarm).lerp(lunarCool, shift);
    warmRim.intensity = THREE.MathUtils.lerp(1.5, 1.9, shift);
    rim.color.copy(rimPurple).lerp(rimCool, shift);
  }

  const deck = new THREE.Group();
  scene.add(deck);
  const deckFloor = matte(0x101a28, { metalness: 0.72, roughness: 0.42 });
  const deckRim = matte(0x7f95a8, { metalness: 0.85, roughness: 0.3 });
  const flat = (shape) => { shape.rotation.x = Math.PI / 2; return shape; };
  mesh(new THREE.CylinderGeometry(8.7, 9.1, 0.65, 48), deckFloor, deck, [0, -0.48, 2]);
  flat(torus(deck, 8.8, 0.2, [0, -0.17, 2], deckRim, 48));
  flat(torus(deck, 8.88, 0.025, [0, -0.4, 2], cyan, 48));
  const railRadius = 8.55;
  const gateHalf = THREE.MathUtils.degToRad(15);
  const barrierMaterial = () => new THREE.MeshBasicMaterial({ color: 0x69dfe6, transparent: true, opacity: 0.085, side: THREE.DoubleSide, depthWrite: false });
  const railArc = (parent, height, from, length, material) => {
    const geometry = new THREE.TorusGeometry(railRadius, 0.045, 6, 96, length);
    geometry.rotateZ(Math.PI / 2 - (from + length));
    const arc = new THREE.Mesh(geometry, material);
    arc.rotation.x = Math.PI / 2;
    arc.position.set(0, height, 2);
    parent.add(arc);
    return arc;
  };
  const railFrom = Math.PI + gateHalf, railLength = Math.PI * 2 - gateHalf * 2;
  mesh(new THREE.CylinderGeometry(railRadius, railRadius, 1.3, 96, 1, true, railFrom, railLength), barrierMaterial(), deck, [0, 0.52, 2]);
  [0, 1.17].forEach((height) => railArc(deck, height, railFrom, railLength, cyan));
  for (let index = 0; index < 12; index += 1) {
    if (index === 6) continue;
    const angle = index / 12 * Math.PI * 2;
    const x = Math.sin(angle) * railRadius, z = 2 + Math.cos(angle) * railRadius;
    tube(deck, [x, -0.1, z], [x, 1.26, z], 0.07, silver);
    mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.1, 8), cyan, deck, [x, 1.31, z]);
    mesh(new THREE.SphereGeometry(0.085, 8, 6), cyan, deck, [x, 1.4, z]);
  }

  const gate = new THREE.Group();
  deck.add(gate);
  const gateBarrier = barrierMaterial();
  gateBarrier.opacity = 0.16;
  mesh(new THREE.CylinderGeometry(railRadius, railRadius, 1.3, 32, 1, true, Math.PI - gateHalf, gateHalf * 2), gateBarrier, gate, [0, 0.52, 2]);
  [0, 1.17].forEach((height) => railArc(gate, height, Math.PI - gateHalf, gateHalf * 2, cyan));
  for (let line = 0; line < 5; line += 1) {
    const angle = Math.PI - gateHalf + (line + 0.5) / 5 * gateHalf * 2;
    box(gate, [0.03, 1.22, 0.03], [Math.sin(angle) * railRadius, 0.52, 2 + Math.cos(angle) * railRadius], cyan);
  }
  const gateGlow = glow(0x56e9ed, 2.4);
  [-1, 1].forEach((side) => {
    const angle = Math.PI + side * gateHalf;
    const pillar = new THREE.Group();
    pillar.position.set(Math.sin(angle) * railRadius, 0, 2 + Math.cos(angle) * railRadius);
    deck.add(pillar);
    box(pillar, [0.5, 0.22, 0.5], [0, -0.04, 0], metal);
    mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.2, 10), dark, pillar, [0, 1.05, 0]);
    [0.5, 1.1, 1.7].forEach((height) => flat(torus(pillar, 0.19, 0.02, [0, height, 0], gateGlow, 20)));
    mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.12, 10), metal, pillar, [0, 2.2, 0]);
    mesh(new THREE.SphereGeometry(0.17, 10, 8), gateGlow, pillar, [0, 2.42, 0]);
  });
  const gateClosed = new THREE.Color(0x56e9ed), gateOpen = new THREE.Color(0x4dffa8), gateColor = new THREE.Color();
  function updateGate(p) {
    const open = THREE.MathUtils.smoothstep(p, 0.02, 0.12);
    gate.position.y = -1.9 * open;
    gate.visible = open < 0.995;
    gateColor.copy(gateClosed).lerp(gateOpen, THREE.MathUtils.smoothstep(open, 0.1, 0.6));
    gateGlow.color.copy(gateColor);
    gateGlow.emissive.copy(gateColor);
    gateGlow.emissiveIntensity = 2.2 + 1.5 * open + 0.5 * Math.sin(elapsed * 3.2);
    gateBarrier.opacity = 0.16 * (1 - 0.6 * open);
  }

  const padRingInner = glow(0x56e9ed, 2.6), padRingOuter = glow(0x56e9ed, 1.8);
  flat(torus(deck, 2.5, 0.055, [0, -0.14, 3], padRingInner, 96));
  flat(torus(deck, 3.65, 0.04, [0, -0.14, 3], padRingOuter, 96));
  const padOutline = flat(torus(deck, 1.45, 0.035, [0, -0.135, 3], padRingInner, 6));
  padOutline.rotation.z = Math.PI / 6;
  const padFill = mesh(new THREE.CircleGeometry(1.42, 6), new THREE.MeshBasicMaterial({ color: 0x2fd0e0, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), deck, [0, -0.145, 3]);
  padFill.rotation.set(-Math.PI / 2, 0, Math.PI / 6);
  const seamMaterial = new THREE.MeshBasicMaterial({ color: 0x3fc9d6, transparent: true, opacity: 0.32, toneMapped: false });
  [0.25, 0.75, 1.25, 1.75].forEach((turn) => {
    const angle = turn * Math.PI, dx = Math.sin(angle), dz = Math.cos(angle);
    const start = 2.75, end = -dz + Math.sqrt(dz * dz + 8.1 * 8.1 - 1), middle = (start + end) / 2;
    box(deck, [0.045, 0.012, end - start], [dx * middle, -0.15, 3 + dz * middle], seamMaterial).rotation.y = angle;
  });

  const statusLights = Array.from({ length: 9 }, (_, index) => {
    const angle = THREE.MathUtils.degToRad(196 + index * 10);
    const x = Math.sin(angle) * 7.9, z = 2 + Math.cos(angle) * 7.9;
    box(deck, [0.62, 0.02, 0.2], [x, -0.16, z], dark).rotation.y = angle;
    const lamp = box(deck, [0.4, 0.03, 0.09], [x, -0.148, z], glow([0x78f2bd, 0x56e9ed, 0xffaa76][index % 3], 1));
    lamp.rotation.y = angle;
    return { lamp, phase: index * 0.8 };
  });

  const telemetry = new THREE.Group();
  telemetry.position.set(4.6, -0.14, 0.8);
  telemetry.rotation.y = -0.4;
  deck.add(telemetry);
  mesh(new THREE.CylinderGeometry(0.78, 0.92, 0.26, 12), dark, telemetry, [0, 0.12, 0]);
  flat(torus(telemetry, 0.7, 0.025, [0, 0.26, 0], cyan, 48));
  box(telemetry, [0.8, 0.5, 0.45], [0, 0.5, 0], dark);
  const consolePanel = new THREE.Group();
  consolePanel.position.set(0, 0.92, 0.04);
  consolePanel.rotation.x = 0.6;
  telemetry.add(consolePanel);
  mesh(new THREE.BoxGeometry(0.92, 0.05, 0.56), new THREE.MeshStandardMaterial({ color: 0x7be8f5, emissive: 0x1b6a78, emissiveIntensity: 0.7, transparent: true, opacity: 0.32, metalness: 0.3, roughness: 0.1 }), consolePanel);
  [0.5, 0.32, 0.62, 0.22].forEach((width, index) => box(consolePanel, [width, 0.012, 0.035], [-0.2 + width / 2 - 0.25 + 0.25, 0.035, -0.18 + index * 0.12], cyan));
  const globeGroup = new THREE.Group();
  globeGroup.position.set(0, 2, 0);
  telemetry.add(globeGroup);
  const globeLineMaterial = new THREE.LineBasicMaterial({ color: 0x6af0ff, transparent: true, opacity: 0.6 });
  const globe = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.62, 2)), globeLineMaterial);
  globeGroup.add(globe);
  mesh(new THREE.SphereGeometry(0.2, 12, 10), glow(0x7bf4ff, 2.2), globeGroup);
  const globeRings = [[1.2, 0.2], [0.4, 1.1]].map(([tilt, yaw]) => {
    const ring = torus(globeGroup, 0.86, 0.012, [0, 0, 0], purple, 64);
    ring.rotation.set(tilt, yaw, 0);
    return ring;
  });
  mesh(new THREE.CylinderGeometry(0.5, 0.12, 1.1, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x59e5f5, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }), telemetry, [0, 1.4, 0]);
  const dataCount = 70;
  const dataPositions = new Float32Array(dataCount * 3), dataColors = new Float32Array(dataCount * 3);
  const dataSeeds = Array.from({ length: dataCount }, () => ({ angle: random() * Math.PI * 2, radius: 0.75 + random() * 0.55, speed: 0.25 + random() * 0.35, offset: random(), lift: 1.1 + random() * 1.5 }));
  const dataGeometry = new THREE.BufferGeometry();
  dataGeometry.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3));
  dataGeometry.setAttribute('color', new THREE.BufferAttribute(dataColors, 3));
  const dataPoints = new THREE.Points(dataGeometry, new THREE.PointsMaterial({ size: 0.14, map: glowTexture, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  dataPoints.frustumCulled = false;
  telemetry.add(dataPoints);
  const padIdle = new THREE.Color(0x56e9ed), padCharged = new THREE.Color(0x4dffb0), padColor = new THREE.Color();
  function updateDeck(p) {
    const pulse = Math.sin(elapsed * 1.8);
    const charge = THREE.MathUtils.smoothstep(p, 0.01, 0.1) * (1 - 0.65 * THREE.MathUtils.smoothstep(p, 0.13, 0.22));
    const burst = Math.sin(Math.PI * THREE.MathUtils.clamp((p - 0.04) / 0.09, 0, 1)) ** 2;
    padColor.copy(padIdle).lerp(padCharged, Math.min(1, charge * 1.4));
    [padRingInner, padRingOuter].forEach((material) => { material.color.copy(padColor); material.emissive.copy(padColor); });
    padRingInner.emissiveIntensity = 2.4 + 0.8 * pulse + charge * 2.4 + burst * 7;
    padRingOuter.emissiveIntensity = 1.7 + 0.6 * Math.sin(elapsed * 1.8 + 1.2) + charge * 2 + burst * 5;
    padFill.material.color.copy(padColor);
    padFill.material.opacity = 0.16 + 0.3 * charge + 0.35 * burst;
    statusLights.forEach(({ lamp, phase }) => { lamp.material.emissiveIntensity = 0.45 + 0.9 * (0.5 + 0.5 * Math.sin(elapsed * 1.6 + phase)); });
    globeGroup.position.y = 2 + Math.sin(elapsed * 1.2) * 0.06;
    globe.rotation.y = elapsed * 0.35;
    globeRings[0].rotation.z = elapsed * 0.5;
    globeRings[1].rotation.z = -elapsed * 0.4;
    globeLineMaterial.opacity = 0.5 + 0.12 * Math.sin(elapsed * 2.1);
    dataSeeds.forEach((seed, index) => {
      const life = (elapsed * 0.12 + seed.offset) % 1;
      const angle = seed.angle + elapsed * seed.speed;
      dataPositions[index * 3] = Math.cos(angle) * seed.radius;
      dataPositions[index * 3 + 1] = 0.9 + life * seed.lift;
      dataPositions[index * 3 + 2] = Math.sin(angle) * seed.radius;
      const fade = Math.sin(life * Math.PI);
      dataColors[index * 3] = 0.35 * fade;
      dataColors[index * 3 + 1] = 0.95 * fade;
      dataColors[index * 3 + 2] = fade;
    });
    dataGeometry.attributes.position.needsUpdate = true;
    dataGeometry.attributes.color.needsUpdate = true;
  }
  function developerAstronaut() {
    const root = new THREE.Group();
    root.rotation.order = 'YXZ';
    root.position.set(0, 1.1, 3);
    root.rotation.y = -0.05;
    scene.add(root);
    const group = new THREE.Group();
    group.position.y = -1.2;
    root.add(group);
    const hoodie = matte(0x131b26, { roughness: 0.84 });
    const hoodieLight = matte(0x1b2736, { roughness: 0.86 });
    const skin = matte(0xc5a7a2, { metalness: 0, roughness: 1 });
    const strap = matte(0x0a1018, { roughness: 0.9 });
    const legs = [-1, 1].map((side) => {
      const out = side > 0 ? 0.3 : 0.25, reach = side > 0 ? -0.1 : 0;
      const leg = new THREE.Group();
      leg.position.set(side * 0.22, 1.17, 0);
      group.add(leg);
      tube(leg, [0, 0, 0], [side * (out - 0.22), -0.87, reach], 0.14, hoodie);
      box(leg, [0.32, 0.18, 0.51], [side * (out - 0.22), -1.05, reach - 0.1], dark).rotation.y = side * 0.14;
      return leg;
    });
    const body = new THREE.Group();
    body.position.set(0, 1.15, 0);
    body.rotation.set(0, 0.07, 0.025);
    group.add(body);
    box(body, [0.72, 1.12, 0.48], [0, 0.55, 0], hoodie);
    box(body, [0.78, 0.18, 0.54], [0, 0.04, 0], hoodieLight);
    box(body, [0.03, 0.9, 0.02], [0, 0.55, 0.245], strap);
    mesh(new THREE.SphereGeometry(0.36, 10, 8), hoodie, body, [0, 0.99, 0.08]);
    mesh(new THREE.TorusGeometry(0.3, 0.04, 6, 20, Math.PI), dark, body, [0, 1.1, 0.02]).rotation.x = Math.PI / 2;
    [-1, 1].forEach((side) => {
      mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 12), metal, body, [side * 0.33, 1.12, 0]).rotation.z = Math.PI / 2;
      torus(body, 0.11, 0.012, [side * 0.385, 1.12, 0], cyan, 20).rotation.y = Math.PI / 2;
    });
    const arms = [-1, 1].map((side) => {
      const arm = new THREE.Group();
      const baseZ = side < 0 ? -0.13 : 0.07, baseX = side < 0 ? 0 : 0.1;
      arm.position.set(side * 0.44, side < 0 ? 0.82 : 0.87, 0);
      arm.rotation.set(baseX, 0, baseZ);
      body.add(arm);
      mesh(new THREE.SphereGeometry(0.16, 8, 6), hoodie, arm);
      tube(arm, [0, 0, 0], [side * 0.05, -0.8, -0.02], 0.13, hoodie);
      torus(arm, 0.12, 0.03, [side * 0.05, -0.74, -0.02], dark, 10).rotation.x = Math.PI / 2;
      mesh(new THREE.SphereGeometry(0.115, 8, 6), skin, arm, [side * 0.05, -0.87, -0.02]);
      return { arm, baseX, baseZ, side };
    });
    box(body, [0.58, 0.8, 0.3], [0, 0.6, 0.36], dark);
    box(body, [0.6, 0.12, 0.33], [0, 1, 0.36], metal);
    [-1, 1].forEach((side) => {
      box(body, [0.1, 0.42, 0.2], [side * 0.34, 0.42, 0.38], dark);
      box(body, [0.08, 0.62, 0.05], [side * 0.24, 0.82, 0.265], strap);
    });
    const emblemMaterial = glow(0x56e9ed, 2);
    const emblem = new THREE.Group();
    emblem.position.set(0, 0.62, 0.525);
    body.add(emblem);
    torus(emblem, 0.14, 0.014, [0, 0, 0], emblemMaterial, 6).rotation.z = Math.PI / 6;
    torus(emblem, 0.08, 0.01, [0, 0, 0.002], emblemMaterial, 6);
    torus(emblem, 0.045, 0.01, [0, 0, 0.004], emblemMaterial, 3);
    mesh(new THREE.SphereGeometry(0.022, 8, 6), emblemMaterial, emblem, [0, 0, 0.008]);
    const bellMetal = matte(0x96aeb8, { metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide });
    const lipGlow = glow(0x56e9ed, 2.6);
    const nozzleMouths = [-1, 1].map((side) => {
      const exhaust = vector(side * 0.14, -0.78, 0.62).normalize();
      const nozzle = new THREE.Group();
      nozzle.position.set(side * 0.17, 0.2, 0.47);
      nozzle.quaternion.setFromUnitVectors(vector(0, -1, 0), exhaust);
      body.add(nozzle);
      mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 10), metal, nozzle, [0, 0.06, 0]);
      mesh(new THREE.CylinderGeometry(0.07, 0.118, 0.3, 12, 1, true), bellMetal, nozzle, [0, -0.12, 0]);
      torus(nozzle, 0.12, 0.016, [0, -0.27, 0], lipGlow, 16).rotation.x = Math.PI / 2;
      box(body, [0.08, 0.14, 0.12], [side * 0.17, 0.26, 0.42], dark);
      return { exhaust, position: nozzle.position.clone().addScaledVector(exhaust, 0.3) };
    });
    const head = new THREE.Group();
    head.position.set(0, 1.22, 0);
    body.add(head);
    mesh(new THREE.SphereGeometry(0.3, 10, 8), skin, head, [0, 0.15, 0]);
    mesh(new THREE.SphereGeometry(0.325, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), hoodie, head, [0, 0.2, 0]);
    box(head, [0.61, 0.07, 0.35], [0, 0.22, -0.24], dark);
    box(head, [0.2, 0.06, 0.04], [0, 0.18, 0.325], strap);
    mesh(new THREE.SphereGeometry(0.04, 6, 5), dark, head, [0, 0.53, 0]);
    [-1, 1].forEach((side) => { torus(head, 0.115, 0.016, [side * 0.14, 0.16, -0.26], silver, 16).scale.y = 0.8; });
    const fades = [], clones = new Map();
    group.traverse((object) => {
      if (!object.isMesh) return;
      let clone = clones.get(object.material);
      if (!clone) {
        clone = object.material.clone();
        clones.set(object.material, clone);
        fades.push({ material: clone, opacity: clone.opacity, transparent: clone.transparent, depthWrite: clone.depthWrite });
      }
      object.material = clone;
    });
    const jetHot = new THREE.Color(0xfff3c4).multiplyScalar(0.9), jetGold = new THREE.Color(0xffc247).multiplyScalar(0.8), jetCyan = new THREE.Color(0x28c9ff).multiplyScalar(0.75);
    const jets = nozzleMouths.map(({ exhaust, position }) => {
      const flame = new THREE.Group();
      flame.position.copy(position);
      flame.quaternion.setFromUnitVectors(vector(0, 0, -1), exhaust);
      flame.visible = false;
      const outer = makeFlame(0.13, jetGold, jetCyan), inner = makeFlame(0.065, jetHot, jetGold);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffd98a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
      flame.add(outer, inner, halo);
      body.add(flame);
      return { flame, outer, inner, halo };
    });
    return { root, group, body, head, arms, legs, jets, fades, emblemMaterial: clones.get(emblemMaterial) };
  }
  const astronaut = developerAstronaut();
  function updateAstronaut({ flight, brake, thrust, flare, burst, fade }) {
    const { group, body, head, arms, legs, jets, emblemMaterial } = astronaut;
    const stand = 1 - flight;
    const breath = Math.sin(elapsed * 1.5) * stand;
    group.position.y = -1.2 + Math.sin(elapsed * 1.1) * 0.02 * stand;
    body.scale.set(1 + breath * 0.006, 1 + breath * 0.014, 1 + breath * 0.008);
    head.rotation.set(0.14 * stand + 0.55 * flight - 0.25 * brake + Math.sin(elapsed * 0.8) * 0.012 * stand, -0.1 * stand + Math.sin(elapsed * 0.4) * 0.04 * stand, 0.03 * stand);
    arms.forEach(({ arm, baseX, baseZ, side }, index) => {
      const idleX = baseX + Math.sin(elapsed * 0.7 + index) * 0.012, idleZ = baseZ + breath * 0.01 * (index ? 1 : -1);
      arm.rotation.x = THREE.MathUtils.lerp(idleX, -0.5 + Math.sin(elapsed * 4 + index * 2) * 0.03, flight) + 0.55 * brake;
      arm.rotation.z = THREE.MathUtils.lerp(idleZ, side * 0.2, flight) + side * 0.4 * brake;
    });
    legs.forEach((leg, index) => { leg.rotation.x = -0.32 * flight + Math.sin(elapsed * 3 + index * 1.7) * 0.05 * flight + 0.2 * brake; });
    emblemMaterial.emissiveIntensity = 1.8 + 0.7 * Math.sin(elapsed * 2.2) + 2.5 * thrust;
    const power = thrust * fade;
    const length = (0.5 + 0.3 * thrust + 0.55 * burst + 0.7 * flare) * (1 + 0.1 * Math.sin(elapsed * 55) + 0.06 * Math.sin(elapsed * 83));
    jets.forEach(({ flame, outer, inner, halo }) => {
      flame.visible = power > 0.01;
      if (!flame.visible) return;
      outer.scale.set(1 + 0.2 * flare, 1 + 0.2 * flare, length);
      inner.scale.set(1, 1, length * 0.6);
      outer.material.opacity = 0.7 * power;
      inner.material.opacity = 0.9 * power;
      halo.scale.setScalar(0.5 + 0.35 * length);
      halo.material.opacity = 0.3 * power;
    });
  }
  const hangar = new THREE.Group();
  scene.add(hangar);
  const runwayLights = [];
  box(hangar, [25, 0.55, 53], [0, -0.7, -75], dark);
  box(hangar, [10, 0.08, 60], [0, -0.37, -70], metal);
  [-1, 1].forEach((side) => {
    box(hangar, [0.06, 0.035, 59], [side * 4.9, -0.29, -70], cyan);
    box(hangar, [0.16, 0.5, 53], [side * 12, -0.2, -75], metal);
    for (let index = 0; index < 12; index += 1) runwayLights.push({ index, light: box(hangar, [0.3, 0.08, 1.2], [side * 3.8, -0.27, -46 - index * 4], glow(index % 3 ? 0x56e9ed : 0xffaa76, 0.5)) });
    for (let index = 0; index < 5; index += 1) {
      tube(hangar, [side * 12, -0.4, -56 - index * 10], [side * 12, 9, -56 - index * 10], 0.22);
      tube(hangar, [side * 12, 9, -56 - index * 10], [side * 8.5, 12, -56 - index * 10], 0.16, silver);
      box(hangar, [0.07, 4, 0.07], [side * 11.75, 3, -56 - index * 10], purple);
    }
  });
  for (let index = 0; index < 12; index += 1) runwayLights.push({ index, light: box(hangar, [0.14, 0.025, 1], [0, -0.26, -46 - index * 4], glow(0xb8f6ff, 0.4)) });
  const gridArt = document.createElement('canvas');
  gridArt.width = gridArt.height = 128;
  const gridPaint = gridArt.getContext('2d');
  gridPaint.strokeStyle = 'rgba(120,243,255,1)';
  gridPaint.lineWidth = 3;
  gridPaint.strokeRect(1.5, 1.5, 125, 125);
  const gridTexture = new THREE.CanvasTexture(gridArt);
  gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;
  gridTexture.repeat.set(9, 5);
  gridTexture.colorSpace = THREE.SRGBColorSpace;
  const archZ = -100.4;
  [-1, 1].forEach((side) => {
    box(hangar, [1.1, 10.4, 1.1], [side * 9.3, 4.8, archZ], metal);
    box(hangar, [0.12, 10, 0.12], [side * 8.65, 4.8, archZ + 0.35], cyan);
    box(hangar, [1.6, 0.3, 1.6], [side * 9.3, -0.4, archZ], silver);
    box(hangar, [1.3, 0.3, 0.5], [side * 8.5, 9.4, archZ], metal).rotation.z = side * -0.6;
  });
  box(hangar, [20.2, 1.1, 1.1], [0, 10.2, archZ], metal);
  box(hangar, [17.4, 0.1, 0.12], [0, 9.55, archZ + 0.35], cyan);
  const forceField = mesh(new THREE.PlaneGeometry(17.3, 9.6), new THREE.MeshBasicMaterial({ map: gridTexture, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }), hangar, [0, 4.8, archZ + 0.1]);

  const ship = new THREE.Group();
  ship.position.set(-2.2, 1.2, -85);
  scene.add(ship);
  mesh(new THREE.ConeGeometry(1.6, 8.5, 6), matte(0x91a3b7, { metalness: 0.78, roughness: 0.28 }), ship).rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(1, 12, 8), matte(0x19445f, { metalness: 0.85, roughness: 0.12, emissive: 0x123448, emissiveIntensity: 0.55 }), ship, [0, 0.65, 0.55]).scale.set(0.75, 0.5, 1.7);
  [-1, 1].forEach((side) => {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(side * 4.5, -2.4);
    wingShape.lineTo(side * 4.1, -4.1);
    wingShape.lineTo(0, -2.5);
    mesh(new THREE.ExtrudeGeometry(wingShape, { depth: 0.18, bevelEnabled: false }), metal, ship, [side * 0.6, 0, 1]).rotation.x = Math.PI / 2;
    tube(ship, [side * 1, 0.2, 1], [side * 4.6, 0.2, -2.8], 0.03, cyan);
    mesh(new THREE.CylinderGeometry(0.57, 0.5, 2, 10), metal, ship, [side * 1.5, 0, -2.8]).rotation.x = Math.PI / 2;
    torus(ship, 0.4, 0.08, [side * 1.5, 0, -3.85], cyan, 24);
    tube(ship, [side * 1.2, -0.6, -1.4], [side * 1.7, -1.2, -1.3], 0.07, silver);
    box(ship, [0.65, 0.08, 0.9], [side * 1.7, -1.3, -1.3], dark);
  });
  mesh(new THREE.ConeGeometry(0.7, 2.2, 3), metal, ship, [0, 1.05, -2.8]).scale.z = 0.2;
  const engineGeometry = new THREE.BufferGeometry();
  const enginePositions = new Float32Array(300);
  engineGeometry.setAttribute('position', new THREE.BufferAttribute(enginePositions, 3));
  ship.add(new THREE.Points(engineGeometry, new THREE.PointsMaterial({ color: 0x79dcff, size: 0.07, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })));
  const hologram = new THREE.Group();
  hologram.position.set(-6, 0, -80);
  scene.add(hologram);
  torus(hologram, 1.45, 0.035, [0, -0.18, 0], cyan).rotation.x = Math.PI / 2;
  const secondRing = torus(hologram, 1.7, 0.018, [0, -0.22, 0], purple);
  secondRing.rotation.x = Math.PI / 2;
  let portraitMesh;
  const portraitReady = loader.loadAsync('assets/welcome-portrait.png').then((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    portraitMesh = mesh(new THREE.PlaneGeometry(3.3, 4.42), new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, alphaTest: 0.06, depthWrite: false, side: THREE.DoubleSide }), hologram, [0, 2.08, 0]);
    portraitMesh.visible = false;
    applySceneThree();
    sceneDirty = true;
  }).catch(() => {});

  let cameraCurveT = 0;
  const positionCurve = new THREE.CatmullRomCurve3([
    vector(0, 4.6, 12.6), vector(0.4, 4.9, 8.2), vector(2, 4.3, -6), vector(3.8, 3.4, -24),
    vector(3.2, 2.8, -42), vector(1.2, 2.5, -57), vector(1.6, 2.9, -67), vector(5.2, 4.2, -73.5),
  ], false, 'catmullrom', 0.38);
  const lookCurve = new THREE.CatmullRomCurve3([
    vector(1.2, 3.8, -17), vector(2.6, 3.9, -14), vector(3.4, 3.6, -24), vector(4, 3, -40),
    vector(2.4, 2.6, -56), vector(0.4, 2.4, -72), vector(-0.8, 2, -82), vector(-1.8, 2, -84),
  ], false, 'catmullrom', 0.38);
  const lookTarget = vector(0, 0, 0);
  const aheadPoint = vector(0, 0, 0);

  const cyanPulse = new THREE.Color(0x56e9ed), magentaPulse = new THREE.Color(0xff4fd8), pulseColor = new THREE.Color();
  const dockingRings = [0.34, 0.455, 0.57].map((stop, index) => {
    const orient = new THREE.Group();
    positionCurve.getPoint(stop, orient.position);
    orient.lookAt(positionCurve.getPoint(stop + 0.02, aheadPoint));
    scene.add(orient);
    const spin = new THREE.Group();
    orient.add(spin);
    const shellMaterial = matte(0x25374a, { metalness: 0.6, roughness: 0.63, emissive: 0x56e9ed, emissiveIntensity: 0 });
    const lightMaterial = glow(0x56e9ed, 1.4);
    torus(spin, 5.6, 0.24, [0, 0, 0], shellMaterial, 6).rotation.z = Math.PI / 6;
    torus(spin, 5.27, 0.05, [0, 0, 0.12], lightMaterial, 6).rotation.z = Math.PI / 6;
    for (let segment = 0; segment < 6; segment += 1) {
      const angle = segment / 6 * Math.PI * 2;
      box(spin, [0.4, 0.7, 0.6], [Math.cos(angle) * 5.6, Math.sin(angle) * 5.6, 0], silver).rotation.z = angle;
    }
    return { spin, shellMaterial, lightMaterial, stop, index };
  });
  function updateRings(curveT) {
    dockingRings.forEach((ring) => {
      const passing = Math.exp(-(((curveT - ring.stop) / 0.045) ** 2));
      const idle = 0.5 + 0.5 * Math.sin(elapsed * 2.4 - ring.index * 1.3);
      pulseColor.copy(cyanPulse).lerp(magentaPulse, THREE.MathUtils.smoothstep(curveT, ring.stop - 0.015, ring.stop + 0.03));
      ring.lightMaterial.emissive.copy(pulseColor);
      ring.lightMaterial.emissiveIntensity = 1.2 + idle * 0.5 + passing * 3.2;
      ring.shellMaterial.emissive.copy(pulseColor);
      ring.shellMaterial.emissiveIntensity = idle * 0.12 + passing * 1.3;
      ring.spin.rotation.z = elapsed * (ring.index % 2 ? -0.07 : 0.07);
    });
  }

  const LANE_DROP = 1.25, STAND_Y = 1.1, LIFT_MAX = 0.95, SWOOP = 24;
  const ss = THREE.MathUtils.smoothstep;
  const clamp01 = (value) => THREE.MathUtils.clamp(value, 0, 1);
  const wrapAngle = (angle) => ((angle + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  function curveParam(p) {
    if (p < 0.08) return p / 0.08 * 0.012;
    if (p < 0.75) return 0.012 + (p - 0.08) / 0.67 * 0.823;
    return 0.835 + ss(p, 0.75, 0.97) * 0.165;
  }
  const pathLength = positionCurve.getLength();
  const arcTable = positionCurve.getLengths();
  const tToArc = (t) => {
    const f = clamp01(t) * (arcTable.length - 1), i = Math.min(arcTable.length - 2, Math.floor(f));
    return arcTable[i] + (arcTable[i + 1] - arcTable[i]) * (f - i);
  };
  const arcToT = (arc) => positionCurve.getUtoTmapping(clamp01(arc / pathLength));
  const deckPoint = vector(0, STAND_Y, 3);
  const pathScratch = vector(0, 0, 0), headingScratch = vector(0, 0, 0);
  let deckArc = 0, gateArc = 0;
  for (let step = 0; step <= 400; step += 1) {
    positionCurve.getPointAt(step / 400, pathScratch);
    if (!deckArc && pathScratch.z <= deckPoint.z) deckArc = step / 400 * pathLength;
    if (pathScratch.z <= 2 - railRadius) { gateArc = step / 400 * pathLength; break; }
  }
  const swoopStart = tToArc(0.714);
  const leadArc = (p) => tToArc(curveParam(Math.min(1, p + 0.04)));
  const takeoffP = 0.107;
  let mergeP = 0.3;
  for (let probe = 0.16; probe < 0.5; probe += 0.002) {
    const slope = (leadArc(probe + 0.002) - leadArc(probe - 0.002)) / 0.004;
    if (deckArc + slope * (probe - takeoffP) / 2 <= leadArc(probe)) { mergeP = probe; break; }
  }
  const rampGain = (leadArc(mergeP) - deckArc) / (mergeP - takeoffP) ** 2;
  function characterArc(p) {
    const lead = p <= mergeP ? deckArc + rampGain * Math.max(0, p - takeoffP) ** 2 : leadArc(p);
    return THREE.MathUtils.lerp(lead, swoopStart + SWOOP, ss(p, 0.6, 0.77));
  }
  const charState = { lift: 0, scale: 1, t: 0, fade: 1, portrait: 0, bank: 0, flight: 0, arc: 0 };
  const charFocus = vector(0, 0, 0);
  const swoop = { start: vector(0, 0, 0), control: vector(0, 0, 0), end: vector(0, 0, 0) };
  function lanePoint(arc, out) {
    positionCurve.getPointAt(clamp01(arc / pathLength), out);
    out.y -= LANE_DROP;
    return out;
  }
  function refreshSwoop() {
    lanePoint(swoopStart, swoop.start);
    positionCurve.getTangentAt(clamp01(swoopStart / pathLength), headingScratch);
    swoop.control.copy(swoop.start).addScaledVector(headingScratch, 11);
    swoop.control.y = swoop.start.y;
    swoop.end.set(hologram.position.x, hologram.position.y - 0.07 + 1.17 * charState.scale, hologram.position.z);
  }
  function pathPoint(S, out, lift = charState.lift) {
    if (S <= swoopStart) {
      const arc = Math.max(S, deckArc);
      lanePoint(arc, out);
      const wx = ss(arc, deckArc, deckArc + 14), wy = ss(arc, deckArc + 2, deckArc + 30);
      out.x = THREE.MathUtils.lerp(deckPoint.x, out.x, wx);
      out.z = THREE.MathUtils.lerp(deckPoint.z, out.z, wx);
      out.y = THREE.MathUtils.lerp(deckPoint.y + lift, out.y, wy);
      return out;
    }
    const u = clamp01((S - swoopStart) / SWOOP), k = 1 - u;
    out.x = k * k * swoop.start.x + 2 * k * u * swoop.control.x + u * u * swoop.end.x;
    out.z = k * k * swoop.start.z + 2 * k * u * swoop.control.z + u * u * swoop.end.z;
    out.y = THREE.MathUtils.lerp(swoop.start.y, swoop.end.y, ss(u, 0, 1));
    return out;
  }
  function headingAt(S) {
    if (S <= swoopStart) positionCurve.getTangentAt(clamp01(Math.max(S, deckArc) / pathLength), headingScratch);
    else {
      const u = clamp01((S - swoopStart) / SWOOP), k = 1 - u;
      headingScratch.set(
        2 * k * (swoop.control.x - swoop.start.x) + 2 * u * (swoop.end.x - swoop.control.x), 0,
        2 * k * (swoop.control.z - swoop.start.z) + 2 * u * (swoop.end.z - swoop.control.z),
      );
    }
    return Math.atan2(-headingScratch.x, -headingScratch.z);
  }

  const RIBBON_POINTS = 30, RIBBON_STEP = 0.34, SPARKS = 26;
  const ribbonGold = new THREE.Color(0xffd36a), ribbonCyan = new THREE.Color(0x35d4ff), ribbonColor = new THREE.Color();
  const ribbons = [0, 1].map(() => {
    const positions = new Float32Array(RIBBON_POINTS * 6), colors = new Float32Array(RIBBON_POINTS * 6), centers = new Float32Array(RIBBON_POINTS * 3), indices = [];
    for (let index = 0; index < RIBBON_POINTS - 1; index += 1) indices.push(index * 2, index * 2 + 1, index * 2 + 2, index * 2 + 1, index * 2 + 3, index * 2 + 2);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    const ribbon = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
    ribbon.frustumCulled = false;
    ribbon.visible = false;
    scene.add(ribbon);
    return { ribbon, positions, colors, centers, geometry };
  });
  const sparkPositions = new Float32Array(SPARKS * 6), sparkColors = new Float32Array(SPARKS * 6);
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
  const sparks = new THREE.Points(sparkGeometry, new THREE.PointsMaterial({ size: 0.16, map: glowTexture, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sparks.frustumCulled = false;
  sparks.visible = false;
  scene.add(sparks);
  const nozzleWorld = vector(0, 0, 0), pointA = vector(0, 0, 0), pointB = vector(0, 0, 0), sideVector = vector(0, 0, 0), viewVector = vector(0, 0, 0), offsetVector = vector(0, 0, 0);
  function updateRibbons(S, power, flare) {
    const show = power > 0.02;
    ribbons.forEach(({ ribbon }) => { ribbon.visible = show; });
    sparks.visible = show;
    if (!show) return;
    const { root, jets } = astronaut;
    root.updateMatrixWorld(true);
    jets.forEach((jet, side) => {
      const { positions, colors, centers, geometry } = ribbons[side];
      jet.flame.getWorldPosition(nozzleWorld);
      offsetVector.copy(nozzleWorld).sub(root.position);
      for (let k = 0; k < RIBBON_POINTS; k += 1) {
        pathPoint(S - k * RIBBON_STEP, pointB);
        centers[k * 3] = pointB.x + offsetVector.x;
        centers[k * 3 + 1] = pointB.y + offsetVector.y;
        centers[k * 3 + 2] = pointB.z + offsetVector.z;
      }
      for (let k = 0; k < RIBBON_POINTS; k += 1) {
        const before = Math.max(0, k - 1) * 3, after = Math.min(RIBBON_POINTS - 1, k + 1) * 3;
        sideVector.set(centers[after] - centers[before], centers[after + 1] - centers[before + 1], centers[after + 2] - centers[before + 2]);
        viewVector.set(camera.position.x - centers[k * 3], camera.position.y - centers[k * 3 + 1], camera.position.z - centers[k * 3 + 2]);
        sideVector.cross(viewVector);
        if (sideVector.lengthSq() < 1e-8) sideVector.set(1, 0, 0);
        sideVector.normalize();
        const along = k / (RIBBON_POINTS - 1);
        const half = ((0.06 + 0.04 * flare) * (1 - along) ** 0.7 + 0.006) / 2;
        for (let edge = 0; edge < 2; edge += 1) {
          const sign = edge ? 1 : -1, at = (k * 2 + edge) * 3;
          positions[at] = centers[k * 3] + sideVector.x * half * sign;
          positions[at + 1] = centers[k * 3 + 1] + sideVector.y * half * sign;
          positions[at + 2] = centers[k * 3 + 2] + sideVector.z * half * sign;
          ribbonColor.copy(ribbonGold).lerp(ribbonCyan, Math.min(1, along * 2.2)).multiplyScalar((1 - along) ** 1.5 * power * 0.65);
          ribbonColor.toArray(colors, at);
        }
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      for (let spark = 0; spark < SPARKS; spark += 1) {
        const slot = (spark / SPARKS + elapsed * 1.3) % 1, k = Math.floor(slot * (RIBBON_POINTS - 1)), at = (side * SPARKS + spark) * 3;
        const jitter = 0.14 * slot, angle = spark * 2.399 + elapsed * 2;
        sparkPositions[at] = centers[k * 3] + Math.cos(angle) * jitter;
        sparkPositions[at + 1] = centers[k * 3 + 1] + Math.sin(angle * 1.3) * jitter;
        sparkPositions[at + 2] = centers[k * 3 + 2] + Math.sin(angle) * jitter;
        ribbonColor.copy(ribbonGold).lerp(ribbonCyan, slot).multiplyScalar((1 - slot) * power);
        ribbonColor.toArray(sparkColors, at);
      }
    });
    sparkGeometry.attributes.position.needsUpdate = true;
    sparkGeometry.attributes.color.needsUpdate = true;
  }

  const guideArt = document.createElement('canvas');
  guideArt.width = 128;
  guideArt.height = 16;
  const guidePaint = guideArt.getContext('2d');
  guidePaint.shadowColor = 'rgba(120,243,255,1)';
  guidePaint.shadowBlur = 6;
  guidePaint.fillStyle = 'rgba(180,250,255,1)';
  guidePaint.fillRect(10, 5, 70, 6);
  const guideTexture = new THREE.CanvasTexture(guideArt);
  guideTexture.wrapS = THREE.RepeatWrapping;
  guideTexture.colorSpace = THREE.SRGBColorSpace;
  const guideMaterial = new THREE.MeshBasicMaterial({ map: guideTexture, vertexColors: true, color: 0x7ff3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false });
  const guide = new THREE.Mesh(new THREE.BufferGeometry(), guideMaterial);
  guide.frustumCulled = false;
  guide.visible = false;
  scene.add(guide);
  function buildGuide() {
    refreshSwoop();
    const samples = [];
    const end = swoopStart + SWOOP * 0.985;
    for (let S = gateArc; S <= end; S += 0.7) samples.push(pathPoint(S, vector(0, 0, 0), LIFT_MAX));
    const positions = new Float32Array(samples.length * 6), colors = new Float32Array(samples.length * 6), uvs = new Float32Array(samples.length * 4), indices = [];
    let travelled = 0;
    samples.forEach((point, index) => {
      const next = samples[Math.min(samples.length - 1, index + 1)], previous = samples[Math.max(0, index - 1)];
      sideVector.set(next.x - previous.x, 0, next.z - previous.z).normalize();
      sideVector.set(-sideVector.z, 0, sideVector.x);
      if (index) travelled += point.distanceTo(samples[index - 1]);
      const fadeIn = ss(index, 0, 8), fadeOut = 1 - ss(index, samples.length - 10, samples.length - 1);
      for (let edge = 0; edge < 2; edge += 1) {
        const sign = edge ? 1 : -1, at = (index * 2 + edge) * 3;
        positions[at] = point.x + sideVector.x * 0.2 * sign;
        positions[at + 1] = point.y - 0.95;
        positions[at + 2] = point.z + sideVector.z * 0.2 * sign;
        colors[at] = colors[at + 1] = colors[at + 2] = fadeIn * fadeOut;
        uvs[(index * 2 + edge) * 2] = travelled / 1.4;
        uvs[(index * 2 + edge) * 2 + 1] = edge;
      }
      if (index < samples.length - 1) indices.push(index * 2, index * 2 + 1, index * 2 + 2, index * 2 + 1, index * 2 + 3, index * 2 + 2);
    });
    guide.geometry.dispose();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    guide.geometry = geometry;
  }
  buildGuide();

  let lastCharFade = -1;
  function setCharFade(amount) {
    const fading = amount < 0.999;
    astronaut.fades.forEach((entry) => {
      const transparent = fading || entry.transparent;
      if (entry.material.transparent !== transparent) { entry.material.transparent = transparent; entry.material.needsUpdate = true; }
      entry.material.opacity = entry.opacity * amount;
      entry.material.depthWrite = fading ? false : entry.depthWrite;
    });
  }
  function updateCharacter(p) {
    const flightIn = ss(p, 0.085, 0.14), landing = ss(p, 0.7, 0.76);
    const flight = flightIn * (1 - landing);
    const brake = Math.sin(Math.PI * clamp01((p - 0.68) / 0.1));
    const thrust = ss(p, 0.08, 0.1) * (1 - ss(p, 0.755, 0.79));
    const flare = Math.sin(Math.PI * clamp01((p - 0.69) / 0.1)) ** 1.5;
    const burst = Math.sin(Math.PI * clamp01((p - 0.08) / 0.07));
    charState.lift = LIFT_MAX * ss(p, 0.08, 0.125);
    charState.scale = THREE.MathUtils.lerp(1, 1.4, ss(p, 0.735, 0.78));
    charState.fade = 1 - ss(p, 0.745, 0.785);
    charState.portrait = 1 - charState.fade;
    charState.flight = flight;
    const S = characterArc(p);
    charState.arc = S;
    refreshSwoop();
    const { root } = astronaut;
    pathPoint(S, root.position);
    pathPoint(S + 0.6, pointA);
    pathPoint(S - 0.6, pointB);
    const run = Math.hypot(pointA.x - pointB.x, pointA.z - pointB.z);
    const slope = Math.atan2(pointA.y - pointB.y, Math.max(run, 0.001));
    const turn = wrapAngle(headingAt(S + 1.4) - headingAt(S - 1.4)) / 2.8;
    charState.bank += (THREE.MathUtils.clamp(turn * 9, -0.5, 0.5) * flight - charState.bank) * 0.18;
    const toCamera = Math.atan2(-(camera.position.x - root.position.x), -(camera.position.z - root.position.z));
    const yawFlight = headingAt(S) + wrapAngle(toCamera - headingAt(S)) * ss(p, 0.71, 0.77);
    const yaw = -0.05 + wrapAngle(yawFlight + 0.05) * flightIn;
    root.rotation.set(-0.61 * flight + 0.5 * slope * flight + 0.28 * brake, yaw, charState.bank);
    root.position.y += Math.sin(elapsed * 2.2) * 0.04 * flight;
    root.scale.setScalar(charState.scale);
    root.visible = charState.fade > 0.004;
    if (Math.abs(charState.fade - lastCharFade) > 0.002) { setCharFade(charState.fade); lastCharFade = charState.fade; }
    updateAstronaut({ flight, brake, thrust, flare, burst, fade: charState.fade });
    updateRibbons(S, thrust * charState.fade, flare);
    charFocus.copy(root.position);
    charState.t = arcToT(Math.min(S, pathLength));
    guideMaterial.opacity = 0.7 * ss(p, 0.02, 0.1) * (1 - ss(p, 0.74, 0.79));
    guide.visible = guideMaterial.opacity > 0.01;
    guideTexture.offset.x = -(elapsed * 0.45) % 1;
  }

  const fadeMaterials = [], fadeKnown = new Set(), fadeClones = new Map();
  let sceneThreeAmount = 0;
  function registerFade(root) {
    root.traverse((object) => {
      if (!object.material || fadeKnown.has(object.material)) return;
      let clone = fadeClones.get(object.material);
      if (!clone) {
        clone = object.material.clone();
        fadeClones.set(object.material, clone);
        fadeKnown.add(clone);
        fadeMaterials.push({ material: clone, opacity: clone.opacity, transparent: clone.transparent, depthWrite: clone.depthWrite });
      }
      object.material = clone;
    });
  }
  function applySceneThree() {
    const fading = sceneThreeAmount < 0.999;
    [hangar, ship, hologram].forEach((group) => { group.visible = sceneThreeAmount > 0.002; });
    fadeMaterials.forEach((entry) => {
      const transparent = fading || entry.transparent;
      if (entry.material.transparent !== transparent) { entry.material.transparent = transparent; entry.material.needsUpdate = true; }
      entry.material.opacity = entry.opacity * sceneThreeAmount;
      entry.material.depthWrite = fading ? false : entry.depthWrite;
    });
  }
  function setSceneThree(amount) {
    if (amount === sceneThreeAmount) return;
    sceneThreeAmount = amount;
    applySceneThree();
  }
  [hangar, ship, hologram].forEach(registerFade);
  applySceneThree();
  const forceEntry = fadeMaterials.find((entry) => entry.material === forceField.material);
  let forceGate = 1;
  function updateForceField(amount) {
    const gate = 1 - THREE.MathUtils.smoothstep(amount, 0.4, 0.6);
    if (gate === forceGate) return;
    forceGate = gate;
    forceEntry.opacity = 0.15 * gate;
    forceEntry.material.opacity = forceEntry.opacity * sceneThreeAmount;
    forceField.visible = gate > 0.003;
    forceField.scale.set(1 + 0.14 * (1 - gate), 1 + 0.06 * (1 - gate), 1);
  }

  const launch = { amount: 0, run: 0, thrust: 0, warp: 0, travel: 0, surge: 0, homeX: -2.2 };
  const shipFocus = vector(0, 0, 0);
  const thrusterLight = new THREE.PointLight(0x4dffc4, 0, 46, 2);
  scene.add(thrusterLight);
  const archPulse = new THREE.Mesh(new THREE.PlaneGeometry(17.3, 9.6), new THREE.MeshBasicMaterial({ map: gridTexture, color: 0x8ffaff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }));
  archPulse.position.set(0, 4.8, archZ + 0.2);
  archPulse.visible = false;
  scene.add(archPulse);
  const flameHot = new THREE.Color(0xeafff7).multiplyScalar(1.4), flameMid = new THREE.Color(0x3dffc0).multiplyScalar(1.1), flameCold = new THREE.Color(0x1fb8ff).multiplyScalar(0.8);
  function makeFlame(radius, hot, cold) {
    const geometry = new THREE.ConeGeometry(radius, 1, 18, 4, true);
    geometry.translate(0, 0.5, 0);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position, colors = new Float32Array(positions.count * 3), tint = new THREE.Color();
    for (let index = 0; index < positions.count; index += 1) {
      const along = -positions.getZ(index);
      tint.copy(hot).lerp(cold, along).multiplyScalar((1 - along) ** 1.4).toArray(colors, index * 3);
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
  }
  const flames = [-1, 1].map((side) => {
    const group = new THREE.Group();
    group.position.set(side * 1.5, 0, -3.95);
    group.visible = false;
    const outer = makeFlame(0.42, flameMid, flameCold), inner = makeFlame(0.2, flameHot, flameMid);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x57ffd2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
    group.add(outer, inner, halo);
    ship.add(group);
    return { group, outer, inner, halo };
  });
  function shipPath(amount, homeX, out) {
    const run = THREE.MathUtils.clamp((amount - 0.22) / 0.78, 0, 1);
    const toCenter = THREE.MathUtils.smoothstep(run, 0, 0.34);
    const climb = THREE.MathUtils.smoothstep(run, 0.4, 1);
    return out.set(homeX * (1 - toCenter), 1.2 + 0.45 * THREE.MathUtils.smoothstep(amount, 0.04, 0.22) + 34 * climb ** 1.5, -85 - 255 * run ** 2.6);
  }
  function updateLaunch(progress) {
    const amount = motion.matches ? 0 : THREE.MathUtils.clamp((progress - 0.85) / 0.15, 0, 1);
    const turn = THREE.MathUtils.smoothstep(amount, 0, 0.18);
    const run = THREE.MathUtils.clamp((amount - 0.22) / 0.78, 0, 1);
    const thrust = THREE.MathUtils.smoothstep(amount, 0.14, 0.26) * (0.5 + 0.5 * THREE.MathUtils.smoothstep(amount, 0.24, 0.6));
    const toCenter = THREE.MathUtils.smoothstep(run, 0, 0.34);
    const climb = THREE.MathUtils.smoothstep(run, 0.4, 1);
    const travel = 255 * run ** 2.6;
    Object.assign(launch, { amount, run, thrust, travel, warp: THREE.MathUtils.smoothstep(amount, 0.3, 0.75) });
    const homeX = shell.clientWidth < 760 ? -0.8 : -2.2;
    launch.homeX = homeX;
    launch.surge = 78 * THREE.MathUtils.smoothstep(amount, 0.42, 1);
    moon.position.x = -10 - 22 * THREE.MathUtils.smoothstep(amount, 0.4, 0.75);
    shipPath(amount, homeX, ship.position);
    ship.rotation.set(0.16 * climb, Math.PI * turn, 0.2 * Math.sin(Math.PI * toCenter));
    const flicker = 1 + 0.12 * Math.sin(elapsed * 61) + 0.08 * Math.sin(elapsed * 97 + 1.3);
    const length = (0.4 + 6.2 * thrust ** 1.3) * flicker;
    flames.forEach(({ group, outer, inner, halo }) => {
      group.visible = thrust > 0.003;
      if (!group.visible) return;
      outer.scale.set(1 + 0.2 * thrust, 1 + 0.2 * thrust, length);
      inner.scale.set(1, 1, length * 0.62);
      outer.material.opacity = thrust * 0.42;
      inner.material.opacity = thrust * 0.6;
      halo.scale.setScalar((0.7 + 1.1 * thrust) * flicker);
      halo.material.opacity = thrust * 0.4;
    });
    ship.updateMatrixWorld();
    thrusterLight.position.set(0, -0.6, -11);
    ship.localToWorld(thrusterLight.position);
    thrusterLight.intensity = thrust * 120 * flicker;
    const crossing = Math.exp(-(((travel - 14) / 9) ** 2));
    archPulse.visible = crossing > 0.01;
    archPulse.material.opacity = 0.9 * crossing;
    updateForceField(amount);
  }

  const warpRange = 280;
  let warpSeed = 9;
  const warpRandom = () => { warpSeed = (warpSeed * 1664525 + 1013904223) >>> 0; return warpSeed / 4294967296; };
  const warpSeeds = [];
  const warpCyan = new THREE.Color(0x7de9f5).multiplyScalar(1.1), warpEmerald = new THREE.Color(0x34d399).multiplyScalar(1.3);
  for (let index = 0; index < 2200; index += 1) {
    if (starPositions[index * 3 + 2] > -90) continue;
    const pick = Math.abs(Math.sin(index * 91.345) * 43758.5453) % 1;
    const tinted = pick < 0.3 ? (pick < 0.15 ? warpCyan : warpEmerald) : null;
    warpSeeds.push({ x: starPositions[index * 3], y: starPositions[index * 3 + 1], d: (-90 - starPositions[index * 3 + 2]) * (warpRange / 220), r: tinted ? tinted.r : starColors[index * 3], g: tinted ? tinted.g : starColors[index * 3 + 1], b: tinted ? tinted.b : starColors[index * 3 + 2] });
  }
  for (let index = 0; index < 450; index += 1) {
    const angle = warpRandom() * Math.PI * 2, radius = 9 + warpRandom() ** 1.7 * 120;
    const tint = new THREE.Color().setHSL(0.46 + warpRandom() * 0.14, 0.55, 0.78);
    warpSeeds.push({ x: Math.cos(angle) * radius, y: 6 + Math.sin(angle) * radius * 0.62, d: warpRandom() * warpRange, r: tint.r, g: tint.g, b: tint.b });
  }
  const warpPositions = new Float32Array(warpSeeds.length * 6), warpColors = new Float32Array(warpSeeds.length * 6);
  const warpGeometry = new THREE.BufferGeometry();
  warpGeometry.setAttribute('position', new THREE.BufferAttribute(warpPositions, 3));
  warpGeometry.setAttribute('color', new THREE.BufferAttribute(warpColors, 3));
  const warpMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
  const warpLines = new THREE.LineSegments(warpGeometry, warpMaterial);
  warpLines.frustumCulled = false;
  warpLines.visible = false;
  scene.add(warpLines);
  function updateWarp() {
    const warp = launch.warp;
    stars.material.opacity = 0.95 * (1 - 0.65 * warp);
    warpLines.visible = warp > 0.002;
    if (!warpLines.visible) return;
    warpMaterial.opacity = Math.min(1, warp * 1.5);
    const bridge = THREE.MathUtils.smoothstep(launch.amount, 0.6, 1);
    warpMaterial.color.setRGB(1 - 0.3 * bridge, 1, 1 - 0.12 * bridge);
    const nearZ = camera.position.z - 5, flow = launch.run ** 2 * 1500;
    warpSeeds.forEach((seed, index) => {
      const d = (((seed.d - flow) % warpRange) + warpRange) % warpRange;
      const length = warp * (8 + d * 0.36);
      const bright = THREE.MathUtils.smoothstep(d, 0, 30) * (1 - THREE.MathUtils.smoothstep(d, warpRange - 70, warpRange)) * 1.8;
      const at = index * 6;
      warpPositions[at] = warpPositions[at + 3] = seed.x;
      warpPositions[at + 1] = warpPositions[at + 4] = seed.y;
      warpPositions[at + 2] = nearZ - d;
      warpPositions[at + 5] = nearZ - d - length;
      warpColors[at] = seed.r * bright;
      warpColors[at + 1] = seed.g * bright;
      warpColors[at + 2] = seed.b * bright;
    });
    warpGeometry.attributes.position.needsUpdate = true;
    warpGeometry.attributes.color.needsUpdate = true;
  }

  const plasmaCyan = 0x56e9ed, plasmaEmerald = 0x34d399;
  const afterburner = new THREE.Group();
  afterburner.visible = false;
  scene.add(afterburner);
  const plasma = [[plasmaEmerald, 0.34, 0.55], [plasmaCyan, 0.17, 0.85], [0xeafff7, 0.065, 1]].map(([color, size, peak]) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false, toneMapped: false }));
    afterburner.add(sprite);
    return { sprite, size, peak };
  });
  const shockwaves = [[plasmaCyan, 0.93], [plasmaEmerald, 0.87]].map(([color, inner]) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(inner, 1, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
    ring.visible = false;
    afterburner.add(ring);
    return ring;
  });
  const ribbonCount = 160, ribbonSpan = 0.2;
  const ribbonPositions = new Float32Array(ribbonCount * 3), ribbonColors = new Float32Array(ribbonCount * 3);
  const ribbonGeometry = new THREE.BufferGeometry();
  ribbonGeometry.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3));
  ribbonGeometry.setAttribute('color', new THREE.BufferAttribute(ribbonColors, 3));
  const ribbon = new THREE.Points(ribbonGeometry, new THREE.PointsMaterial({ size: 9, sizeAttenuation: false, map: glowTexture, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
  ribbon.frustumCulled = false;
  ribbon.visible = false;
  scene.add(ribbon);
  const ribbonSeeds = Array.from({ length: ribbonCount }, (_, index) => ({ side: index % 2 ? 1 : -1, age: Math.floor(index / 2) / (ribbonCount / 2 - 1), jx: Math.sin(index * 12.9898), jy: Math.cos(index * 78.233) }));
  const ribbonHot = new THREE.Color(0xeafff7), ribbonMid = new THREE.Color(plasmaCyan), ribbonEnd = new THREE.Color(plasmaEmerald), ribbonTint = new THREE.Color();
  const tailPoint = vector(0, 0, 0), anchorPoint = vector(0, 0, 0), pathSample = vector(0, 0, 0), spinAxis = vector(0, 0, 1), spinQuat = new THREE.Quaternion();
  function updateAfterburner() {
    const amount = launch.amount;
    const on = amount > 0.28;
    afterburner.visible = ribbon.visible = on;
    if (!on) return;
    ship.localToWorld(tailPoint.set(0, 0, -5.2));
    const merge = THREE.MathUtils.smoothstep(amount, 0.55, 0.95) * 0.85;
    anchorPoint.set(THREE.MathUtils.lerp(tailPoint.x, camera.position.x, merge), THREE.MathUtils.lerp(tailPoint.y, camera.position.y, merge), tailPoint.z);
    afterburner.position.copy(anchorPoint);
    const intensity = THREE.MathUtils.smoothstep(amount, 0.28, 0.5);
    const distance = camera.position.distanceTo(anchorPoint);
    const grow = 0.6 + 0.4 * THREE.MathUtils.smoothstep(amount, 0.4, 0.8);
    plasma.forEach(({ sprite, size, peak }, index) => {
      const flutter = 1 + 0.07 * Math.sin(elapsed * (23 + index * 9)) + 0.04 * Math.sin(elapsed * (41 + index * 7) + index);
      sprite.scale.setScalar(distance * size * grow * flutter);
      sprite.material.opacity = peak * intensity * Math.min(1, 0.85 + 0.15 * flutter);
    });
    shockwaves.forEach((ring, index) => {
      let phase = THREE.MathUtils.clamp((amount - (0.5 + index * 0.08)) / 0.24, 0, 1), gain = 1;
      if (phase >= 1) { phase = motion.matches ? 1 : (elapsed * 0.42 + index * 0.5) % 1; gain = 0.55 * THREE.MathUtils.smoothstep(amount, 0.8, 0.9); }
      ring.visible = phase > 0 && phase < 1 && gain > 0.002;
      if (!ring.visible) return;
      ring.scale.setScalar(distance * (0.03 + 0.5 * (1 - (1 - phase) ** 3)));
      ring.material.opacity = 0.85 * gain * (1 - phase) ** 1.6 * THREE.MathUtils.smoothstep(phase, 0, 0.05);
      spinQuat.setFromAxisAngle(spinAxis, index * 0.52 + phase * 0.5);
      ring.quaternion.copy(camera.quaternion).multiply(spinQuat);
    });
    const homeX = launch.homeX;
    for (let index = 0; index < ribbonCount; index += 1) {
      const seed = ribbonSeeds[index];
      const at = amount - seed.age * ribbonSpan;
      shipPath(Math.max(at, 0.22), homeX, pathSample);
      const spread = 0.05 + seed.age * 0.45, fall = 1 - seed.age;
      const lateral = seed.side * 1.5 * (1 - seed.age * 0.75) + seed.jx * spread;
      ribbonPositions[index * 3] = pathSample.x + (tailPoint.x - ship.position.x) + lateral + (anchorPoint.x - tailPoint.x) * fall;
      ribbonPositions[index * 3 + 1] = pathSample.y + (tailPoint.y - ship.position.y) + seed.jy * spread * 0.6 + (anchorPoint.y - tailPoint.y) * fall;
      ribbonPositions[index * 3 + 2] = pathSample.z + (tailPoint.z - ship.position.z);
      ribbonTint.copy(ribbonHot).lerp(ribbonMid, THREE.MathUtils.smoothstep(seed.age, 0, 0.3)).lerp(ribbonEnd, THREE.MathUtils.smoothstep(seed.age, 0.25, 1));
      const fade = fall ** 1.3 * THREE.MathUtils.smoothstep(at, 0.24, 0.32) * intensity * 1.1;
      ribbonColors[index * 3] = ribbonTint.r * fade;
      ribbonColors[index * 3 + 1] = ribbonTint.g * fade;
      ribbonColors[index * 3 + 2] = ribbonTint.b * fade;
    }
    ribbonGeometry.attributes.position.needsUpdate = true;
    ribbonGeometry.attributes.color.needsUpdate = true;
  }

  let runwayPhase = 0;
  function updateRunway(delta) {
    if (sceneThreeAmount <= 0.002) return;
    if (!motion.matches) runwayPhase += delta * 8 * (1 + 3.5 * launch.thrust);
    const head = runwayPhase % 18, boost = 1 + launch.thrust;
    runwayLights.forEach(({ index, light }) => {
      const behind = head - index;
      const pulse = behind >= 0 && behind < 5 ? (1 - behind / 5) ** 1.5 : 0;
      light.material.emissiveIntensity = 0.45 + pulse * 4.2 * boost;
    });
    gridTexture.offset.y = (elapsed * 0.05) % 1;
  }

  const burstColors = [new THREE.Color(0x6ff4ff), new THREE.Color(0xffa05a)];
  const crystalGeometry = new THREE.OctahedronGeometry(0.2, 0);
  const shockGeometry = new THREE.RingGeometry(0.965, 1, 64);
  const additive = (color) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide });
  const meteors = [];
  const spot = vector(0, 0, 0);
  let blastOwner = null;
  function pickMeteorSpot(meteor, along) {
    const t = THREE.MathUtils.lerp(0.32, 0.56, along);
    positionCurve.getPoint(t, spot);
    const angle = random() * Math.PI * 2, radius = 9 + random() * 8;
    meteor.base.set(spot.x + Math.cos(angle) * radius, spot.y + Math.sin(angle) * radius * 0.75, spot.z);
    meteor.size = 1.1 + random() * 1.1;
  }
  for (let index = 0; index < 5; index += 1) {
    const geometry = new THREE.DodecahedronGeometry(1, 0);
    const positions = geometry.attributes.position;
    for (let v = 0; v < positions.count; v += 1) {
      const x = positions.getX(v), y = positions.getY(v), z = positions.getZ(v);
      const noise = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + index) * 43758.5453;
      const scale = 0.8 + (noise - Math.floor(noise)) * 0.45;
      positions.setXYZ(v, x * scale, y * scale * 0.9, z * scale);
    }
    geometry.computeBoundingSphere();
    const material = new THREE.MeshStandardMaterial({ color: 0x5b4f58, roughness: 0.9, metalness: 0.15, flatShading: true, emissive: 0x2a0e05, emissiveIntensity: 0.5 });
    const rock = new THREE.Mesh(geometry, material);
    scene.add(rock);
    const hitbox = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hitbox.scale.setScalar(2.1);
    rock.add(hitbox);
    const burst = new THREE.Group();
    burst.visible = false;
    scene.add(burst);
    const fragmentMaterials = burstColors.map((color) => additive(color));
    const fragments = Array.from({ length: 14 }, (_, fragmentIndex) => {
      const fragment = new THREE.Mesh(crystalGeometry, fragmentMaterials[fragmentIndex % 2]);
      fragment.userData = { velocity: vector(0, 0, 0), spin: vector(0, 0, 0), size: 1 };
      burst.add(fragment);
      return fragment;
    });
    const shockMaterial = additive(burstColors[0]);
    const shock = new THREE.Mesh(shockGeometry, shockMaterial);
    shock.visible = false;
    scene.add(shock);
    const meteor = { rock, material, hitbox, burst, fragments, fragmentMaterials, shock, shockMaterial, base: vector(0, 0, 0), size: 1, phase: random() * 6.28, spin: vector(random() * 0.5, random() * 0.5, random() * 0.3), state: 'drift', time: 0, wait: 0 };
    hitbox.userData.meteor = meteor;
    pickMeteorSpot(meteor, (index + 0.5) / 5);
    rock.position.copy(meteor.base);
    rock.scale.setScalar(meteor.size);
    meteors.push(meteor);
  }
  function blastMeteor(meteor) {
    if (meteor.state !== 'drift' && meteor.state !== 'grow') return;
    meteor.state = 'flash';
    meteor.time = 0;
  }
  function startBurst(meteor) {
    meteor.rock.visible = false;
    meteor.burst.position.copy(meteor.rock.position);
    meteor.burst.visible = true;
    meteor.fragments.forEach((fragment) => {
      fragment.position.set(0, 0, 0);
      fragment.rotation.set(random() * 3, random() * 3, random() * 3);
      fragment.userData.velocity.set(random() - 0.5, random() - 0.5, random() - 0.5).normalize().multiplyScalar(4 + random() * 6);
      fragment.userData.spin.set(random() * 8, random() * 8, random() * 8);
      fragment.userData.size = meteor.size * (0.9 + random() * 1.1);
    });
    meteor.shock.visible = true;
    meteor.shock.position.copy(meteor.rock.position);
    meteor.shockMaterial.opacity = 0.4;
    blastLight.position.copy(meteor.rock.position);
    blastOwner = meteor;
    meteor.state = 'burst';
    meteor.time = 0;
  }
  let blastTimer = 4.5;
  const ndc = new THREE.Vector2();
  function updateMeteors(delta) {
    if (motion.matches) return;
    blastTimer -= delta;
    if (blastTimer <= 0) {
      const inView = meteors.filter((meteor) => {
        if (meteor.state !== 'drift') return false;
        spot.copy(meteor.rock.position).project(camera);
        return Math.abs(spot.x) < 0.9 && Math.abs(spot.y) < 0.85 && spot.z < 1;
      });
      if (inView.length) { blastMeteor(inView[Math.floor(random() * inView.length)]); blastTimer = 6 + random() * 3.5; }
      else blastTimer = 1.5;
    }
    meteors.forEach((meteor) => {
      meteor.time += delta;
      const { rock, material } = meteor;
      if (meteor.state === 'drift' || meteor.state === 'grow' || meteor.state === 'flash') {
        rock.rotation.x += meteor.spin.x * delta;
        rock.rotation.y += meteor.spin.y * delta;
        rock.rotation.z += meteor.spin.z * delta;
        rock.position.set(
          meteor.base.x + Math.sin(elapsed * 0.21 + meteor.phase) * 2.4,
          meteor.base.y + Math.sin(elapsed * 0.27 + meteor.phase * 1.7) * 1.6,
          meteor.base.z + Math.cos(elapsed * 0.17 + meteor.phase) * 2.2,
        );
      }
      if (meteor.state === 'grow') {
        rock.scale.setScalar(meteor.size * THREE.MathUtils.smoothstep(meteor.time, 0, 1.8));
        if (meteor.time >= 1.8) { meteor.state = 'drift'; rock.scale.setScalar(meteor.size); }
      } else if (meteor.state === 'flash') {
        const flash = Math.min(1, meteor.time / 0.3);
        material.emissive.copy(burstColors[Math.floor(meteor.time * 26) % 2]);
        material.emissiveIntensity = 1.5 + flash * 5.5;
        rock.scale.setScalar(meteor.size * (1 + 0.2 * flash));
        if (meteor.time >= 0.3) startBurst(meteor);
      } else if (meteor.state === 'burst') {
        const progress = Math.min(1, meteor.time / 1.5);
        const fade = (1 - progress) ** 1.3;
        meteor.fragmentMaterials.forEach((fragmentMaterial) => { fragmentMaterial.opacity = fade; });
        meteor.fragments.forEach((fragment) => {
          const { velocity, spin, size } = fragment.userData;
          fragment.position.addScaledVector(velocity, delta);
          velocity.multiplyScalar(Math.exp(-1.5 * delta));
          fragment.rotation.x += spin.x * delta;
          fragment.rotation.y += spin.y * delta;
          const shrink = 1 - 0.55 * progress;
          fragment.scale.set(size * 0.8 * shrink, size * 1.9 * shrink, size * 0.8 * shrink);
        });
        const shockProgress = Math.min(1, meteor.time / 0.6);
        meteor.shock.scale.setScalar(meteor.size * (0.4 + (1 - (1 - shockProgress) ** 3) * 3.8));
        meteor.shock.quaternion.copy(camera.quaternion);
        meteor.shockMaterial.opacity = 0.4 * (1 - shockProgress) ** 1.5;
        meteor.shockMaterial.color.copy(burstColors[0]).lerp(burstColors[1], shockProgress);
        if (blastOwner === meteor) blastLight.intensity = 420 * (1 - Math.min(1, meteor.time / 0.55)) ** 2;
        if (meteor.time >= 1.5) {
          meteor.burst.visible = false;
          meteor.shock.visible = false;
          if (blastOwner === meteor) { blastLight.intensity = 0; blastOwner = null; }
          meteor.state = 'wait';
          meteor.time = 0;
          meteor.wait = 1.8 + random() * 1.8;
        }
      } else if (meteor.state === 'wait' && meteor.time >= meteor.wait) {
        pickMeteorSpot(meteor, 0.5 + random() * 0.5);
        material.emissive.setHex(0x2a0e05);
        material.emissiveIntensity = 0.5;
        rock.visible = true;
        rock.scale.setScalar(0);
        meteor.state = 'grow';
        meteor.time = 0;
      }
    });
  }
  const raycaster = new THREE.Raycaster();
  function meteorAt(event) {
    const bounds = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const targets = meteors.filter((meteor) => meteor.state === 'drift' || meteor.state === 'grow').map((meteor) => meteor.hitbox);
    const hit = raycaster.intersectObjects(targets, false)[0];
    return hit ? hit.object.userData.meteor : null;
  }
  canvas.addEventListener('click', (event) => {
    if (motion.matches) return;
    const meteor = meteorAt(event);
    if (meteor) blastMeteor(meteor);
  });
  canvas.addEventListener('pointermove', (event) => { canvas.style.cursor = !motion.matches && event.pointerType === 'mouse' && meteorAt(event) ? 'pointer' : 'default'; });

  const streakTexture = (() => {
    const art = document.createElement('canvas');
    art.width = 256;
    art.height = 32;
    const paint = art.getContext('2d');
    const gradient = paint.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, 'rgba(120,230,255,0)');
    gradient.addColorStop(0.55, 'rgba(150,240,255,0.35)');
    gradient.addColorStop(0.9, 'rgba(235,252,255,0.95)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');
    paint.fillStyle = gradient;
    paint.beginPath();
    paint.moveTo(0, 16);
    paint.lineTo(236, 9);
    paint.quadraticCurveTo(256, 16, 236, 23);
    paint.closePath();
    paint.fill();
    const head = paint.createRadialGradient(238, 16, 0, 238, 16, 14);
    head.addColorStop(0, 'rgba(255,255,255,0.9)');
    head.addColorStop(1, 'rgba(120,230,255,0)');
    paint.fillStyle = head;
    paint.fillRect(220, 0, 36, 32);
    const texture = new THREE.CanvasTexture(art);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  })();
  const streaks = Array.from({ length: 8 }, () => {
    const material = new THREE.MeshBasicMaterial({ map: streakTexture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
    const streak = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    streak.visible = false;
    scene.add(streak);
    return { mesh: streak, material, active: false, age: 0, life: 1, start: vector(0, 0, 0), velocity: vector(0, 0, 0), direction: vector(0, 0, 0), length: 1, theta: 0 };
  });
  const cameraForward = vector(0, 0, 0), cameraRight = vector(0, 0, 0), cameraUp = vector(0, 0, 0);
  const zAxis = vector(0, 0, 1), streakTurn = new THREE.Quaternion();
  let nextStreakBurst = 1.2;
  const pendingStreaks = [];
  function spawnStreak() {
    const streak = streaks.find((candidate) => !candidate.active);
    if (!streak) return;
    const depth = 135 + random() * 40;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth;
    camera.getWorldDirection(cameraForward);
    cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
    cameraUp.setFromMatrixColumn(camera.matrixWorld, 1);
    const side = random() < 0.5 ? 1 : -1, slope = 0.45 + random() * 0.3;
    const screenX = side * Math.cos(slope), screenY = -Math.sin(slope);
    streak.theta = Math.atan2(screenY, screenX);
    streak.direction.copy(cameraRight).multiplyScalar(screenX).addScaledVector(cameraUp, screenY).normalize();
    streak.velocity.copy(streak.direction).multiplyScalar(halfHeight * (1.1 + random() * 0.7));
    streak.start.copy(camera.position).addScaledVector(cameraForward, depth)
      .addScaledVector(cameraRight, (random() * 1.7 - 0.85) * halfHeight * camera.aspect)
      .addScaledVector(cameraUp, (0.18 + random() * 0.68) * halfHeight);
    streak.length = halfHeight * (0.38 + random() * 0.14);
    streak.mesh.scale.set(streak.length, halfHeight * 0.03, 1);
    streak.life = 0.95 + random() * 0.5;
    streak.age = 0;
    streak.active = true;
    streak.mesh.visible = true;
  }
  function updateStreaks(delta) {
    if (motion.matches) return;
    nextStreakBurst -= delta;
    if (nextStreakBurst <= 0) {
      const count = random() < 0.5 ? 2 : 3;
      for (let index = 0; index < count; index += 1) pendingStreaks.push(index * 0.25 + random() * 0.3);
      nextStreakBurst = 2.8 + random() * 2.4;
    }
    for (let index = pendingStreaks.length - 1; index >= 0; index -= 1) {
      pendingStreaks[index] -= delta;
      if (pendingStreaks[index] <= 0) { pendingStreaks.splice(index, 1); spawnStreak(); }
    }
    streaks.forEach((streak) => {
      if (!streak.active) return;
      streak.age += delta;
      const life = streak.age / streak.life;
      if (life >= 1) { streak.active = false; streak.mesh.visible = false; streak.material.opacity = 0; return; }
      streak.material.opacity = THREE.MathUtils.smoothstep(life, 0, 0.12) * (1 - THREE.MathUtils.smoothstep(life, 0.45, 1));
      streak.mesh.position.copy(streak.start).addScaledVector(streak.velocity, streak.age).addScaledVector(streak.direction, -streak.length * 0.5);
      streak.mesh.quaternion.copy(camera.quaternion).multiply(streakTurn.setFromAxisAngle(zAxis, streak.theta));
    });
  }
  const pointer = new THREE.Vector2();
  shell.addEventListener('pointermove', (event) => {
    if (event.target.closest('button, a, nav') || motion.matches) return;
    const bounds = shell.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width - 0.5, (event.clientY - bounds.top) / bounds.height - 0.5);
  });
  shell.addEventListener('pointerleave', () => pointer.set(0, 0));
  const flight = { progress: 0 };
  let smoothed = 0;
  let flightTween;
  function configureFlight() {
    flightTween?.scrollTrigger?.kill();
    flightTween?.kill();
    journey.classList.toggle('is-reduced', motion.matches);
    flight.progress = 0;
    flightTween = gsap.to(flight, {
      progress: 1, ease: 'none',
      scrollTrigger: {
        id: 'space-flight', trigger: journey, start: 'top top', end: 'bottom bottom',
        scrub: motion.matches ? true : 0.35, invalidateOnRefresh: true,
        onUpdate: (trigger) => { if (motion.matches) flight.progress = trigger.progress; },
      },
    });
    ScrollTrigger.refresh();
  }
  configureFlight();
  motion.addEventListener('change', configureFlight);
  resetFlight = () => { flight.progress = 0; smoothed = 0; flightTween.scrollTrigger?.scroll(0); ScrollTrigger.update(); setHud(0); sceneDirty = true; };
  function resize() {
    const width = shell.clientWidth, height = shell.clientHeight;
    const mobile = width < 760;
    ship.scale.setScalar(mobile ? 0.65 : 1);
    ship.position.x = mobile ? -0.8 : -2.2;
    hologram.scale.setScalar(mobile ? 0.72 : 1);
    hologram.position.set(mobile ? -4 : -6, 0, mobile ? -81 : -80);
    buildGuide();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 760 ? 1.2 : 1.5));
    renderer.setSize(width, height, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(width, height);
    camera.aspect = width / height;
    baseFov = width < 760 ? 68 : 54;
    camera.fov = baseFov;
    camera.updateProjectionMatrix();
    sceneDirty = true;
  }
  let baseFov = 54;
  resize();
  new ResizeObserver(resize).observe(shell);
  const clock = new THREE.Clock();
  let elapsed = 0, lastHud = -1, lastProgress = -1, worldVisible = true;
  new IntersectionObserver(([entry]) => { worldVisible = entry.isIntersecting; }).observe(shell);
  function updateCamera(progress) {
    const curveProgress = curveParam(progress);
    cameraCurveT = curveProgress;
    positionCurve.getPoint(curveProgress, camera.position);
    lookCurve.getPoint(curveProgress, lookTarget);
    const follow = ss(progress, 0.09, 0.2) * (1 - ss(progress, 0.62, 0.72));
    if (follow > 0.001) lookTarget.lerp(charFocus, 0.45 * follow);
    if (shell.clientWidth < 760 && progress > 0.75) {
      const settle = THREE.MathUtils.smoothstep(progress, 0.75, 0.95);
      camera.position.add(vector(-5.2, 2.6, 5).multiplyScalar(settle));
      lookTarget.y -= 4.8 * settle;
    }
    const portal = Math.max(0, Math.min(1, worldState.portal));
    camera.position.y += 0.5 * (1 - portal);
    camera.position.z += 5.5 * (1 - portal);
    if (!motion.matches) { camera.position.x += pointer.x * 0.28; camera.position.y -= pointer.y * 0.15; }
    if (launch.amount > 0) {
      shipFocus.copy(ship.position);
      shipFocus.y += 0.8;
      lookTarget.lerp(shipFocus, THREE.MathUtils.smoothstep(launch.amount, 0.2, 0.9) * 0.72);
      const align = THREE.MathUtils.smoothstep(launch.amount, 0.3, 0.64);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, align);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5, align);
      camera.position.z -= launch.surge;
      const level = THREE.MathUtils.smoothstep(launch.amount, 0.55, 1) * 0.9;
      lookTarget.x = THREE.MathUtils.lerp(lookTarget.x, camera.position.x, level);
      lookTarget.y = THREE.MathUtils.lerp(lookTarget.y, camera.position.y + 1.5, level);
      const shake = launch.thrust * (1 - 0.6 * launch.run) * 0.045;
      camera.position.x += (Math.sin(elapsed * 47) + Math.sin(elapsed * 29.3)) * shake;
      camera.position.y += Math.sin(elapsed * 41.7) * shake;
    }
    camera.lookAt(lookTarget);
  }
  function animate() {
    const delta = Math.min(clock.getDelta(), 0.05);
    if (!document.hidden && worldVisible) {
      const target = Math.max(0, Math.min(1, flight.progress));
      smoothed = motion.matches ? target : smoothed + (target - smoothed) * (1 - Math.exp(-delta * 3.4));
      if (Math.abs(target - smoothed) < 0.00005) smoothed = target;
      const progress = smoothed;
      if (!motion.matches) elapsed += delta;
      if (!motion.matches || sceneDirty || Math.abs(progress - lastProgress) > 0.0001 || document.documentElement.classList.contains('welcome-open')) {
        const viewProgress = motion.matches ? (progress > 0.6 ? 1 : 0) : progress;
        const charProgress = motion.matches ? (viewProgress ? 0.9 : 0) : progress;
        updateCharacter(charProgress);
        updateGate(charProgress);
        updateLaunch(progress);
        updateCamera(viewProgress);
        updateWarp();
        updateAfterburner();
        const launchFov = baseFov + 12 * launch.warp ** 1.3;
        if (Math.abs(camera.fov - launchFov) > 0.01) { camera.fov = launchFov; camera.updateProjectionMatrix(); }
        station.rotation.z = elapsed * 0.06;
        planet.rotation.y = elapsed * 0.018;
        stars.rotation.y = elapsed * 0.0015;
        satellites.forEach((satellite, index) => {
          satellite.rotation.y = elapsed * (0.06 + index * 0.01);
          satellite.rotation.z = 0.3 + Math.sin(elapsed * 0.15 + index) * 0.12;
        });
        updateRings(charState.t);
        updateSolar(viewProgress);
        updateMoon(viewProgress);
        updateLighting(viewProgress);
        updateMeteors(delta);
        updateStreaks(delta);
        setSceneThree(THREE.MathUtils.smoothstep(progress, 0.5, 0.66));
        updateRunway(delta);
        updateDeck(charProgress);
        if (portraitMesh) {
          portraitMesh.position.y = 2.08 + Math.sin(elapsed * 1.3) * 0.08;
          portraitMesh.quaternion.copy(camera.quaternion);
          portraitMesh.material.opacity = charState.portrait;
          portraitMesh.visible = charState.portrait > 0.004;
        }
        secondRing.rotation.z = elapsed * 0.3;
        for (let index = 0; index < 100; index += 1) {
          const phase = (elapsed * 0.7 + index / 100) % 1;
          enginePositions[index * 3] = (index % 2 ? 1.5 : -1.5) + Math.sin(index * 7.1) * phase * 0.24;
          enginePositions[index * 3 + 1] = Math.cos(index * 2.4) * phase * 0.25;
          enginePositions[index * 3 + 2] = -3.85 - phase * 2.7;
        }
        engineGeometry.attributes.position.needsUpdate = true;
        composer.render();
        sceneDirty = false;
        lastProgress = progress;
      }
      if (Math.abs(progress - lastHud) > 0.001) { setHud(progress); lastHud = progress; }
      shell.dataset.progress = progress.toFixed(3);
      canvas.dataset.camera = camera.position.toArray().map((value) => value.toFixed(2)).join(',');
      canvas.dataset.streaks = String(streaks.filter((streak) => streak.active).length);
      canvas.dataset.meteors = meteors.map((meteor) => meteor.state).join(',');
      canvas.dataset.sceneThree = sceneThreeAmount.toFixed(2);
      canvas.dataset.launch = launch.amount.toFixed(2);
      canvas.dataset.gate = forceGate.toFixed(2);
      canvas.dataset.charArc = charState.arc.toFixed(1);
      canvas.dataset.charFlight = charState.flight.toFixed(2);
      canvas.dataset.sun = solarAmount.toFixed(2);
      canvas.dataset.moon = moonAmount.toFixed(2);
      canvas.dataset.rim = warmRim.color.getHexString();
    }
    requestAnimationFrame(animate);
  }
  updateCamera(flight.progress);
  composer.render();
  shell.dataset.ready = 'true';
  shell.dataset.bloom = 'enabled';
  worldState.ready = true;
  window.dispatchEvent(new CustomEvent('space:ready'));
  setHud(0);
  animate();
  await Promise.allSettled([skyReady, portraitReady]);
  shell.dataset.assets = 'settled';
}

initializeSpaceWorld().catch((error) => {
  console.error('The space world is unavailable', error);
  shell.dataset.ready = 'fallback';
  journey.classList.add('is-unavailable');
  document.querySelector('.world-fallback').firstChild.textContent = 'The space scene could not load. Your projects and experience are still available below. ';
  window.dispatchEvent(new CustomEvent('space:ready'));
});