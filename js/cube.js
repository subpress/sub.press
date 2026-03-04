import * as THREE from 'three';
import { OrbitControls }      from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const wrap = document.getElementById('hero-canvas-wrap');
const W = () => wrap.clientWidth;
const H = () => wrap.clientHeight;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
wrap.appendChild(renderer.domElement);

// Scene & camera
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100);
camera.position.set(0, 0.5, 7);

// Controls — fully interactive, canvas takes all pointer events
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.05;
controls.enableZoom      = false;
controls.enablePan       = false;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.45;
controls.minPolarAngle   = Math.PI * 0.18;
controls.maxPolarAngle   = Math.PI * 0.72;

// Responsive: scale cube + camera target
// Desktop: cube oversized (scale 1.2, centred)
// Tablet:  scale 0.85, centred
// Mobile:  scale 1.4, shifted right so left ~30% of screen is clear,
//          cube bleeds off the right edge (hero overflow:hidden clips it)
let cubeGroup;
let currentScale = 1.2;
function applyResponsive() {
  if (!cubeGroup) return;
  const w = W();
  if (w <= 600) {
    currentScale = 1.4;
    controls.target.set(-1.2, 0, 0);
  } else if (w <= 900) {
    currentScale = 0.85;
    controls.target.set(0, 0, 0);
  } else {
    currentScale = 1.2;
    controls.target.set(0, 0, 0);
  }
  cubeGroup.scale.setScalar(currentScale);
  controls.update();
}

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(6, 10, 8);
key.castShadow = true;
key.shadow.mapSize.setScalar(1024);
Object.assign(key.shadow.camera, { near:1, far:30, left:-5, right:5, top:5, bottom:-5 });
scene.add(key);
const fill = new THREE.DirectionalLight(0xfffde7, 0.6);
fill.position.set(-5, 3, -4);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffeb3b, 0.25);
rim.position.set(0, -5, -5);
scene.add(rim);

const TEX = 512, BG = '#131313', GLYPH_SCALE = 0.62;

