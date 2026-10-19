const portfolio = document.querySelector('.portfolio-home');
const galleryCanvas = portfolio.querySelector('#project-gallery');
const details = portfolio.querySelector('.project-details');
const dots = [...portfolio.querySelectorAll('.progress-dot')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const projects = [
  {
    title: 'End-to-End RAG API',
    description: 'Retrieval, local inference, and semantic quality gates. A FastAPI pipeline built beyond the prototype.',
    tags: ['FastAPI', 'ChromaDB', 'Ollama'],
    category: 'OPEN SOURCE',
    url: 'https://github.com/Captaincool23/pythonpro-rag-api',
    background: '#112a25', ink: '#e3f5ec', accent: '#a6f4d0', soft: '#24463c',
    nodes: ['Documents', 'ChromaDB', 'Ollama'],
    output: 'FastAPI / Kubernetes / Semantic validation',
  },
  {
    title: 'MicroCloudPy',
    description: 'Message-driven Python microservices with RabbitMQ, PostgreSQL, and MongoDB. Built for cloud-native delivery.',
    tags: ['Python', 'RabbitMQ', 'AWS EKS'],
    category: 'OPEN SOURCE',
    url: 'https://github.com/Captaincool23/MicroCloudPy/tree/main/microservices-python-app-main',
    background: '#291e20', ink: '#f5e6e0', accent: '#ffad91', soft: '#51353a',
    nodes: ['Auth', 'RabbitMQ', 'Converter'],
    output: 'PostgreSQL + MongoDB / Helm / AWS EKS',
  },
  {
    title: 'AI System Advisor',
    description: 'Production work at Teradata: LLM reasoning meets observability, with scoped MCP tools for read-only diagnostics.',
    tags: ['LLMs', 'MCP', 'ELK'],
    category: 'TERADATA / WORK HIGHLIGHT',
    url: '#experience',
    background: '#242638', ink: '#eef0ff', accent: '#bdc9ff', soft: '#41455d',
    nodes: ['ELK logs', 'LLM advisor', 'MCP tools'],
    output: 'Read-only diagnostics / Argo CD delivery',
  },
];
let selected = 0;
let selectInScene = () => {};
let onProjectChange = () => {};
let announced = false;
let sceneDirty = true;
let visible = false;
let started = false;
const NODE = { left: 44, top: 260, width: 226, height: 120, pitch: 292 };
const FLOW = { cycle: 3.4, hop: 0.7, stagger: 0.13, packets: 3, starts: [0.25, 1.45] };
const clamp01 = (value) => Math.min(1, Math.max(0, value));
const softstep = (value) => value * value * (3 - 2 * value);
function pulseAt(since) { return since < 0 ? 0 : Math.min(1, since / 0.08) * Math.exp(-since * 2.4); }
function paintTexture(THREE, width, height, paint) {
  const art = document.createElement('canvas');
  art.width = width;
  art.height = height;
  paint(art.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(art);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function showProject(index) {
  const previous = selected;
  selected = (index + projects.length) % projects.length;
  const project = projects[selected];
  portfolio.querySelector('#project-title').textContent = project.title;
  portfolio.querySelector('#project-description').textContent = project.description;
  portfolio.querySelector('#project-number').textContent = String(selected + 1).padStart(2, '0');
  portfolio.querySelector('#project-category').textContent = project.category;
  portfolio.querySelector('#project-link').href = project.url;
  portfolio.querySelector('#project-link-label').textContent = project.url.startsWith('#') ? 'Explore my experience' : 'View repository';
  portfolio.querySelector('#project-tags').replaceChildren(...project.tags.map((label) => {
    const tag = document.createElement('span');
    tag.textContent = label;
    return tag;
  }));
  dots.forEach((dot, indexInList) => {
    dot.classList.toggle('is-active', selected === indexInList);
    dot.setAttribute('aria-current', selected === indexInList ? 'true' : 'false');
  });
  if (!reducedMotion.matches) details.animate([{ opacity: 0.4, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out' });
  if (announced && previous !== selected) onProjectChange(selected);
  sceneDirty = true;
}
function selectProject(index) { showProject(index); selectInScene(selected); }
portfolio.querySelector('#previous-project').addEventListener('click', () => selectProject(selected - 1));
portfolio.querySelector('#next-project').addEventListener('click', () => selectProject(selected + 1));
dots.forEach((dot) => dot.addEventListener('click', () => selectProject(Number(dot.dataset.project))));
showProject(0);
announced = true;

function makePreview(project) {
  const preview = document.createElement('canvas');
  preview.width = 900;
  preview.height = 570;
  const context = preview.getContext('2d');
  context.fillStyle = project.background;
  context.fillRect(0, 0, 900, 570);
  context.fillStyle = project.ink;
  context.font = '600 22px Arial';
  context.fillText('RAJ DUBEY / SYSTEM ARCHITECTURE', 42, 47);
  context.globalAlpha = 0.3;
  context.fillRect(40, 68, 820, 1);
  context.globalAlpha = 1;
  context.font = 'bold 48px Arial';
  context.fillText(project.title, 42, 151);
  context.fillStyle = project.accent;
  context.font = '18px Arial';
  context.fillText(project.category, 44, 194);
  context.strokeStyle = project.accent;
  context.lineWidth = 2;
  for (let index = 0; index < 2; index += 1) {
    const from = NODE.left + index * NODE.pitch + NODE.width, to = NODE.left + (index + 1) * NODE.pitch;
    context.globalAlpha = 0.55;
    context.beginPath();
    context.moveTo(from + 6, 320);
    context.lineTo(to - 6, 320);
    context.moveTo(to - 15, 313);
    context.lineTo(to - 6, 320);
    context.lineTo(to - 15, 327);
    context.stroke();
  }
  context.globalAlpha = 1;
  project.nodes.forEach((label, index) => {
    const left = NODE.left + index * NODE.pitch;
    context.fillStyle = project.soft;
    context.beginPath();
    context.roundRect(left, NODE.top, NODE.width, NODE.height, 8);
    context.fill();
    context.globalAlpha = 0.22;
    context.strokeStyle = project.accent;
    context.lineWidth = 1.5;
    context.stroke();
    context.globalAlpha = 1;
    context.fillStyle = project.accent;
    context.font = '14px monospace';
    context.fillText(`0${index + 1}`, left + 20, 289);
    context.fillStyle = project.ink;
    context.font = 'bold 26px Arial';
    context.fillText(label, left + 20, 338);
  });
  context.fillStyle = project.ink;
  context.font = '22px Arial';
  context.fillText(project.output, 44, 455);
  context.fillStyle = project.accent;
  context.font = '16px monospace';
  context.fillText('ARCHITECTURE ILLUSTRATION / NOT A PRODUCT SCREENSHOT', 44, 528);
  return preview;
}

async function initializeGallery() {
  const THREE = await import('three');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a1411, 0.055);
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas: galleryCanvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  scene.add(new THREE.HemisphereLight(0xd8f6e6, 0x13201a, 2.2));
  [[2, 4, 4, 0x9af4ca, 95], [-5, -1, 2, 0xffa47b, 70]].forEach(([x, y, z, color, intensity]) => {
    const light = new THREE.PointLight(color, intensity, 18, 2);
    light.position.set(x, y, z);
    scene.add(light);
  });
  const gallery = new THREE.Group();
  const tiltRig = new THREE.Group();
  const stage = new THREE.Group();
  tiltRig.add(gallery);
  scene.add(tiltRig, stage);
  const additive = (options) => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, ...options });
  const glowMap = paintTexture(THREE, 64, 64, (paint) => {
    const gradient = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.28, 'rgba(200,255,230,0.75)');
    gradient.addColorStop(0.62, 'rgba(70,235,165,0.2)');
    gradient.addColorStop(1, 'rgba(40,200,140,0)');
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 64, 64);
  });
  const borderMap = paintTexture(THREE, 476, 264, (paint) => {
    paint.shadowColor = 'rgba(110,255,196,1)';
    paint.shadowBlur = 11;
    paint.strokeStyle = 'rgba(205,255,235,1)';
    paint.lineWidth = 4;
    paint.beginPath();
    paint.roundRect(12, 12, 452, 240, 16);
    paint.stroke();
  });
  const scanMap = paintTexture(THREE, 4, 4, (paint) => { paint.fillStyle = 'rgba(160,255,215,0.85)'; paint.fillRect(0, 0, 4, 1); });
  scanMap.wrapS = scanMap.wrapT = THREE.RepeatWrapping;
  scanMap.repeat.set(1, 120);
  scanMap.magFilter = THREE.NearestFilter;
  const sweepMap = paintTexture(THREE, 4, 64, (paint) => {
    const gradient = paint.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, 'rgba(120,255,200,0)');
    gradient.addColorStop(0.5, 'rgba(210,255,236,0.95)');
    gradient.addColorStop(1, 'rgba(120,255,200,0)');
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 4, 64);
  });
  const trailMap = paintTexture(THREE, 128, 16, (paint) => {
    const gradient = paint.createLinearGradient(0, 0, 128, 0);
    gradient.addColorStop(0, 'rgba(110,255,196,0)');
    gradient.addColorStop(1, 'rgba(215,255,238,0.95)');
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 128, 16);
    paint.globalCompositeOperation = 'destination-in';
    const fade = paint.createLinearGradient(0, 0, 0, 16);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.5, 'rgba(0,0,0,1)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    paint.fillStyle = fade;
    paint.fillRect(0, 0, 128, 16);
  });
  const ux = 3.43 / 900, uy = 2.23 / 570;
  const cardX = (px) => (px - 450) * ux, cardY = (py) => (285 - py) * uy;
  const packetGeometry = new THREE.PlaneGeometry(0.2, 0.2), trailGeometry = new THREE.PlaneGeometry(0.46, 0.06);
  const clickable = [];
  const cards = projects.map((project, index) => {
    const group = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.BoxGeometry(3.55, 2.35, 0.16), new THREE.MeshStandardMaterial({ color: 0x111a16, metalness: 0.4, roughness: 0.34 }));
    shell.userData.index = index;
    group.add(shell);
    clickable.push(shell);
    const texture = new THREE.CanvasTexture(makePreview(project));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.43, 2.23), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
    screen.position.z = 0.086;
    screen.userData.index = index;
    group.add(screen);
    clickable.push(screen);
    const halo = new THREE.Mesh(new THREE.BoxGeometry(3.68, 2.48, 0.035), new THREE.MeshBasicMaterial({ color: project.accent, transparent: true, opacity: 0.13 }));
    halo.position.z = -0.1;
    group.add(halo);
    const borders = [0, 1, 2].map((slot) => {
      const material = additive({ map: borderMap, opacity: 0.16 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry((NODE.width + 12) * ux, (NODE.height + 12) * uy), material);
      plane.position.set(cardX(NODE.left + slot * NODE.pitch + NODE.width / 2), cardY(NODE.top + NODE.height / 2), 0.1);
      group.add(plane);
      return material;
    });
    const packets = [];
    for (let hop = 0; hop < 2; hop += 1) {
      for (let slot = 0; slot < FLOW.packets; slot += 1) {
        const packet = new THREE.Group();
        packet.visible = false;
        const glowMaterial = additive({ map: glowMap }), trailMaterial = additive({ map: trailMap });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.x = -0.2;
        packet.add(trail, new THREE.Mesh(packetGeometry, glowMaterial));
        packet.position.set(0, cardY(NODE.top + NODE.height / 2), 0.108);
        group.add(packet);
        packets.push({ group: packet, glowMaterial, trailMaterial, hop, slot, fromX: NODE.left + hop * NODE.pitch + NODE.width - 6, toX: NODE.left + (hop + 1) * NODE.pitch + 6 });
      }
    }
    const scanMaterial = additive({ map: scanMap }), sweepMaterial = additive({ map: sweepMap });
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(3.43, 2.23), scanMaterial);
    scan.position.z = 0.096;
    const sweep = new THREE.Mesh(new THREE.PlaneGeometry(3.43, 0.34), sweepMaterial);
    sweep.position.z = 0.1;
    scan.visible = sweep.visible = false;
    group.add(scan, sweep);
    group.rotation.y = index * Math.PI * 2 / projects.length;
    gallery.add(group);
    return { group, halo, borders, packets, scan, sweep, scanMaterial, sweepMaterial, offset: index * 0.9 };
  });
  [1.1, 1.55, 2.05].forEach((scale, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45 * scale, 0.008, 8, 180), new THREE.MeshBasicMaterial({ color: index === 1 ? 0x81cbaa : 0x496c5b, transparent: true, opacity: index === 1 ? 0.4 : 0.2 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.55 - index * 0.09;
    stage.add(ring);
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.82, 0.24, 72), new THREE.MeshStandardMaterial({ color: 0x1c2c24, metalness: 0.58, roughness: 0.3 }));
  base.position.y = -1.78;
  stage.add(base);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.55, 0.04, 72), new THREE.MeshStandardMaterial({ color: 0x8dd4ae, emissive: 0x244633, metalness: 0.45, roughness: 0.26 }));
  top.position.y = -1.64;
  stage.add(top);
  const topMaterial = top.material;
  const topEmissive = new THREE.Color(0x244633), topHot = new THREE.Color(0x66ffb8), topMix = new THREE.Color();
  const arcRings = [
    { radius: 1.45 * 1.1, y: -1.55, count: 3, arc: 1.05, speed: 0.42, color: 0x9af4ca, tube: 0.016 },
    { radius: 1.45 * 1.55, y: -1.64, count: 4, arc: 0.62, speed: -0.3, color: 0x81e8bd, tube: 0.013 },
    { radius: 1.45 * 2.05, y: -1.73, count: 2, arc: 1.9, speed: 0.18, color: 0x6ad8aa, tube: 0.011 },
  ].map((spec) => {
    const pivot = new THREE.Group();
    pivot.position.y = spec.y;
    stage.add(pivot);
    const material = new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0.78, toneMapped: false, fog: false });
    for (let slot = 0; slot < spec.count; slot += 1) {
      const holder = new THREE.Group();
      holder.rotation.y = slot * Math.PI * 2 / spec.count;
      pivot.add(holder);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(spec.radius, spec.tube, 8, 72, spec.arc), material);
      arc.rotation.x = Math.PI / 2;
      holder.add(arc);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 8), new THREE.MeshBasicMaterial({ color: 0xeafff4, toneMapped: false, fog: false }));
      bead.position.set(Math.cos(spec.arc) * spec.radius, 0, Math.sin(spec.arc) * spec.radius);
      holder.add(bead);
    }
    return { pivot, material, speed: spec.speed };
  });
  const coneMap = paintTexture(THREE, 256, 128, (paint, width, height) => {
    for (let x = 0; x < width; x += 1) {
      const strength = 0.28 + 0.72 * Math.abs(Math.sin(x * 0.19) * Math.sin(x * 0.047 + 1.3) + 0.35 * Math.sin(x * 0.51));
      paint.fillStyle = `rgba(150,255,210,${Math.min(1, strength).toFixed(3)})`;
      paint.fillRect(x, 0, 1, height);
    }
    paint.globalCompositeOperation = 'destination-in';
    const fade = paint.createLinearGradient(0, 0, 0, height);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    fade.addColorStop(1, 'rgba(0,0,0,1)');
    paint.fillStyle = fade;
    paint.fillRect(0, 0, width, height);
  });
  coneMap.wrapS = THREE.RepeatWrapping;
  const coneMaterial = additive({ map: coneMap, color: 0x72ffc4, opacity: 0.2, side: THREE.DoubleSide });
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.45, 3.7, 64, 1, true), coneMaterial);
  cone.position.y = -1.64 + 1.85;
  stage.add(cone);
  const riseCount = 90;
  const risePositions = new Float32Array(riseCount * 3), riseColors = new Float32Array(riseCount * 3);
  const riseSeeds = Array.from({ length: riseCount }, () => ({ angle: Math.random() * Math.PI * 2, spread: Math.sqrt(Math.random()), speed: 0.14 + Math.random() * 0.2, offset: Math.random() }));
  const riseGeometry = new THREE.BufferGeometry();
  riseGeometry.setAttribute('position', new THREE.BufferAttribute(risePositions, 3));
  riseGeometry.setAttribute('color', new THREE.BufferAttribute(riseColors, 3));
  const rise = new THREE.Points(riseGeometry, new THREE.PointsMaterial({ size: 0.085, map: glowMap, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  rise.frustumCulled = false;
  stage.add(rise);
  const pulseRingMaterial = additive({ color: 0x8dffd0, side: THREE.DoubleSide });
  const pulseRing = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 96), pulseRingMaterial);
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.y = -1.6;
  pulseRing.visible = false;
  stage.add(pulseRing);
  const particlePositions = new Float32Array(1500);
  for (let index = 0; index < 500; index += 1) {
    particlePositions[index * 3] = (Math.random() - 0.5) * 24;
    particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 13;
    particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 15 - 3;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xc5e9d3, size: 0.025, transparent: true, opacity: 0.62 }));
  scene.add(particles);

  const cameraHome = new THREE.Vector3(0, 1.5, 10.6);
  const palette = [0xe9fff4, 0xa6f4d0, 0xbfe9ff, 0xfff0d8].map((hex) => new THREE.Color(hex));
  const starLayers = [
    { z: -34, size: 0.1, count: 150, opacity: 0.8, shift: 3 },
    { z: -22, size: 0.075, count: 90, opacity: 0.85, shift: 1.8 },
    { z: -12, size: 0.05, count: 50, opacity: 0.9, shift: 0.9 },
  ].map((spec) => {
    const seeds = Float32Array.from({ length: spec.count * 2 }, () => Math.random() * 2 - 1);
    const positions = new Float32Array(spec.count * 3), colors = new Float32Array(spec.count * 3);
    for (let index = 0; index < spec.count; index += 1) palette[Math.floor(Math.random() * palette.length)].clone().multiplyScalar(0.35 + Math.random() * 0.65).toArray(colors, index * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: spec.size, map: glowMap, vertexColors: true, transparent: true, opacity: spec.opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    points.frustumCulled = false;
    scene.add(points);
    return { ...spec, seeds, positions, geometry, points };
  });
  function layoutStars() {
    starLayers.forEach((layer) => {
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (cameraHome.z - layer.z);
      const halfWidth = halfHeight * camera.aspect;
      for (let index = 0; index < layer.count; index += 1) {
        layer.positions[index * 3] = layer.seeds[index * 2] * halfWidth * 1.2;
        layer.positions[index * 3 + 1] = cameraHome.y + layer.seeds[index * 2 + 1] * halfHeight * 1.2;
        layer.positions[index * 3 + 2] = layer.z;
      }
      layer.geometry.attributes.position.needsUpdate = true;
    });
  }

  // Miniature of the hangar starship, banking in orbit above the hologram stage and beaming telemetry to it.
  const craft = new THREE.Group();
  scene.add(craft);
  const craftModel = new THREE.Group();
  craft.add(craftModel);
  const hullMaterial = new THREE.MeshStandardMaterial({ color: 0xa9c2b8, metalness: 0.7, roughness: 0.3, flatShading: true, fog: false });
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x5f7f74, metalness: 0.6, roughness: 0.45, flatShading: true, side: THREE.DoubleSide, fog: false });
  const cockpitMaterial = new THREE.MeshStandardMaterial({ color: 0x0f3b3a, metalness: 0.8, roughness: 0.12, emissive: 0x2dffb4, emissiveIntensity: 1, fog: false });
  const craftRingMaterial = new THREE.MeshBasicMaterial({ color: 0x6dffc4, toneMapped: false, fog: false });
  const hullGeometry = new THREE.ConeGeometry(1.6, 8.5, 6).rotateX(Math.PI / 2);
  const hullRim = new THREE.Mesh(hullGeometry, additive({ color: 0x5fe8b0, side: THREE.BackSide, opacity: 0.32 }));
  hullRim.scale.setScalar(1.14);
  craftModel.add(new THREE.Mesh(hullGeometry, hullMaterial), hullRim);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), cockpitMaterial);
  cockpit.position.set(0, 0.65, 0.55);
  cockpit.scale.set(0.75, 0.5, 1.7);
  craftModel.add(cockpit);
  const craftFin = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 3), hullMaterial);
  craftFin.position.set(0, 1.05, -2.8);
  craftFin.scale.z = 0.2;
  craftModel.add(craftFin);
  const flameGeometry = new THREE.ConeGeometry(0.42, 1, 14, 1, true).translate(0, 0.5, 0).rotateX(-Math.PI / 2);
  const flameMaterial = additive({ color: 0x5fe8b0, opacity: 0.55, side: THREE.DoubleSide });
  const flames = [-1, 1].map((side) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(side * 4.5, -2.4);
    shape.lineTo(side * 4.1, -4.1);
    shape.lineTo(0, -2.5);
    const wing = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false }), wingMaterial);
    wing.position.set(side * 0.6, 0, 1);
    wing.rotation.x = Math.PI / 2;
    const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.5, 2, 10).rotateX(Math.PI / 2), hullMaterial);
    nacelle.position.set(side * 1.5, 0, -2.8);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 8, 24), craftRingMaterial);
    ring.position.set(side * 1.5, 0, -3.85);
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(side * 1.5, 0, -3.95);
    craftModel.add(wing, nacelle, ring, flame);
    return flame;
  });
  const craftLight = (color, x, y, z, size) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
    sprite.position.set(x, y, z);
    sprite.scale.setScalar(size);
    craftModel.add(sprite);
    return sprite.material;
  };
  const craftGlint = craftLight(0x6dffc4, 0, 0.9, 0.9, 3.2);
  const craftNavA = craftLight(0xff9a78, 4.4, -0.1, -3.7, 1.6), craftNavB = craftLight(0x7dffc4, -4.4, -0.1, -3.7, 1.6);
  const craftEngineGlow = [-1, 1].map((side) => craftLight(0x7dffc4, side * 1.5, 0, -4.2, 3));

  const trailCount = 30;
  const trailPositions = new Float32Array(trailCount * 6), trailColors = new Float32Array(trailCount * 6);
  const trailGeometry3d = new THREE.BufferGeometry();
  trailGeometry3d.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry3d.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
  const thrusterTrail = new THREE.Points(trailGeometry3d, new THREE.PointsMaterial({ size: 0.12, map: glowMap, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  thrusterTrail.frustumCulled = false;
  scene.add(thrusterTrail);

  const beamMap = paintTexture(THREE, 8, 64, (paint) => {
    const dash = paint.createLinearGradient(0, 0, 0, 64);
    dash.addColorStop(0, 'rgba(170,255,215,0)');
    dash.addColorStop(0.12, 'rgba(190,255,225,1)');
    dash.addColorStop(0.42, 'rgba(120,255,195,0.1)');
    dash.addColorStop(1, 'rgba(120,255,195,0)');
    paint.fillStyle = dash;
    paint.fillRect(0, 0, 8, 64);
  });
  beamMap.wrapS = beamMap.wrapT = THREE.RepeatWrapping;
  const beamMaterial = additive({ map: beamMap, color: 0x5fe8b0, opacity: 0.4, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.07, 1, 10, 1, true), beamMaterial);
  scene.add(beam);
  const beamGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: 0x7dffc4, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
  scene.add(beamGlow);
  const beamPackets = [0, 1, 2].map(() => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: 0xcfffe9, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
    sprite.scale.setScalar(0.18);
    scene.add(sprite);
    return sprite;
  });

  const craftCenter = new THREE.Vector3(3.4, 3.4, 2.2);
  let craftRadius = 0.85;
  const craftAhead = new THREE.Vector3(), craftUp = new THREE.Vector3(0, 1, 0);
  const beamFrom = new THREE.Vector3(), beamTo = new THREE.Vector3(), beamDir = new THREE.Vector3(), nacelleWorld = new THREE.Vector3();
  const trailPose = new THREE.Object3D();
  const trailTint = new THREE.Color();
  function craftOrbit(time, out) {
    const phase = time * 0.3;
    return out.set(craftCenter.x + Math.cos(phase) * craftRadius, craftCenter.y + Math.sin(phase * 2 + 1) * 0.1 + Math.sin(time * 0.37) * 0.05, craftCenter.z + Math.sin(phase) * craftRadius * 0.7);
  }
  function poseCraft(object, time) {
    craftOrbit(time, object.position);
    craftOrbit(time + 0.3, craftAhead);
    object.lookAt(craftAhead);
    object.rotateZ(0.38 + Math.sin(time * 0.6) * 0.07);
    object.updateMatrixWorld(true);
  }
  function updateCraft(time, calm) {
    const at = calm ? 3 : time;
    craft.scale.setScalar(mobile ? 0.075 : 0.1);
    poseCraft(craft, at);
    const blink = 0.5 + 0.5 * Math.sin(time * 3.1);
    craftGlint.opacity = 0.5 + 0.3 * Math.sin(time * 1.7);
    craftNavA.opacity = blink;
    craftNavB.opacity = 1 - blink;
    cockpitMaterial.emissiveIntensity = 1 + 0.35 * Math.sin(time * 1.7);
    const flicker = 1 + 0.12 * Math.sin(time * 41) + 0.07 * Math.sin(time * 67 + 1);
    flames.forEach((flame) => flame.scale.set(1, 1, 3.4 * flicker));
    craftEngineGlow.forEach((material) => { material.opacity = 0.55 * flicker; });

    trailPose.scale.copy(craft.scale);
    for (let age = 0; age < trailCount; age += 1) {
      poseCraft(trailPose, at - age * 0.16);
      const fade = (1 - age / trailCount) ** 1.7;
      trailTint.setRGB(0.35, 1, 0.72).multiplyScalar(0.85 * fade);
      [-1, 1].forEach((side, lane) => {
        trailPose.localToWorld(nacelleWorld.set(side * 1.5, 0, -4.1));
        const slot = (age * 2 + lane) * 3;
        nacelleWorld.toArray(trailPositions, slot);
        trailTint.toArray(trailColors, slot);
      });
    }
    trailGeometry3d.attributes.position.needsUpdate = true;
    trailGeometry3d.attributes.color.needsUpdate = true;

    craft.localToWorld(beamFrom.set(0, -0.9, 0.6));
    beamTo.set(stage.position.x, stage.position.y + 0.8, 0);
    beamDir.subVectors(beamFrom, beamTo);
    const length = beamDir.length();
    beam.position.addVectors(beamFrom, beamTo).multiplyScalar(0.5);
    beam.quaternion.setFromUnitVectors(craftUp, beamDir.normalize());
    beam.scale.set(1, length, 1);
    beamMap.repeat.set(1, length * 1.5);
    beamMap.offset.y = (time * 0.7) % 1;
    beamMaterial.opacity = 0.34 + 0.08 * Math.sin(time * 2.3);
    beamGlow.position.copy(beamTo);
    beamGlow.scale.setScalar(0.5 + 0.12 * Math.sin(time * 3.1));
    beamPackets.forEach((sprite, index) => {
      const travel = (time * 0.42 + index / beamPackets.length) % 1;
      sprite.position.lerpVectors(beamFrom, beamTo, travel);
      sprite.material.opacity = 0.85 * Math.sin(Math.PI * travel);
    });
  }

  const shooters = Array.from({ length: 3 }, () => {
    const material = additive({ map: trailMap, color: 0x9dffd6 });
    const streak = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    streak.visible = false;
    scene.add(streak);
    return { streak, material, active: false, age: 0, life: 1, from: new THREE.Vector3(), velocity: new THREE.Vector3() };
  });
  let nextShooter = 2.5;
  function spawnShooter() {
    const shooter = shooters.find((candidate) => !candidate.active);
    if (!shooter) return;
    const heading = THREE.MathUtils.degToRad(200 + Math.random() * 18), length = 2.4 + Math.random();
    shooter.velocity.set(Math.cos(heading), Math.sin(heading), 0).multiplyScalar(16 + Math.random() * 6);
    shooter.from.set(4 + Math.random() * 13, 5.4 + Math.random() * 3.8, -16);
    shooter.streak.scale.set(length, 0.12, 1);
    shooter.streak.rotation.z = heading;
    shooter.life = 0.8 + Math.random() * 0.4;
    shooter.age = 0;
    shooter.active = true;
    shooter.streak.visible = true;
  }
  function updateShooters(delta) {
    nextShooter -= delta;
    if (nextShooter <= 0) { spawnShooter(); nextShooter = 4.5 + Math.random() * 4.5; }
    shooters.forEach((shooter) => {
      if (!shooter.active) return;
      shooter.age += delta;
      const life = shooter.age / shooter.life;
      if (life >= 1) { shooter.active = false; shooter.streak.visible = false; shooter.material.opacity = 0; return; }
      shooter.streak.position.copy(shooter.from).addScaledVector(shooter.velocity, shooter.age);
      shooter.material.opacity = 0.9 * Math.sin(Math.PI * life);
    });
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let rotation = -selected * Math.PI * 2 / projects.length;
  let dragging = false;
  let dragged = false;
  let downX = 0;
  let previousX = 0;
  let manual = false;
  let mobile = false;
  let baseY = 0;
  selectInScene = (index) => {
    manual = false;
    const turn = Math.PI * 2, target = -index * turn / projects.length;
    const next = target + Math.round((rotation - target) / turn) * turn;
    if (!reducedMotion.matches) kickVelocity += Math.sign(next - rotation) * 0.5;
    rotation = next;
    sceneDirty = true;
  };
  function hitAt(event) {
    const bounds = galleryCanvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(clickable, false)[0];
  }
  galleryCanvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    dragging = true;
    dragged = false;
    downX = previousX = event.clientX;
    galleryCanvas.setPointerCapture(event.pointerId);
  });
  galleryCanvas.addEventListener('pointermove', (event) => {
    if (!dragging) { galleryCanvas.style.cursor = hitAt(event) ? 'pointer' : 'grab'; return; }
    if (Math.abs(event.clientX - downX) > 5) { dragged = true; manual = true; }
    rotation += (event.clientX - previousX) * 0.008;
    previousX = event.clientX;
    sceneDirty = true;
  });
  galleryCanvas.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    if (!dragged) { const hit = hitAt(event); if (hit) selectProject(hit.object.userData.index); }
    dragging = false;
  });
  galleryCanvas.addEventListener('pointercancel', () => { dragging = false; });
  let sized = false;
  let stageNdcX = 0.35;
  const cardScale = (index) => (mobile ? (index === selected ? 0.72 : 0.64) : (index === selected ? 0.84 : 0.72));
  function resize() {
    const { width, height } = galleryCanvas.getBoundingClientRect();
    mobile = width < 760;
    stage.visible = !mobile;
    baseY = mobile ? 1.1 : 1.9;
    const rigX = mobile ? 0.1 : 2.2;
    tiltRig.position.set(rigX, baseY, 0);
    stage.position.set(rigX, baseY, 0);
    cards.forEach(({ group }, index) => {
      const angle = index * Math.PI * 2 / projects.length;
      const radius = mobile ? 2.8 : 2.4;
      group.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      if (!sized) group.scale.setScalar(cardScale(index));
    });
    sized = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    cameraHome.set(0, mobile ? 1.65 : 1.5, mobile ? 13.3 : 10.6);
    camera.position.copy(cameraHome);
    camera.fov = mobile ? 42 : 37;
    camera.updateProjectionMatrix();
    stageNdcX = rigX / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * cameraHome.z * camera.aspect);
    const orbitHalfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (cameraHome.z - 2.2) * camera.aspect;
    craftCenter.set(Math.min(rigX + (mobile ? 1.1 : 1.6), orbitHalfWidth - (mobile ? 0.7 : 1)), baseY + 1.35, 2.2);
    craftRadius = mobile ? 0.5 : 0.8;
    layoutStars();
    sceneDirty = true;
  }
  resize();
  new ResizeObserver(resize).observe(portfolio);
  const pointerTarget = new THREE.Vector2(), pointerSmooth = new THREE.Vector2(), pointerRest = new THREE.Vector2();
  portfolio.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
    const bounds = portfolio.getBoundingClientRect();
    pointerTarget.set(THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1), THREE.MathUtils.clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1));
  });
  portfolio.addEventListener('pointerleave', () => pointerTarget.set(0, 0));

  function updateFlow(card, time) {
    const phase = (time + card.offset) % FLOW.cycle;
    card.borders.forEach((material, node) => {
      let glow = 0;
      if (node === 0) glow = pulseAt(phase - FLOW.starts[0]);
      else for (let slot = 0; slot < FLOW.packets; slot += 1) glow = Math.max(glow, pulseAt(phase - (FLOW.starts[node - 1] + FLOW.hop + slot * FLOW.stagger)));
      material.opacity = 0.16 + 0.84 * glow;
    });
    card.packets.forEach((packet) => {
      const progress = (phase - FLOW.starts[packet.hop] - packet.slot * FLOW.stagger) / FLOW.hop;
      const alive = progress > 0 && progress < 1;
      packet.group.visible = alive;
      if (!alive) return;
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);
      packet.group.position.x = cardX(packet.fromX + (packet.toX - packet.fromX) * eased);
      const fade = softstep(clamp01(progress / 0.2)) * (1 - softstep(clamp01((progress - 0.8) / 0.2)));
      packet.glowMaterial.opacity = fade;
      packet.trailMaterial.opacity = fade * 0.75;
      packet.group.scale.setScalar(0.75 + 0.5 * Math.sin(Math.PI * progress));
    });
  }
  const clock = new THREE.Clock();
  let elapsed = 0, angle = rotation, angleVelocity = 0, riseTime = 0, pulse = 0, pulseRingTime = 1, kick = 0, kickVelocity = 0;
  const flash = { index: 0, time: 1 };
  onProjectChange = (index) => {
    if (reducedMotion.matches) return;
    flash.index = index;
    flash.time = 0;
    pulse = 1;
    pulseRingTime = 0;
    sceneDirty = true;
  };
  function animate() {
    const delta = Math.min(clock.getDelta(), 0.05);
    if (visible && !document.hidden && (!reducedMotion.matches || sceneDirty)) {
      const calm = reducedMotion.matches;
      if (!calm) elapsed += delta;
      const bounds = portfolio.getBoundingClientRect();
      const scrollShift = THREE.MathUtils.clamp(-bounds.top / Math.max(1, bounds.height), -1, 1);
      pointerSmooth.lerp(calm ? pointerRest : pointerTarget, 1 - Math.exp(-delta * 4));
      if (manual && !dragging && !calm) rotation += delta * 0.025;
      if (calm) { angle = rotation; angleVelocity = 0; kick = kickVelocity = 0; }
      else {
        angleVelocity += ((rotation - angle) * 32 - angleVelocity * 8.2) * delta;
        angle += angleVelocity * delta;
        kickVelocity += (-kick * 60 - kickVelocity * 6) * delta;
        kick += kickVelocity * delta;
      }
      gallery.rotation.y = angle;
      tiltRig.rotation.set(pointerSmooth.y * 0.09, THREE.MathUtils.clamp((pointerSmooth.x - stageNdcX) * 0.6, -1, 1) * 0.2, kick + Math.sin(elapsed * 0.4) * 0.012);
      tiltRig.position.y = baseY + Math.sin(elapsed * 0.55) * 0.1;
      camera.position.set(cameraHome.x + pointerSmooth.x * 0.5, cameraHome.y - pointerSmooth.y * 0.22, cameraHome.z);
      if (flash.time < 1) flash.time = Math.min(1, flash.time + delta / 0.95);
      cards.forEach((card, index) => {
        const { group } = card;
        const target = cardScale(index);
        group.scale.setScalar(calm ? target : THREE.MathUtils.damp(group.scale.x, target, 6, delta));
        group.position.y = Math.sin(elapsed * 0.8 + index * 2.1) * (index === selected ? 0.15 : 0.12);
        if (!calm) updateFlow(card, elapsed);
        const active = flash.time < 1 && flash.index === index;
        card.scan.visible = card.sweep.visible = active;
        card.halo.material.opacity = 0.13 + (active ? 0.42 * (1 - flash.time) ** 2 : 0);
        if (active) {
          const sweepRun = clamp01(flash.time * 1.25);
          card.scanMaterial.opacity = 0.55 * (1 - flash.time) ** 1.3 * (0.75 + 0.25 * Math.sin(flash.time * 70));
          card.sweep.position.y = THREE.MathUtils.lerp(1.2, -1.2, 1 - (1 - sweepRun) ** 3);
          card.sweepMaterial.opacity = 0.9 * Math.sin(Math.PI * sweepRun);
        }
      });
      if (manual) {
        let nearest = 0, distance = Infinity;
        cards.forEach((_, index) => {
          const cardAngle = index * Math.PI * 2 / projects.length + gallery.rotation.y;
          const separation = Math.abs(Math.atan2(Math.sin(cardAngle), Math.cos(cardAngle)));
          if (separation < distance) { nearest = index; distance = separation; }
        });
        if (nearest !== selected) showProject(nearest);
      }
      pulse = Math.max(0, pulse - delta / 1.2);
      const energy = pulse * pulse;
      topMaterial.emissive.copy(topEmissive).lerp(topHot, energy);
      topMaterial.emissiveIntensity = 1 + 2.4 * energy;
      coneMaterial.opacity = 0.2 + 0.2 * energy + 0.03 * Math.sin(elapsed * 1.4);
      coneMap.offset.x = (elapsed * 0.012) % 1;
      arcRings.forEach((ring) => { ring.pivot.rotation.y = elapsed * ring.speed; ring.material.opacity = 0.7 + 0.25 * energy; });
      if (pulseRingTime < 1) {
        pulseRingTime = Math.min(1, pulseRingTime + delta / 0.9);
        pulseRing.visible = pulseRingTime < 1;
        pulseRing.scale.setScalar(1.5 + 1.7 * (1 - (1 - pulseRingTime) ** 3));
        pulseRingMaterial.opacity = 0.85 * (1 - pulseRingTime) ** 1.4;
      }
      if (!calm) riseTime += delta * (1 + 2.2 * energy);
      riseSeeds.forEach((seed, index) => {
        const life = (riseTime * seed.speed + seed.offset) % 1;
        const radius = (1.35 + 0.85 * life) * seed.spread, swirl = seed.angle + life * 1.4, fade = Math.sin(Math.PI * life) ** 1.3;
        risePositions[index * 3] = Math.cos(swirl) * radius;
        risePositions[index * 3 + 1] = -1.62 + life * 3.5;
        risePositions[index * 3 + 2] = Math.sin(swirl) * radius;
        riseColors[index * 3] = 0.4 * fade;
        riseColors[index * 3 + 1] = fade;
        riseColors[index * 3 + 2] = 0.7 * fade;
      });
      riseGeometry.attributes.position.needsUpdate = true;
      riseGeometry.attributes.color.needsUpdate = true;
      starLayers.forEach((layer, index) => {
        layer.points.position.y = -scrollShift * layer.shift;
        layer.points.material.opacity = layer.opacity * (0.84 + 0.16 * Math.sin(elapsed * (0.5 + index * 0.23) + index * 2));
      });
      updateCraft(elapsed, calm);
      if (!calm) updateShooters(delta);
      particles.rotation.y = elapsed * 0.006;
      galleryCanvas.dataset.pulse = pulse.toFixed(2);
      galleryCanvas.dataset.flash = flash.time.toFixed(2);
      galleryCanvas.dataset.angle = angle.toFixed(2);
      galleryCanvas.dataset.flow = ((elapsed + cards[0].offset) % FLOW.cycle).toFixed(2);
      galleryCanvas.dataset.craft = `${craft.position.x.toFixed(1)},${craft.position.y.toFixed(1)}`;
      renderer.render(scene, camera);
      sceneDirty = false;
    }
    requestAnimationFrame(animate);
  }
  portfolio.dataset.gallery = 'ready';
  animate();
}

new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) sceneDirty = true; }).observe(portfolio);
const loadObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting || started) return;
  started = true;
  loadObserver.disconnect();
  initializeGallery().catch((error) => {
    console.warn('Project gallery unavailable; project links remain active.', error);
    portfolio.dataset.gallery = 'fallback';
    galleryCanvas.hidden = true;
    const message = document.createElement('p');
    message.className = 'scene-error';
    message.textContent = 'The 3D preview is unavailable. You can still explore every project below.';
    portfolio.append(message);
  });
}, { rootMargin: '400px' });
loadObserver.observe(portfolio);