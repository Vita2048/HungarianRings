import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const N = 20;
const STEP = (Math.PI * 2) / N;
const INNER = 5; // 90° inner arc, 5 steps
const LEFT_TOP = 0;
const LEFT_BOT = 5;
const RIGHT_TOP = 0;
const RIGHT_BOT = 15;

const PATH_R = 1.12;
const CHORD = 2 * PATH_R * Math.sin(STEP / 2);
const BALL_R = CHORD * 0.435;
const CENTER_DIST = PATH_R * Math.SQRT2;
const LEFT_C = new THREE.Vector3(-CENTER_DIST / 2, 0, 0);
const RIGHT_C = new THREE.Vector3(CENTER_DIST / 2, 0, 0);
const TRAY_TOP = 0.16;
const BALL_Y = TRAY_TOP + BALL_R * 0.52;

const C = {
  red: 0xc62828,
  green: 0x2e7d32,
  yellow: 0xf5c400,
  blue: 0x1565c0,
};

function solvedColors() {
  const L = new Array(N);
  const R = new Array(N);
  L[0] = "yellow";
  L[1] = "green";
  L[2] = "green";
  L[3] = "green";
  L[4] = "green";
  L[5] = "green";
  L[6] = "green";
  L[7] = "green";
  L[8] = "green";
  L[9] = "green";
  for (let i = 10; i < 20; i++) L[i] = "red";

  R[0] = L[0];
  R[15] = L[5];
  R[1] = "yellow";
  R[2] = "yellow";
  R[3] = "yellow";
  R[4] = "yellow";
  for (let i = 5; i <= 14; i++) R[i] = "blue";
  R[16] = "yellow";
  R[17] = "yellow";
  R[18] = "yellow";
  R[19] = "yellow";
  return { L, R };
}

function leftAngle(i) {
  return -Math.PI / 4 + i * STEP;
}
function rightAngle(j) {
  return ((225 * Math.PI) / 180) + j * STEP;
}

function posOnLeft(i, extra = 0) {
  const a = leftAngle(i) + extra;
  return new THREE.Vector3(
    LEFT_C.x + PATH_R * Math.cos(a),
    BALL_Y,
    LEFT_C.z + PATH_R * Math.sin(a)
  );
}
function posOnRight(j, extra = 0) {
  const a = rightAngle(j) + extra;
  return new THREE.Vector3(
    RIGHT_C.x + PATH_R * Math.cos(a),
    BALL_Y,
    RIGHT_C.z + PATH_R * Math.sin(a)
  );
}

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12100e);
scene.fog = new THREE.Fog(0x12100e, 8, 18);

const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 40);
camera.position.set(0, 6.4, 3.6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 4.2;
controls.maxDistance = 9;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.15;
controls.target.set(0, 0.1, 0);

const hemi = new THREE.HemisphereLight(0xfff6ea, 0x2a2420, 0.7);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff3dc, 2.1);
key.position.set(-2.8, 7.2, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 16;
key.shadow.camera.left = -5;
key.shadow.camera.right = 5;
key.shadow.camera.top = 5;
key.shadow.camera.bottom = -5;
key.shadow.bias = -0.00025;
scene.add(key);

const fill = new THREE.DirectionalLight(0xb9d4ff, 0.55);
fill.position.set(4.5, 3.2, -2.5);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffe6b0, 0.45);
rim.position.set(0, 2.2, -5);
scene.add(rim);

const table = new THREE.Mesh(
  new THREE.CircleGeometry(7.5, 64),
  new THREE.MeshStandardMaterial({
    color: 0x1c1712,
    roughness: 0.72,
    metalness: 0.08,
  })
);
table.rotation.x = -Math.PI / 2;
table.position.y = -0.42;
table.receiveShadow = true;
scene.add(table);

const plastic = new THREE.MeshPhysicalMaterial({
  color: 0xd9d5ce,
  roughness: 0.42,
  metalness: 0.02,
  clearcoat: 0.65,
  clearcoatRoughness: 0.28,
});
const plasticDeep = new THREE.MeshPhysicalMaterial({
  color: 0xc9c4bc,
  roughness: 0.48,
  metalness: 0.02,
  clearcoat: 0.4,
  clearcoatRoughness: 0.38,
});
const plasticWell = new THREE.MeshPhysicalMaterial({
  color: 0xcfccc6,
  roughness: 0.5,
  metalness: 0.02,
  clearcoat: 0.35,
  clearcoatRoughness: 0.4,
});

const innerWallR = PATH_R - BALL_R * 1.08;
const outerWallR = PATH_R + BALL_R * 1.12;
const wallTube = 0.042;