// Inline SVG data — base64 encoded so drawImage works reliably everywhere
const SVG_RAW = {
  S: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#ffffff" d="M250.53,456.01c-76.79-1.23-170.39-9.07-219.6-72.89-26.62-42.37.72-54.09,41.88-53.52,26.31-.04,53.57-.78,79.79,1.08,36.8,2.43,69.49,18.96,106.61,16.84,13.49-.03,41.37-9.35,21.58-22.04-20.18-12.12-65.05-13.92-92.39-18.78-40.48-6.21-77.2-14.48-110.6-34.22-55.63-30.69-67.59-101.01-22.11-146.02,26.51-26.73,64.42-41.42,100.84-49.84,88.66-17.22,194.56-13.69,271.87,38.25,19.96,13.14,58.49,54.7,25.29,70.56-15.61,6.6-47.25,4.94-76.47,5.2-23.97.23-53.05-.26-72.53-4.53-19.46-3.95-50.2-11.56-66.26-5.46-5.36,1.6-10.36,6.85-5.76,12.09,4.72,7.75,33.08,14.71,51.56,16.6,66.23,10.05,138.82,11.56,186.78,61.59,23.29,26.54,27.04,67.26,10.22,98.19-42.68,72.97-150.56,85.64-229.46,86.89h-1.25Z"/></svg>`,
  U: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#ffffff" d="M256.1,456.15c-81.09-.24-188.5-17.38-220.32-101.84-13.42-35.18-10.25-66.5-10.75-105.21,0-34.87,0-81.54,0-113.29,1-36.9-1.71-56.72,36.88-61,33.52-2.42,76.56-3.46,111.15,1.02,24.18,2.76,29.23,20.18,29.91,42.98.62,28.09.1,57.56.27,86.22.13,26.27-.34,56.89.34,80.18-.94,34.15,20,57.02,52.41,57.41,32.42-.42,53.35-23.23,52.41-57.41.67-23.31.21-53.88.34-80.17.16-28.66-.35-58.13.26-86.22.66-22.73,5.74-40.25,29.91-42.97,34.57-4.49,77.68-3.45,111.15-1.02,38.6,4.28,35.87,24.11,36.88,61,0,31.76,0,78.43,0,113.29-.47,38.71,2.67,70.06-10.76,105.22-31.81,84.09-138.23,101.56-218.92,101.83h-1.18Z"/></svg>`,
  B: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#ffffff" d="M50.87,439.85c-24.75-10.97-14.35-49.45-16.57-77.65,0-74.56,0-197.63,0-249.17-2.39-43.09,20.13-45.89,57.25-45.87,85.5,2.06,188.91-5.43,277.4,6.04,48.66,7.37,105.06,30.12,116.27,83,5.28,21.79-1.15,45.46-14.57,62.74-8.85,12.43-15.95,21.58-14.12,30.57.96,7.73,10.97,18.14,18.74,26.73,29.46,29.21,29.92,78.77,4.04,110.46-56.38,64.99-158.42,56.72-237.11,58.11-33.44,0-78.7,0-115.16,0-29.87-.83-52.78,2.81-75.65-4.73l-.53-.22ZM218.02,203.38c4.93,4.99,14.88,5.62,26.19,5.65,16.83-.42,36.59,1.2,49.52-8.99,8.34-6.48,10.47-18.79,3.61-27.07-12.62-16.35-48.44-13.73-69.13-11.79-18.26,2.21-19.6,29.73-10.74,41.65l.55.56ZM218.2,345.71c5.35,5.46,16.13,6.23,28.46,6.28,11.94-.01,25.16,0,35.59-1.69,19.8-1.39,38.63-21.15,23.32-38.38-8.17-9.57-24.13-12.34-43.21-12.63-18.53-.17-37.51-1.44-44.72,7.29-7.67,10.21-7.7,28.72,0,38.56l.56.57Z"/></svg>`,
  logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#ffffff" d="M488.77,392.48c.25,7.68-.25,18.47-1.21,26.5-.96,7.51-2.62,14.7-7.16,20.73-13.19,16.02-36.61,15.32-55.87,15.64-39.08.55-78.81.86-117.15.96-9.97-.07-10.29-1.04.88-5.36,10.1-3.97,24.14-9.49,35.46-13.94,34.71-13.64,68.25-26.82,102.81-40.4,11.06-4.11,25.62-10.63,34.91-13.25,5.3-1.2,7,1.85,7.32,8.83v.28Z"/><path fill="#ffffff" d="M253.81,71.03c1.11-3.95,5.02-4,8.47-3.99,7.56,0,22.84.08,34.02.12,37.05.15,78.35.38,114.67.73,2.42.2,15.54-.45,12.67,1.76-31.9,12.53-68.1,23.84-99.45,35.22-18.93,6.52-42.47,14.97-61.67,21.42-11.59,4.45-9.57-8.6-9.94-19.02.43-11.7-1.1-24.77,1.16-36.06l.06-.18Z"/><path fill="#ffffff" d="M80.11,69.28c-13.41-.82-28.02.81-40.07,7.28-18.05,9.61-15.94,35.12-16.78,53.46-.23,34.25.01,87.23-.07,125.85-.08,27.29.03,94,.03,118.55.05,3.77.26,7.19,3.82,9,21.34,9.34,60.03,23.31,84.9,33.31,22.81,9.03,50.78,19.56,79.59,30.86,14.61,5.95,21.34,7.95,34.51,8.03,10.4-.33,27.01,3.31,28.55-11.31,1.04-87.47.01-208.94.36-296.89.03-9.11.71-19-8.96-22.49-16.07-6.33-44.99-15.54-62.33-21.77-26.89-9.4-59.75-20.5-87.65-30.18-5.17-1.75-10.37-3.16-15.66-3.68l-.24-.02ZM186.68,364.73c-8.12,22.47-27.49,31.32-49.72,21.74-36.93-16.58-58.25-61.35-68.86-98.96-9.54-36.72-11.41-76.23.76-112.3,5.59-16.09,15.51-33.79,30.37-42.53,14.74-8.59,32.8-2.22,43.89,9.8,10.65,11.02,17.68,25.19,23.77,39.13,19.45,43.14,34.83,136.84,19.9,182.82l-.11.3Z"/><path fill="#ffffff" d="M117.87,185c-13.55,2.96-21.17,17.79-25.01,30.25-9.85,35.37-1.58,76.02,19.55,105.59,11.35,16.32,37.12,32.23,50,8.8,8.14-16.68,5.59-37.12,4.27-55.27-2.47-25.11-15.27-92.9-48.53-89.43l-.28.05Z"/><path fill="#ffffff" d="M447.7,203.57c-3.91-33.74-28.98-93.42-71.05-69.19-38.52,25.64-54.82,109.8-58.24,155-1.21,14.91-1.64,30.72-.72,45.22.67,10.3,1.79,20.29,5.44,29.99,11.98,32.98,43.2,31.28,67.84,10.83,9.61-7.85,17.46-17.58,24.09-27.61,27.11-41.46,39.01-94.82,32.7-143.91l-.05-.34ZM393.43,319.39c-9.88,12.09-29.45,22.17-40.3,6.24-12.33-19-5.18-59.95-.49-81.73,4.68-17.67,13.96-49.11,34.99-51.51,20.95.24,28.38,28,29.98,45.14,2.17,28.61-5.77,59.45-23.97,81.61l-.22.25Z"/></svg>`,
};

