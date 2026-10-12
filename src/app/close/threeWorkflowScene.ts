import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { StageKey } from './WorkflowIllustration';

export type SceneStage = { key: StageKey; color: string; status: string };
export type WorkflowSceneController = {
  select: (key: StageKey | null) => void;
  updateStages: (stages: SceneStage[]) => void;
  setTouring: (touring: boolean) => void;
  setPaused: (paused: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  dispose: () => void;
};
const POSITIONS: Record<StageKey, [number, number]> = {
  warehouse: [-4.2, 2.1], cost: [-4.2, -2.7], receivables: [0.3, -2.7],
  accounting: [4.7, -2.7], report: [4.7, 2.1],
};
const ORDER: StageKey[] = ['warehouse', 'cost', 'receivables', 'accounting', 'report'];
const palette = {
  white: '#f9fcfa', paper: '#e9f3f1', pale: '#dbe9e8', glass: '#8bb8c9',
  navy: '#244c68', teal: '#5c9b9d', blue: '#3b8bb6', amber: '#dbad6d',
  shadow: '#9cbabf', ink: '#33566d', ground: '#d8e9e6',
};

function mat(color: string, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness });
}

function box(parent: THREE.Object3D, size: [number, number, number], color: string, position: [number, number, number], options?: { metalness?: number; rotationY?: number }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color, options?.metalness));
  mesh.position.set(...position);
  if (options?.rotationY) mesh.rotation.y = options.rotationY;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, color: string, position: [number, number, number], segments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), mat(color));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function gable(parent: THREE.Object3D, width: number, height: number, depth: number, color: string, y: number, z: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(0, height);
  shape.lineTo(width / 2, 0);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat(color));
  mesh.position.set(0, y, z - depth / 2);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function freightBox(parent: THREE.Object3D, x: number, y: number, z: number, size = 0.31) {
  box(parent, [size, size, size], palette.amber, [x, y, z]);
  box(parent, [size + 0.008, 0.028, 0.025], '#f4ddb7', [x, y + size / 2 - 0.04, z + size / 2 + 0.01]);
  box(parent, [0.026, size + 0.008, 0.025], '#f4ddb7', [x, y, z + size / 2 + 0.011]);
}

function warehouse(parent: THREE.Group) {
  box(parent, [1.76, 1.06, 1.18], '#a5d3d0', [0, 0.68, -0.12]);
  box(parent, [0.65, 0.67, 0.045], palette.navy, [-0.35, 0.47, 0.492]);
  for (let i = 0; i < 5; i++) box(parent, [0.68, 0.014, 0.051], '#8ab5c4', [-0.35, 0.21 + i * 0.11, 0.522]);
  box(parent, [0.37, 0.4, 0.04], '#4b9da9', [0.52, 0.67, 0.494]);
  box(parent, [1.94, 0.07, 1.36], '#1e7896', [0, 1.23, -0.12]);
  gable(parent, 1.94, 0.4, 1.36, '#388eaa', 1.26, -0.12);
  box(parent, [0.89, 0.02, 0.025], '#b3cdcf', [-0.45, 1.48, 0.56]);
  box(parent, [0.89, 0.02, 0.025], '#b3cdcf', [0.45, 1.48, 0.56]);
  box(parent, [0.86, 0.09, 0.25], '#98acb1', [-0.36, 0.14, 0.7]);
  freightBox(parent, 0.6, 0.28, 0.86);
  freightBox(parent, 0.96, 0.21, 0.76, 0.24);
  freightBox(parent, 0.58, 0.58, 0.86, 0.24);
}

function factory(parent: THREE.Group) {
  box(parent, [1.85, 0.78, 1.28], '#f0c8aa', [0, 0.51, -0.1]);
  box(parent, [1.95, 0.09, 1.35], '#d77356', [0, 0.95, -0.1]);
  for (const x of [-0.51, 0, 0.51]) {
    gable(parent, 0.57, 0.29, 1.36, '#e99972', 0.99, -0.1).position.x = x;
    box(parent, [0.35, 0.33, 0.025], palette.glass, [x, 0.56, 0.555]);
  }
  cylinder(parent, 0.16, 0.18, 1.47, '#bd6559', [-0.53, 1.45, -0.34]);
  cylinder(parent, 0.19, 0.19, 0.08, palette.white, [-0.53, 2.22, -0.34]);
  cylinder(parent, 0.12, 0.14, 1.06, '#db8b65', [0.51, 1.25, -0.38]);
  cylinder(parent, 0.16, 0.16, 0.07, palette.white, [0.51, 1.81, -0.38]);
  box(parent, [0.69, 0.12, 0.27], palette.navy, [0.57, 0.23, 0.89]);
  for (const x of [0.34, 0.57, 0.8]) cylinder(parent, 0.095, 0.095, 0.075, palette.amber, [x, 0.35, 0.89]);
}