const trayW = CENTER_DIST + 2 * outerWallR + 0.55;
const trayH = 2 * outerWallR + 0.55;
const tray = new THREE.Mesh(new RoundedBoxGeometry(trayW, 0.34, trayH, 10, 0.2), plastic);
tray.position.y = 0;
tray.castShadow = true;
tray.receiveShadow = true;
scene.add(tray);

function addWell(cx) {
  const well = new THREE.Mesh(
    new THREE.CylinderGeometry(innerWallR - wallTube * 0.2, innerWallR - wallTube * 0.2, 0.1, 64),
    plasticWell
  );
  well.position.set(cx, TRAY_TOP - 0.02, 0);
  well.receiveShadow = true;
  scene.add(well);
}
addWell(LEFT_C.x);
addWell(RIGHT_C.x);

const wallY = TRAY_TOP + 0.07;

function cwDelta(from, to) {
  let d = to - from;
  while (d < 0) d += Math.PI * 2;
  return d;
}

function sampleCircleArc(cx, radius, a0, sweep, segs) {
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const a = a0 + (sweep * i) / segs;
    pts.push(new THREE.Vector3(cx + radius * Math.cos(a), 0, radius * Math.sin(a)));
  }
  return pts;
}

function addMoldedRail(pts, tube, closed) {
  const curve = new THREE.CatmullRomCurve3(pts, closed, "catmullrom", 0.08);
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, Math.max(pts.length * 2, 80), tube, 14, closed),
    plastic
  );
  mesh.position.y = wallY;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function pairAngles(cx, radius, otherCx) {
  const mid = (otherCx - cx) / 2;
  const h = Math.sqrt(Math.max(radius * radius - mid * mid, 0));
  return { upper: Math.atan2(-h, mid), lower: Math.atan2(h, mid) };
}

const lo = pairAngles(LEFT_C.x, outerWallR, RIGHT_C.x);
const ro = pairAngles(RIGHT_C.x, outerWallR, LEFT_C.x);
const leftOuter = sampleCircleArc(LEFT_C.x, outerWallR, lo.lower, cwDelta(lo.lower, lo.upper), 80);
const rightOuter = sampleCircleArc(RIGHT_C.x, outerWallR, ro.upper, cwDelta(ro.upper, ro.lower), 80);
leftOuter.pop();
addMoldedRail(leftOuter.concat(rightOuter), wallTube * 1.08, true);

function addWellRim(cx) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(innerWallR, wallTube, 16, 96), plastic);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(cx, wallY, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
addWellRim(LEFT_C.x);
addWellRim(RIGHT_C.x);

const hugR = PATH_R * 0.4;
addMoldedRail(sampleCircleArc(LEFT_C.x, hugR, -0.75, 1.5, 40), wallTube, false);
addMoldedRail(sampleCircleArc(RIGHT_C.x, hugR, Math.PI - 0.75, 1.5, 40), wallTube, false);

function addTrackBed(cx) {
  const bed = new THREE.Mesh(
    new THREE.RingGeometry(innerWallR + 0.01, outerWallR - 0.01, 64),
    plasticDeep
  );
  bed.rotation.x = -Math.PI / 2;
  bed.position.set(cx, TRAY_TOP + 0.003 + (cx > 0 ? 0.0015 : 0), 0);
  bed.receiveShadow = true;
  scene.add(bed);
}
addTrackBed(LEFT_C.x);
addTrackBed(RIGHT_C.x);

const ballGeo = new THREE.SphereGeometry(BALL_R, 48, 36);
const ballMats = {};
for (const [name, hex] of Object.entries(C)) {
  ballMats[name] = new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    sheen: 0.35,
    sheenColor: new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.25),
    reflectivity: 0.6,
  });
}

const balls = [];
function makeBall(color) {
  const m = new THREE.Mesh(ballGeo, ballMats[color]);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.color = color;
  scene.add(m);
  balls.push(m);
  return m;
}

let L = new Array(N);
let R = new Array(N);

function placeSolved() {
  balls.forEach((b) => scene.remove(b));
  balls.length = 0;
  const s = solvedColors();
  for (let i = 0; i < N; i++) {
    const b = makeBall(s.L[i]);
    L[i] = b;
  }
  for (let j = 0; j < N; j++) {
    if (j === RIGHT_TOP) R[j] = L[LEFT_TOP];
    else if (j === RIGHT_BOT) R[j] = L[LEFT_BOT];
    else R[j] = makeBall(s.R[j]);
  }
  layoutInstant();
}