function svgToTexture(key) {
  return new Promise(resolve => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = TEX;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, TEX, TEX);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 5;
    const p = TEX * 0.04;
    ctx.beginPath(); ctx.roundRect(p, p, TEX-p*2, TEX-p*2, p*0.5); ctx.stroke();
    const img = new Image();
    img.onload = () => {
      const sz = TEX * GLYPH_SCALE, off = (TEX - sz) / 2;

      function recolour(colour) {
        const oc = document.createElement('canvas');
        oc.width = oc.height = TEX;
        const ox = oc.getContext('2d');
        ox.drawImage(img, off, off, sz, sz);
        ox.globalCompositeOperation = 'source-in';
        ox.fillStyle = colour;
        ox.fillRect(0, 0, TEX, TEX);
        return oc;
      }

      // 1. Shadow — black, offset down-right
      ctx.globalAlpha = 0.7;
      ctx.drawImage(recolour('#000000'), 5, 6);

      // 2. Highlight — white, offset up-left
      ctx.globalAlpha = 0.25;
      ctx.drawImage(recolour('#ffffff'), -2, -2);

      // 3. Glyph — muted grey, full opacity
      ctx.globalAlpha = 1;
      ctx.drawImage(recolour('#222222'), 0, 0);

      resolve(new THREE.CanvasTexture(cv));
    };
    img.onerror = () => resolve(new THREE.CanvasTexture(cv));
    img.src = `data:image/svg+xml;base64,${btoa(SVG_RAW[key])}`;
  });
}

const mat = tex => new THREE.MeshStandardMaterial({
  map: tex, color: new THREE.Color('#ffffff'), roughness: 0.35, metalness: 0.5
});