function receivables(parent: THREE.Group) {
  box(parent, [1.78, 0.79, 1.15], '#e5d39f', [0, 0.59, -0.22]);
  box(parent, [1.91, 0.12, 1.35], '#d6ad59', [0, 1.05, -0.13]);
  gable(parent, 1.95, 0.42, 1.35, '#eac771', 1.11, -0.13);
  box(parent, [1.95, 0.12, 0.38], '#d0ab61', [0, 0.22, 0.72]);
  box(parent, [1.55, 0.09, 0.35], '#be9654', [0, 0.13, 0.99]);
  for (const x of [-0.59, -0.2, 0.2, 0.59]) {
    cylinder(parent, 0.085, 0.085, 0.69, palette.white, [x, 0.67, 0.46], 12);
    box(parent, [0.23, 0.1, 0.22], '#f5faf5', [x, 1.04, 0.46]);
    box(parent, [0.23, 0.1, 0.22], '#f5faf5', [x, 0.28, 0.46]);
  }
  cylinder(parent, 0.16, 0.16, 0.09, '#d7a963', [0.83, 0.27, 0.96]);
  cylinder(parent, 0.16, 0.16, 0.09, '#ecc47e', [0.83, 0.37, 0.96]);
  cylinder(parent, 0.16, 0.16, 0.09, '#d7a963', [0.83, 0.47, 0.96]);
}

function accounting(parent: THREE.Group) {
  box(parent, [1.32, 1.96, 1.19], '#7598c3', [0, 1.16, -0.17], { metalness: 0.12 });
  box(parent, [1.44, 0.13, 1.29], '#395f93', [0, 2.17, -0.17]);
  for (const y of [0.67, 1.28, 1.89]) {
    box(parent, [1.45, 0.09, 1.32], '#dce6f1', [0, y, -0.17]);
    for (const x of [-0.42, 0, 0.42]) box(parent, [0.28, 0.32, 0.025], '#375f88', [x, y + 0.3, 0.438]);
    for (const z of [-0.52, -0.16, 0.2]) box(parent, [0.025, 0.32, 0.25], '#4979a2', [0.675, y + 0.3, z]);
  }
  box(parent, [0.36, 0.52, 0.05], palette.navy, [0, 0.37, 0.46]);
  box(parent, [0.67, 0.1, 0.58], palette.paper, [0.89, 0.24, 0.69], { rotationY: -0.24 });
  box(parent, [0.63, 0.02, 0.54], palette.white, [0.89, 0.3, 0.69], { rotationY: -0.24 });
  for (const z of [0.56, 0.7, 0.84]) box(parent, [0.4, 0.012, 0.016], '#93b6bd', [0.9, 0.315, z], { rotationY: -0.24 });
}

function report(parent: THREE.Group) {
  box(parent, [1.56, 0.12, 1.42], '#947dbb', [0, 0.15, 0]);
  box(parent, [1.23, 1.54, 0.13], '#d1c4e4', [0.2, 1.04, -0.18], { rotationY: -0.11 });
  box(parent, [1.23, 1.54, 0.13], palette.white, [-0.08, 1.07, 0.04], { rotationY: -0.11 });
  for (const x of [-0.48, -0.2, 0.08, 0.36]) {
    const h = 0.35 + (x + 0.48) * 0.4;
    box(parent, [0.13, h, 0.032], x === 0.36 ? '#e79067' : x === 0.08 ? '#8d75b8' : '#369abd', [x, 0.55 + h / 2, 0.135], { rotationY: -0.11 });
  }
  for (const y of [1.45, 1.32]) box(parent, [0.75, 0.027, 0.033], '#bed2d4', [-0.08, y, 0.138], { rotationY: -0.11 });
  box(parent, [0.96, 0.025, 0.032], '#bed2d4', [-0.08, 0.49, 0.138], { rotationY: -0.11 });
  const seal = cylinder(parent, 0.25, 0.25, 0.075, '#e4a766', [0.55, 0.55, 0.2], 24);
  seal.rotation.x = Math.PI / 2;
  box(parent, [0.19, 0.04, 0.03], palette.white, [0.55, 0.57, 0.25], { rotationY: -0.3 });
  box(parent, [0.1, 0.04, 0.03], palette.white, [0.48, 0.52, 0.25], { rotationY: 0.5 });
}