function layoutInstant(leftExtra = 0, rightExtra = 0, moving = null) {
  const rightMoving =
    moving === "R" || (moving == null && Math.abs(rightExtra) > Math.abs(leftExtra) + 1e-9);

  function placeLeft(skipShared) {
    for (let i = 0; i < N; i++) {
      const b = L[i];
      if (!b) continue;
      if (skipShared && (i === LEFT_TOP || i === LEFT_BOT)) continue;
      const p = posOnLeft(i, leftExtra);
      b.position.copy(p);
      b.userData.ring = i === LEFT_TOP || i === LEFT_BOT ? "both" : "L";
      b.userData.index = i;
    }
  }
  function placeRight(skipShared) {
    for (let j = 0; j < N; j++) {
      const b = R[j];
      if (!b) continue;
      if (skipShared && (j === RIGHT_TOP || j === RIGHT_BOT)) continue;
      const p = posOnRight(j, rightExtra);
      b.position.copy(p);
      b.userData.ring = j === RIGHT_TOP || j === RIGHT_BOT ? "both" : "R";
      b.userData.index = j;
    }
  }

  if (rightMoving) {
    placeRight(false);
    placeLeft(true);
  } else {
    placeLeft(false);
    placeRight(true);
  }
}

function cycle(arr, dir) {
  if (dir > 0) {
    const t = arr[N - 1];
    for (let i = N - 1; i > 0; i--) arr[i] = arr[i - 1];
    arr[0] = t;
  } else {
    const t = arr[0];
    for (let i = 0; i < N - 1; i++) arr[i] = arr[i + 1];
    arr[N - 1] = t;
  }
}

function applyStep(ring, dir) {
  if (ring === "L") {
    cycle(L, dir);
    R[RIGHT_TOP] = L[LEFT_TOP];
    R[RIGHT_BOT] = L[LEFT_BOT];
  } else {
    cycle(R, dir);
    L[LEFT_TOP] = R[RIGHT_TOP];
    L[LEFT_BOT] = R[RIGHT_BOT];
  }
}

function isSolved() {
  const s = solvedColors();
  for (let i = 0; i < N; i++) if (L[i].userData.color !== s.L[i]) return false;
  for (let j = 0; j < N; j++) if (R[j].userData.color !== s.R[j]) return false;
  return true;
}

let moveHistory = [];
let playerMoves = 0;
let busy = false;
let solving = false;
let stopSolve = false;
let liveDrag = null;