// Load textures then build
Promise.all([
  svgToTexture('S'),
  svgToTexture('U'),
  svgToTexture('B'),
  svgToTexture('logo'),
]).then(([S, U, B, logo]) => {
  const tx = { S, U, B, logo };
  // Cycle through all 4 glyphs for any given face list
  const G = [tx.S, tx.U, tx.B, tx.logo];
  const g = i => G[i % 4];

  const DIE = 0.88, GAP = 0.065, STEP = DIE + GAP, HH = STEP / 2;
  const geo = new RoundedBoxGeometry(DIE, DIE, DIE, 5, 0.065);

  // Face order per die: [+X right, -X left, +Y top, -Y bot, +Z front, -Z back]
  // Front face (f) drives the landing layout: S top-left, logo top-right, U bot-left, B bot-right
  // All other visible faces get a different glyph from the set — no blanks on outer faces
  const dies = [
    // pos              right    left     top      bot      front    back
    { pos:[-HH, HH, HH], faces:[g(1), g(2), g(3), g(0), tx.S,    g(2)] }, // top-left:  S front
    { pos:[ HH, HH, HH], faces:[g(0), g(3), g(1), g(2), tx.logo, g(3)] }, // top-right: logo front
    { pos:[-HH,-HH, HH], faces:[g(3), g(0), g(2), g(1), tx.U,    g(0)] }, // bot-left:  U front
    { pos:[ HH,-HH, HH], faces:[g(2), g(1), g(0), g(3), tx.B,    g(1)] }, // bot-right: B front
    { pos:[-HH, HH,-HH], faces:[g(0), g(1), g(2), g(3), g(1),    tx.U ] },
    { pos:[ HH, HH,-HH], faces:[g(3), g(2), g(0), g(1), g(2),    tx.B ] },
    { pos:[-HH,-HH,-HH], faces:[g(1), g(3), g(3), g(2), g(3),    tx.S ] },
    { pos:[ HH,-HH,-HH], faces:[g(2), g(0), g(1), g(0), g(0),    tx.logo]},
  ];

  cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  const meshes = dies.map(({ pos, faces }) => {
    const m = new THREE.Mesh(geo, faces.map(t => mat(t)));
    m.position.set(...pos);
    m.castShadow = m.receiveShadow = true;
    m.userData.gx = Math.sign(pos[0]);
    m.userData.gy = Math.sign(pos[1]);
    m.userData.gz = Math.sign(pos[2]);
    cubeGroup.add(m);
    return m;
  });

  // Twist animation
  let twisting = false;
  const LAYERS = [
    { axis: new THREE.Vector3(0,1,0), coord:'gy', val: 1 },
    { axis: new THREE.Vector3(0,1,0), coord:'gy', val:-1 },
    { axis: new THREE.Vector3(1,0,0), coord:'gx', val: 1 },
    { axis: new THREE.Vector3(1,0,0), coord:'gx', val:-1 },
    { axis: new THREE.Vector3(0,0,1), coord:'gz', val: 1 },
    { axis: new THREE.Vector3(0,0,1), coord:'gz', val:-1 },
  ];
  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  function twist() {
    if (twisting) return;
    twisting = true;
    const layer = LAYERS[Math.floor(Math.random() * LAYERS.length)];
    const angle = (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
    const group = meshes.filter(m => m.userData[layer.coord] === layer.val);
    const pivot = new THREE.Group();
    cubeGroup.add(pivot);
    group.forEach(m => {
      const p = m.position.clone(), q = m.quaternion.clone();
      cubeGroup.remove(m); pivot.add(m);
      m.position.copy(p); m.quaternion.copy(q);
    });
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion().setFromAxisAngle(layer.axis, angle);
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min((now - t0) / 800, 1);
      pivot.quaternion.slerpQuaternions(q0, q1, ease(t));
      if (t < 1) { requestAnimationFrame(step); return; }
      const cqInv = new THREE.Quaternion();
      cubeGroup.getWorldQuaternion(cqInv); cqInv.invert();
      group.forEach(m => {
        const wp = new THREE.Vector3(), wq = new THREE.Quaternion();
        m.getWorldPosition(wp); m.getWorldQuaternion(wq);
        pivot.remove(m); cubeGroup.add(m);
        cubeGroup.worldToLocal(wp); m.position.copy(wp);
        m.quaternion.copy(cqInv.clone().multiply(wq));
        const gv = new THREE.Vector3(m.userData.gx, m.userData.gy, m.userData.gz);
        gv.applyQuaternion(q1);
        m.userData.gx = Math.round(gv.x);
        m.userData.gy = Math.round(gv.y);
        m.userData.gz = Math.round(gv.z);
      });
      cubeGroup.remove(pivot);
      twisting = false;
    })(t0);
  }

  setTimeout(() => { twist(); setInterval(twist, 4000); }, 1800);

  // Apply responsive scale/offset now
  applyResponsive();

  // Scroll bounce — spring physics on cubeGroup Y position
  const bounce = { pos: 0, vel: 0, stiffness: 180, damping: 14 };
  const baseY = cubeGroup.position.y;

  window.addEventListener('wheel', e => {
    const hero = document.getElementById('hero');
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const kick = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.003, 0.18);
    bounce.vel -= kick;
  }, { passive: true });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
    applyResponsive();
  });

  // Render loop
  let lastT = performance.now();
  (function animate(now) {
    requestAnimationFrame(animate);

    // Spring step (semi-fixed timestep)
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const force = -bounce.stiffness * bounce.pos - bounce.damping * bounce.vel;
    bounce.vel += force * dt;
    bounce.pos += bounce.vel * dt;

    // Apply bounce Y offset and squash/stretch on top of responsive scale
    if (cubeGroup) {
      cubeGroup.position.y = bounce.pos * currentScale;
      const squash = 1 - bounce.pos * 0.18;
      const stretch = 1 + bounce.pos * 0.18;
      cubeGroup.scale.set(currentScale * squash, currentScale * stretch, currentScale * squash);
    }

    controls.update();
    renderer.render(scene, camera);
  })(performance.now());
});