// Merge static geometry by material so the miniature stays inexpensive to render.
function mergeStatic(root: THREE.Group) {
  root.updateMatrixWorld(true);
  const buckets = new Map<string, { material: THREE.MeshStandardMaterial; geometries: THREE.BufferGeometry[] }>();
  const originals: THREE.Mesh[] = [];
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || !(object.material instanceof THREE.MeshStandardMaterial)) return;
    const key = `${object.material.color.getHex()}:${object.material.metalness}`;
    let bucket = buckets.get(key);
    if (!bucket) { bucket = { material: object.material, geometries: [] }; buckets.set(key, bucket); }
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    if (geometry.index) {
      const expanded = geometry.toNonIndexed(); geometry.dispose(); bucket.geometries.push(expanded);
    } else bucket.geometries.push(geometry);
    originals.push(object);
  });
  const retainedMaterials = new Set([...buckets.values()].map(bucket => bucket.material));
  originals.forEach(mesh => {
    mesh.removeFromParent(); mesh.geometry.dispose();
    if (!retainedMaterials.has(mesh.material as THREE.MeshStandardMaterial)) (mesh.material as THREE.Material).dispose();
  });
  buckets.forEach(({ material, geometries }) => {
    const merged = mergeGeometries(geometries);
    geometries.forEach(geometry => geometry.dispose());
    if (!merged) return;
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
  });
}