const moveEl = document.getElementById("moveCount");
const statusEl = document.getElementById("status");
const solveBtn = document.getElementById("autoSolve");
const solveLabel = document.getElementById("solveLabel");
const winEl = document.getElementById("win");

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = "value " + cls;
}
function setMoves(n) {
  playerMoves = n;
  moveEl.textContent = String(n);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutBack(t) {
  const c = 1.20158;
  return 1 + c * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

function animateRing(ring, dir, duration = 420) {
  return new Promise((resolve) => {
    const start = performance.now();
    const delta = dir * STEP;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOutCubic(t);
      if (ring === "L") layoutInstant(e * delta, 0, "L");
      else layoutInstant(0, e * delta, "R");
      if (t < 1) requestAnimationFrame(frame);
      else {
        applyStep(ring, dir);
        layoutInstant();
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

async function playSteps(steps, dur = 380) {
  busy = true;
  for (const s of steps) {
    if (stopSolve) break;
    await animateRing(s.ring, s.dir, dur);
    record(s.ring, s.dir);
    await new Promise((r) => setTimeout(r, 70));
  }
  busy = false;
}

function record(ring, dir) {
  const last = moveHistory[moveHistory.length - 1];
  if (last && last.ring === ring) {
    last.dir += dir;
    if (last.dir === 0) moveHistory.pop();
  } else {
    moveHistory.push({ ring, dir });
  }
}

function inverseQueue() {
  const q = [];
  for (let i = moveHistory.length - 1; i >= 0; i--) {
    const m = moveHistory[i];
    const n = Math.abs(m.dir);
    const d = -Math.sign(m.dir) || 0;
    for (let k = 0; k < n; k++) q.push({ ring: m.ring, dir: d });
  }
  return q;
}

function scramble(count = 72) {
  placeSolved();
  moveHistory = [];
  let last = null;
  for (let i = 0; i < count; i++) {
    let ring = Math.random() < 0.5 ? "L" : "R";
    let dir = Math.random() < 0.5 ? 1 : -1;
    if (last && last.ring === ring && last.dir === -dir) dir = -dir;
    applyStep(ring, dir);
    record(ring, dir);
    last = { ring, dir };
  }
  layoutInstant();
  setMoves(0);
  hideWin();
  setStatus("Playing", "status-play");
}

function showWin() {
  setStatus("Solved", "status-win");
  winEl.classList.remove("hidden");
  winEl.setAttribute("aria-hidden", "false");
}

function checkWin() {
  if (isSolved()) {
    showWin();
    return true;
  }
  return false;
}

function hideWin() {
  winEl.classList.add("hidden");
  winEl.setAttribute("aria-hidden", "true");
}

async function newGame() {
  if (solving) {
    stopSolve = true;
    solving = false;
    resetSolveBtn();
  }
  scramble();
}

function resetSolveBtn() {
  solveLabel.textContent = "Auto Solve";
  solveBtn.classList.remove("stop");
}

async function autoSolve() {
  if (solving) {
    stopSolve = true;
    return;
  }
  if (busy) return;
  if (isSolved()) {
    showWin();
    return;
  }
  const q = inverseQueue();
  solving = true;
  stopSolve = false;
  solveLabel.textContent = "Stop";
  solveBtn.classList.add("stop");
  setStatus("Solving", "status-solve");
  hideWin();
  if (q.length) await playSteps(q, 360);
  if (!stopSolve) {
    placeSolved();
    moveHistory = [];
    setMoves(0);
    solving = false;
    showWin();
  } else {
    setStatus("Playing", "status-play");
    solving = false;
  }
  stopSolve = false;
  resetSolveBtn();
}

document.getElementById("newGame").addEventListener("click", newGame);
solveBtn.addEventListener("click", autoSolve);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function ndc(e) {
  const r = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
}

function hitPoint(e) {
  ndc(e);
  raycaster.setFromCamera(pointer, camera);
  const p = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, p);
  return p;
}

function pickBall(e) {
  ndc(e);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(balls, false);
  return hits.length ? hits[0].object : null;
}

function chooseRing(ball, drag) {
  if (ball.userData.ring === "L") return "L";
  if (ball.userData.ring === "R") return "R";
  const p = ball.position;
  const tL = new THREE.Vector3(-(p.z - LEFT_C.z), 0, p.x - LEFT_C.x).normalize();
  const tR = new THREE.Vector3(-(p.z - RIGHT_C.z), 0, p.x - RIGHT_C.x).normalize();
  const d = drag.clone().setY(0);
  return Math.abs(d.dot(tL)) >= Math.abs(d.dot(tR)) ? "L" : "R";
}

function signedAngle(ring, from, to) {
  const c = ring === "L" ? LEFT_C : RIGHT_C;
  const a0 = Math.atan2(from.z - c.z, from.x - c.x);
  const a1 = Math.atan2(to.z - c.z, to.x - c.x);
  let d = a1 - a0;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

canvas.addEventListener("pointerdown", (e) => {
  if (busy || solving) return;
  const ball = pickBall(e);
  if (!ball) return;
  const p = hitPoint(e);
  if (!p) return;
  controls.enabled = false;
  canvas.classList.add("dragging");
  liveDrag = {
    ball,
    ring: null,
    origin: p.clone(),
    last: p.clone(),
    angle: 0,
  };
});

canvas.addEventListener("pointermove", (e) => {
  if (!liveDrag) return;
  const p = hitPoint(e);
  if (!p) return;
  if (!liveDrag.ring) {
    const drag = p.clone().sub(liveDrag.origin);
    if (drag.length() < 0.04) return;
    liveDrag.ring = chooseRing(liveDrag.ball, drag);
  }
  const da = signedAngle(liveDrag.ring, liveDrag.last, p);
  liveDrag.angle += da;
  liveDrag.last.copy(p);
  if (liveDrag.ring === "L") layoutInstant(liveDrag.angle, 0, "L");
  else layoutInstant(0, liveDrag.angle, "R");
});

canvas.addEventListener("pointerup", finishDrag);
canvas.addEventListener("pointercancel", finishDrag);
canvas.addEventListener("pointerleave", (e) => {
  if (liveDrag) finishDrag(e);
});

async function finishDrag() {
  if (!liveDrag) return;
  const drag = liveDrag;
  liveDrag = null;
  canvas.classList.remove("dragging");
  controls.enabled = true;
  if (!drag.ring) {
    layoutInstant();
    return;
  }
  const stepsFloat = drag.angle / STEP;
  let steps = Math.round(stepsFloat);
  if (steps === 0 && Math.abs(stepsFloat) > 0.22) steps = Math.sign(stepsFloat);
  const targetExtra = steps * STEP;
  busy = true;
  const from = drag.angle;
  await new Promise((resolve) => {
    const start = performance.now();
    const dur = 220;
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const e = easeOutBack(Math.min(1, t));
      const extra = from + (targetExtra - from) * e;
      if (drag.ring === "L") layoutInstant(extra, 0, "L");
      else layoutInstant(0, extra, "R");
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
  if (steps !== 0) {
    const dir = Math.sign(steps);
    const n = Math.abs(steps);
    for (let i = 0; i < n; i++) {
      applyStep(drag.ring, dir);
      record(drag.ring, dir);
    }
    setMoves(playerMoves + n);
  }
  layoutInstant();
  busy = false;
  checkWin();
}

placeSolved();
setMoves(0);
setStatus("Ready", "status-idle");

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