function tree(parent: THREE.Group, x: number, z: number, scale = 1) {
  cylinder(parent, .045 * scale, .07 * scale, .6 * scale, '#7e8b76', [x, .28 * scale, z], 6);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.39 * scale, 0), mat('#8da78c'));
  crown.position.set(x, .8 * scale, z); crown.scale.y = 1.25; crown.castShadow = true; parent.add(crown);
}
function lamp(parent: THREE.Group, x: number, z: number) {
  cylinder(parent, .025, .025, .95, '#73877e', [x, .4, z], 6);
  box(parent, [.22, .06, .12], '#fff4d2', [x + .08, .89, z]);
}
function makeTruck() {
  const root = new THREE.Group();
  box(root, [.38, .16, .85], '#4d655d', [0, .13, 0]);
  box(root, [.4, .33, .3], '#d87b53', [0, .35, -.27]);
  box(root, [.33, .14, .02], '#86aaab', [0, .4, -.43]);
  box(root, [.42, .43, .53], '#f3efde', [0, .39, .2]);
  for (const x of [-.22, .22]) for (const z of [-.27, .25]) {
    const wheel = cylinder(root, .1, .1, .07, '#42564e', [x, .11, z], 10); wheel.rotation.z = Math.PI / 2;
  }
  mergeStatic(root); return root;
}
function createStage(stage: SceneStage) {
  const root = new THREE.Group();
  box(root, [3.3, .16, 3.1], '#b7c7b2', [0, -.13, 0]);
  box(root, [3.18, .08, 2.98], '#e6e9dc', [0, -.01, 0]);
  if (stage.key === 'warehouse') {
    warehouse(root);
    for (let i = 0; i < 3; i++) {
      box(root, [.43, .45, 1.1], i === 1 ? '#8aa5a0' : '#d4b89a', [-1.16, .27 + i * .08, -.85 + i * .9]);
      for (let n = 0; n < 5; n++) box(root, [.01, .38, .018], '#b6c2b6', [-.939, .29 + i * .08, -1.25 + i * .9 + n * .18]);
    }
  }
  if (stage.key === 'cost') factory(root);
  if (stage.key === 'receivables') receivables(root);
  if (stage.key === 'accounting') accounting(root);
  if (stage.key === 'report') {
    report(root);
    box(root, [.58, .42, .5], '#d4d8c3', [-1.05, .25, -.55]);
    box(root, [.58, .8, .5], '#8ba9a0', [-1.05, .44, .1]);
    box(root, [.58, 1.15, .5], '#4f8274', [-1.05, .62, .75]);
  }
  tree(root, 1.26, -.95, .8); tree(root, -1.3, 1.13, .62);
  lamp(root, 1.36, 1.08);
  mergeStatic(root);
  const marker = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.66, 64), new THREE.MeshBasicMaterial({ color: stage.color, transparent: true, opacity: .8, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2; marker.position.y = -.025; root.add(marker);
  root.userData.marker = marker;
  root.userData.stageKey = stage.key;
  root.position.set(POSITIONS[stage.key][0], 0, POSITIONS[stage.key][1]);
  return root;
}

type SceneCallbacks = { onSelect: (key: StageKey) => void; onInteraction: () => void; onContextLost: () => void };
export function createWorkflowScene(host: HTMLElement, stages: SceneStage[], callbacks: SceneCallbacks): WorkflowSceneController {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#eeeee5');
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 120);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'close-world__webgl';
  host.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .075;
  controls.enablePan = false; controls.rotateSpeed = .55; controls.zoomSpeed = .65;
  controls.minPolarAngle = .25; controls.maxPolarAngle = Math.PI / 2.5;
  controls.minDistance = 6; controls.maxDistance = 38;
  scene.add(new THREE.HemisphereLight('#fff7e4', '#a2b5a1', 2.4));
  const sun = new THREE.DirectionalLight('#fff1d9', 3.1);
  sun.position.set(-9, 16, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 45 });
  sun.shadow.normalBias = .045; scene.add(sun);

  const landscape = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(8.9, 9.15, .45, 64), mat('#b6c6b0'));
  ground.scale.z = .79; ground.position.set(.25, -.48, -.3); ground.receiveShadow = true; landscape.add(ground);
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(8.85, 8.85, .08, 64), mat('#d3dcc6'));
  grass.scale.z = .79; grass.position.set(.25, -.22, -.3); grass.receiveShadow = true; landscape.add(grass);
  // A road loop connects all five departments, with a small central garden.
  box(landscape, [13.2, .035, 1.0], '#aebbad', [.25, -.15, 4.15]);
  box(landscape, [13.2, .035, 1.0], '#aebbad', [.25, -.15, -4.8]);
  box(landscape, [1.0, .035, 9.0], '#aebbad', [-6.35, -.15, -.32]);
  box(landscape, [1.0, .035, 9.0], '#aebbad', [6.85, -.15, -.32]);
  for (let x = -5.8; x < 6.5; x += .7) for (const z of [4.15, -4.8]) box(landscape, [.33, .014, .035], '#f3f2e3', [x, -.12, z]);
  for (let z = -4.4; z < 4; z += .7) for (const x of [-6.35, 6.85]) box(landscape, [.035, .014, .33], '#f3f2e3', [x, -.12, z]);
  box(landscape, [5.5, .08, 2.0], '#bdccb3', [.35, -.1, 1.05]);
  box(landscape, [4.7, .014, .25], '#ebe9dc', [.35, -.049, 1.05]);
  for (const x of [-1.2, 0, 1.2]) { tree(landscape, x, .4, 1.1); tree(landscape, x, 1.7, .9); }
  for (const [x, z, s] of [[-7.4, -2, .8], [-7.2, 1, 1], [-5, 5.3, .8], [-3, 5.4, 1], [0, 5.4, .85], [2.2, 5.3, 1.1], [5, 5.1, .75], [7.7, 1.3, 1], [7.6, -1.7, .9], [4, -5.7, .8], [1, -5.8, 1], [-3, -5.8, .75]]) tree(landscape, x, z, s);
  for (const x of [-5.3, -1.8, 2, 5.7]) lamp(landscape, x, 3.5);
  mergeStatic(landscape); scene.add(landscape);
  const roots = new Map<StageKey, THREE.Group>();
  stages.forEach(stage => { const root = createStage(stage); roots.set(stage.key, root); scene.add(root); });
  const trucks = [makeTruck(), makeTruck()]; trucks.forEach(truck => scene.add(truck));
  const dataRoutes = ORDER.slice(0, -1).map((key, index) => {
    const a = POSITIONS[key], b = POSITIONS[ORDER[index + 1]];
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(a[0], .05, a[1]), new THREE.Vector3((a[0] + b[0]) / 2, .06, (a[1] + b[1]) / 2), new THREE.Vector3(b[0], .05, b[1])]);
    const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, .024, 5, false), mat('#73a99b'));
    scene.add(line);
    const packet = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#e18b58' })); scene.add(packet);
    return { curve, packet };
  });
  const labels = new Map<StageKey, HTMLElement>();
  host.parentElement?.querySelectorAll<HTMLElement>('.close-world__hotspot[data-stage-key]').forEach(label => labels.set(label.dataset.stageKey as StageKey, label));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected: StageKey | null = null, hovered: StageKey | null = null;
  let paused = motion.matches, touring = false, tourElapsed = 0, elapsed = 0;
  let inViewport = false, lastFrame = 0, disposed = false, contextLost = false;
  let transition: { start: number; from: THREE.Vector3; fromTarget: THREE.Vector3; to: THREE.Vector3; toTarget: THREE.Vector3 } | null = null;
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let pointerDown: { x: number; y: number; id: number } | null = null;
  const activePointers = new Set<number>();

  function frameCamera() {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height); camera.aspect = width / height;
    const compact = width < 680;
    controls.maxDistance = compact ? 65 : 38;
    camera.setViewOffset(width, height, compact ? -width * .02 : -width * .17, compact ? -height * .16 : -height * .025, width, height);
    camera.updateProjectionMatrix();
  }
  function preset(key: StageKey | null) {
    const compact = host.clientWidth < 680;
    const point = key ? POSITIONS[key] : [.25, -.3];
    const target = new THREE.Vector3(point[0], key ? .6 : 0, point[1]);
    const distance = key ? (compact ? 14 : 10.7) : (compact ? 52 : 23);
    const offset = new THREE.Vector3(.8, .85, 1.25).normalize().multiplyScalar(distance);
    return { target, position: target.clone().add(offset) };
  }
  function select(key: StageKey | null, immediate = false) {
    selected = key;
    const view = preset(key);
    if (immediate || motion.matches) {
      transition = null; camera.position.copy(view.position); controls.target.copy(view.target); controls.update();
    } else transition = { start: performance.now(), from: camera.position.clone(), fromTarget: controls.target.clone(), to: view.position, toTarget: view.target };
    render(performance.now(), true);
  }
  function stopTour() { touring = false; tourElapsed = 0; callbacks.onInteraction(); }
  function projectLabels() {
    camera.updateMatrixWorld();
    const width = host.clientWidth, height = host.clientHeight;
    roots.forEach((root, key) => {
      const label = labels.get(key); if (!label) return;
      const world = root.localToWorld(new THREE.Vector3(0, key === 'accounting' ? 2.6 : 2, 0));
      const projected = world.project(camera);
      const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2;
      const visible = projected.z < 1 && projected.z > -1 && x > (width < 680 ? 20 : 315) && x < width - 75 && y > (width < 680 ? 280 : 50) && y < height - 80;
      label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      label.style.opacity = visible ? '1' : '0'; label.style.pointerEvents = visible ? 'auto' : 'none';
      label.tabIndex = visible ? 0 : -1; label.setAttribute('aria-hidden', String(!visible));
    });
  }
  const roadPoints = [new THREE.Vector3(-6.35, -.05, 4.15), new THREE.Vector3(6.85, -.05, 4.15), new THREE.Vector3(6.85, -.05, -4.8), new THREE.Vector3(-6.35, -.05, -4.8)];
  function updateTruck(truck: THREE.Group, progress: number) {
    const segment = progress * 4, index = Math.floor(segment) % 4;
    const a = roadPoints[index], b = roadPoints[(index + 1) % 4];
    truck.position.lerpVectors(a, b, segment % 1);
    truck.rotation.y = Math.atan2(-(b.x - a.x), -(b.z - a.z));
  }
  function render(now: number, force = false) {
    if (disposed || contextLost || (!force && now - lastFrame < 30)) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .08) : 0; lastFrame = now;
    if (!paused) {
      elapsed += dt;
      trucks.forEach((truck, index) => updateTruck(truck, (elapsed * .022 + index * .5) % 1));
      dataRoutes.forEach(({ curve, packet }, index) => packet.position.copy(curve.getPoint((elapsed * .16 + index * .23) % 1)));
    }
    if (touring && !paused) {
      tourElapsed += dt;
      if (tourElapsed >= 5.5) {
        tourElapsed = 0;
        const key = ORDER[(ORDER.indexOf(selected ?? 'warehouse') + 1) % ORDER.length];
        callbacks.onSelect(key);
      }
    }
    if (transition) {
      const t = motion.matches ? 1 : Math.min((now - transition.start) / 1400, 1);
      const eased = t * t * (3 - 2 * t);
      camera.position.lerpVectors(transition.from, transition.to, eased);
      controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased);
      if (t === 1) transition = null;
    }
    roots.forEach((root, key) => {
      const rise = key === selected ? .12 : key === hovered ? .07 : 0;
      root.position.y = motion.matches ? rise : THREE.MathUtils.lerp(root.position.y, rise, .14);
      const marker = root.userData.marker as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
      marker.material.opacity = key === selected ? 1 : .45;
    });
    controls.update(); projectLabels(); renderer.render(scene, camera);
  }
  function run() {
    renderer.setAnimationLoop(inViewport && !document.hidden && !contextLost ? now => render(now) : null);
    if (inViewport && !document.hidden) render(performance.now(), true);
  }
  function pick(clientX: number, clientY: number): StageKey | null {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set((clientX - bounds.left) / bounds.width * 2 - 1, -(clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects([...roots.values()], true)[0];
    let object: THREE.Object3D | null = hit?.object ?? null;
    while (object && !object.userData.stageKey) object = object.parent;
    return object?.userData.stageKey ?? null;
  }
  function onMove(event: PointerEvent) {
    hovered = pick(event.clientX, event.clientY);
    renderer.domElement.style.cursor = pointerDown ? 'grabbing' : hovered ? 'pointer' : 'grab';
  }
  function onDown(event: PointerEvent) {
    activePointers.add(event.pointerId);
    pointerDown = activePointers.size === 1 ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
  }
  function onUp(event: PointerEvent) {
    if (pointerDown?.id === event.pointerId && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) < 6) {
      const key = pick(event.clientX, event.clientY); if (key) { stopTour(); callbacks.onSelect(key); }
    }
    pointerDown = null;
    activePointers.delete(event.pointerId);
  }
  function onLeave(event: PointerEvent) { hovered = null; pointerDown = null; activePointers.delete(event.pointerId); }
  function onStart() { transition = null; stopTour(); }
  function zoom(factor: number) {
    transition = null; stopTour();
    const offset = camera.position.clone().sub(controls.target);
    camera.position.copy(controls.target).add(offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance)));
    controls.update(); render(performance.now(), true);
  }
  function onLost(event: Event) { event.preventDefault(); contextLost = true; renderer.setAnimationLoop(null); callbacks.onContextLost(); }
  function onMotion() { if (motion.matches) { paused = true; stopTour(); if (transition) select(selected, true); } controls.enableDamping = !motion.matches; }
  function resize() { frameCamera(); select(selected, true); }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
  const intersection = new IntersectionObserver(entries => { inViewport = entries[0]?.isIntersecting ?? false; lastFrame = 0; run(); }); intersection.observe(host);
  document.addEventListener('visibilitychange', run);
  motion.addEventListener('change', onMotion);
  controls.addEventListener('start', onStart);
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointercancel', onLeave);
  renderer.domElement.addEventListener('pointerleave', onLeave);
  renderer.domElement.addEventListener('webglcontextlost', onLost);
  frameCamera(); select(null, true); onMotion();
  trucks.forEach((truck, index) => updateTruck(truck, index * .5));

  return {
    select,
    updateStages(nextStages) { nextStages.forEach(stage => {
      const root = roots.get(stage.key); if (!root) return;
      const marker = root.userData.marker as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
      marker.material.color.set(stage.color);
    }); render(performance.now(), true); },
    setPaused(value) { paused = value; if (paused) touring = false; },
    setTouring(value) {
      if (touring === value) return;
      touring = value; tourElapsed = 0;
      if (value) { paused = false; const key = selected ?? 'warehouse'; select(key); callbacks.onSelect(key); }
    },
    zoomIn() { zoom(.8); }, zoomOut() { zoom(1.25); }, reset() { stopTour(); select(null); },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null);
      resizeObserver.disconnect(); intersection.disconnect(); controls.dispose();
      document.removeEventListener('visibilitychange', run); motion.removeEventListener('change', onMotion);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onLeave);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      });
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}
