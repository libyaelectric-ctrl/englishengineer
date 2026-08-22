import * as THREE from 'three';

import { useEffect, useRef } from 'react';

import { useTheme } from '@/features/theme/ThemeProvider';

interface HeroSceneProps {
  className?: string;
}

/** Deterministic PRNG so the procedural skyline is stable between renders. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Night-lit window grid generated on a canvas, used as an emissive map. */
function createWindowTexture(seed: number, day: boolean): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grid = mulberry32(seed);
  const cols = 8;
  const rows = 16;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  const palette = day
    ? ['#3d6ecf', '#6a5fce', '#5b6478', '#c98d45']
    : ['#8fe8ff', '#aab6ff', '#ffffff', '#ffd591'];

  ctx.fillStyle = day ? '#e9edf6' : '#0a1026';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const lit = grid();
      if (lit > 0.52) {
        ctx.globalAlpha = (day ? 0.45 : 0.3) + grid() * 0.55;
        ctx.fillStyle = palette[Math.floor(grid() * palette.length)];
        ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      } else {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = day ? '#b3c0d6' : grid() < 0.5 ? '#0c1330' : '#0f1840';
        ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      }
    }
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 2;
  return tex;
}

/** Building footprint rows: [z, depth position, width, depth, minH, maxH, x positions]. */
const BUILDING_ROWS: Array<{
  z: number;
  w: number;
  d: number;
  hMin: number;
  hMax: number;
  xs: number[];
}> = [
  {
    z: -9.5,
    w: 3.4,
    d: 3.4,
    hMin: 12,
    hMax: 19,
    xs: [-22, -18, -14, -10, -6, -2, 2, 6, 10, 14, 18, 22],
  },
  {
    z: -5.8,
    w: 4.6,
    d: 4.4,
    hMin: 6,
    hMax: 13,
    xs: [-20.5, -17, -13.5, -10, -6.5, -3, 0.5, 4, 7.5, 11, 14.5, 18, 21.5],
  },
  {
    z: -2.6,
    w: 5.4,
    d: 4.8,
    hMin: 8,
    hMax: 16,
    xs: [-22, -18.5, -15, -11.5, -8, -4.5, -1.2, 1.8, 5, 8.5, 12, 15.5, 19, 22.5],
  },
  {
    z: 0.6,
    w: 6.4,
    d: 5,
    hMin: 9,
    hMax: 18,
    xs: [-23, -19.5, -16, -12.5, -9, -5.5, -2.2, 2.2, 5.5, 9, 12.5, 16, 19.5, 23],
  },
];

const EMISSIVE_TINTS = [0x59d6ff, 0x9b7bff, 0xe8a24a];
const EDGE_COLORS = [0x3fd4ff, 0x8d7bff, 0xffc46b];

interface BuildingSpec {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  tint: number;
  edge: number;
  roof: 'flat' | 'antenna' | 'chimney';
  elevator: boolean;
  elevatorSide: number;
}

interface RiseTiming {
  riseDur: number;
  settleDur: number;
  downDur: number;
  period: number;
  phase: number;
}

interface Building {
  group: THREE.Group;
  timing: RiseTiming;
  h: number;
  elevator?: THREE.Mesh;
  elevatorPhase: number;
  elevatorSpeed: number;
}

interface SmokeStack {
  geo: THREE.BufferGeometry;
  pos: Float32Array;
  vel: Float32Array;
  age: Float32Array;
  lifespan: Float32Array;
  color: Float32Array;
  anchor: THREE.Object3D;
  world: THREE.Vector3;
}

interface Crane {
  pivot: THREE.Group;
  hook: THREE.Object3D;
  phase: number;
  oscillate: boolean;
}

interface Holo {
  group: THREE.Group;
  orbit: number;
  speed: number;
  y: number;
  phase: number;
}

interface Pillar {
  blob: THREE.Mesh;
  h: number;
  phase: number;
  speed: number;
}

function makeSpecs(): BuildingSpec[] {
  const specs: BuildingSpec[] = [];
  let idx = 0;
  for (const row of BUILDING_ROWS) {
    const rand = mulberry32(idx * 7919 + 17);
    for (const x of row.xs) {
      const h = row.hMin + rand() * (row.hMax - row.hMin);
      const tintPick = Math.floor(rand() * EMISSIVE_TINTS.length);
      const roofRoll = rand();
      let roof: BuildingSpec['roof'] = 'flat';
      if (row.z === -9.5 || roofRoll > 0.82) roof = 'antenna';
      else if (roofRoll > 0.35) roof = 'chimney';
      specs.push({
        x,
        z: row.z,
        w: row.w,
        d: row.d,
        h,
        tint: EMISSIVE_TINTS[tintPick],
        edge: EDGE_COLORS[tintPick],
        roof,
        elevator: (row.z <= -2.6 || row.z === 0.6) && rand() > 0.5,
        elevatorSide: rand() > 0.5 ? 1 : -1,
      });
      idx += 1;
    }
  }
  return specs;
}

const SMOKE_COUNT = 22;
const SPARK_COUNT = 150;

/**
 * A procedurally built engineering skyline: skyscrapers and factory blocks that
 * continuously rise out of the ground (construction loop), tower cranes, smoking
 * chimneys, elevators travelling up glowing shafts, wireframe holograms, energy
 * pillars and rising sparks. Falls back gracefully when WebGL is unavailable.
 */
export const HeroScene = ({ className = '' }: HeroSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const day = theme === 'light';

    let renderer: THREE.WebGLRenderer | null = null;
    let rafId = 0;
    let disposed = false;

    // WebGL detection - early exit for test/jsdom/no-WebGL environments
    try {
      const probe = document.createElement('canvas');
      const gl =
        probe.getContext('webgl2') ??
        probe.getContext('webgl') ??
        (probe.getContext('experimental-webgl') as WebGLRenderingContext | null);
      if (!gl) return;
      gl.getExtension?.('WEBGL_lose_context')?.loseContext?.();
    } catch {
      return;
    }

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 200);
    const CAM_BASE_Y = 4.5;
    camera.position.set(0, CAM_BASE_Y, 17.5);
    camera.lookAt(0, 5, 0);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(day ? 0xffffff : 0x88aaff, day ? 1.25 : 0.9));
    const keyLight = new THREE.DirectionalLight(day ? 0xffffff : 0xbfd4ff, day ? 1.5 : 2.2);
    keyLight.position.set(6, 18, 8);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x7c5cff, 1.1);
    rimLight.position.set(-8, 6, -10);
    scene.add(rimLight);

    const baseTex = createWindowTexture(1337, day);
    const textures: THREE.Texture[] = [];
    if (baseTex) textures.push(baseTex);

    // Ground grid
    const grid = new THREE.GridHelper(72, 36, day ? 0x6f8fe0 : 0x2743a0, day ? 0xa3b5e6 : 0x1b2a66);
    const gridMat = grid.material as THREE.LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = day ? 0.35 : 0.26;
    grid.position.y = -0.03;
    scene.add(grid);

    // Pulse rings emanating from the centre
    const rings: Array<{ mesh: THREE.Mesh; offset: number; speed: number }> = [];
    const ringGeo = new THREE.RingGeometry(1, 1.18, 48);
    for (let i = 0; i < 2; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x3fd4ff : 0x8d7bff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.05;
      scene.add(mesh);
      rings.push({ mesh, offset: i * 0.5, speed: i === 0 ? 0.55 : 0.72 });
    }

    // --- Buildings (rise out of the ground on a repeating construction loop) ---
    const buildings: Building[] = [];
    const smokeStacks: SmokeStack[] = [];
    const beacons: Array<{ mat: THREE.MeshBasicMaterial; phase: number; speed: number }> = [];

    for (const spec of makeSpecs()) {
      const geo = new THREE.BoxGeometry(spec.w, spec.h, spec.d);
      geo.translate(0, spec.h / 2, 0);

      const tintMat = new THREE.MeshStandardMaterial({
        color: day ? 0x9aa4bd : 0x0a1026,
        metalness: 0.35,
        roughness: 0.5,
        emissive: spec.tint,
        emissiveIntensity: day ? 0.55 : 1.0,
      });
      if (baseTex) {
        const clone = baseTex.clone();
        clone.repeat.set(spec.w / 6.5, spec.h / 5);
        clone.needsUpdate = true;
        tintMat.emissiveMap = clone;
        textures.push(clone);
      }

      const edgesGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: spec.edge,
        transparent: true,
        opacity: 0.45,
      });
      const edgeLines = new THREE.LineSegments(edgesGeo, edgeMat);

      const group = new THREE.Group();
      const mesh = new THREE.Mesh(geo, tintMat);
      group.add(mesh, edgeLines);
      scene.add(group);

      const rand = mulberry32(Math.floor(spec.x * 131 + spec.z * 61 + 5));

      if (spec.roof === 'antenna') {
        const antenna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.09, 2.6, 6),
          new THREE.MeshStandardMaterial({
            color: day ? 0x8d97af : 0x22305e,
            metalness: 0.6,
            roughness: 0.4,
          })
        );
        antenna.position.set(0, spec.h, 0);
        group.add(antenna);

        const beaconMat = new THREE.MeshBasicMaterial({
          color: 0xff3b3b,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), beaconMat);
        beacon.position.set(0, spec.h + 1.4, 0);
        group.add(beacon);
        beacons.push({ mat: beaconMat, phase: rand() * Math.PI * 2, speed: 2.2 + rand() * 1.6 });
      } else if (spec.roof === 'chimney') {
        const chimney = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.62, 2.1, 10),
          new THREE.MeshStandardMaterial({
            color: day ? 0x9aa4bd : 0x181f42,
            metalness: 0.5,
            roughness: 0.55,
          })
        );
        chimney.position.set(spec.w * 0.24, spec.h, spec.d * 0.22);
        group.add(chimney);

        const anchor = new THREE.Object3D();
        anchor.position.set(spec.w * 0.24, spec.h + 1.05, spec.d * 0.22);
        group.add(anchor);
        smokeStacks.push(makeSmokeStack(anchor, rand));
      }

      let elevator: THREE.Mesh | undefined;
      if (spec.elevator) {
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, spec.h - 1.2, 0.12),
          new THREE.MeshBasicMaterial({
            color: 0x59d6ff,
            transparent: true,
            opacity: 0.16,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        strip.position.set(spec.w * 0.25 * spec.elevatorSide, spec.h / 2, spec.d / 2 + 0.05);
        group.add(strip);

        const car = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 1.3, 0.2),
          new THREE.MeshBasicMaterial({
            color: 0xcdf0ff,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        car.position.set(spec.w * 0.25 * spec.elevatorSide, 2, spec.d / 2 + 0.07);
        group.add(car);
        elevator = car;
      }

      const riseDur = 2.2 + rand() * 2.6;
      const settleDur = 4 + rand() * 10;
      const downDur = 1.4 + rand() * 0.6;
      const timing: RiseTiming = {
        riseDur,
        settleDur,
        downDur,
        period: riseDur + settleDur + downDur,
        phase: rand() * 100,
      };

      buildings.push({
        group,
        timing,
        h: spec.h,
        elevator,
        elevatorPhase: rand() * Math.PI * 2,
        elevatorSpeed: 0.5 + rand() * 0.4,
      });
    }

    function makeSmokeStack(anchor: THREE.Object3D, rand: () => number): SmokeStack {
      const pos = new Float32Array(SMOKE_COUNT * 3);
      const vel = new Float32Array(SMOKE_COUNT * 2);
      const age = new Float32Array(SMOKE_COUNT);
      const lifespan = new Float32Array(SMOKE_COUNT);
      const color = new Float32Array(SMOKE_COUNT * 3);
      const world = new THREE.Vector3();
      anchor.getWorldPosition(world);

      for (let i = 0; i < SMOKE_COUNT; i++) {
        pos[i * 3] = world.x + (rand() - 0.5) * 0.5;
        pos[i * 3 + 1] = world.y;
        pos[i * 3 + 2] = world.z + (rand() - 0.5) * 0.5;
        vel[i * 2] = 0.6 + rand() * 1.1;
        vel[i * 2 + 1] = (rand() - 0.5) * 0.6;
        age[i] = rand() * 1.6;
        lifespan[i] = 2 + rand() * 2.4;
        color[i * 3] = 0.42;
        color[i * 3 + 1] = 0.48;
        color[i * 3 + 2] = 0.72;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(color, 3));
      const mat = new THREE.PointsMaterial({
        vertexColors: true,
        size: 1.0,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return { geo, pos, vel, age, lifespan, color, anchor, world };
    }

    // --- Tower cranes ---
    const cranes: Crane[] = [];
    (function buildCranes() {
      const craneSpots: Array<[number, number]> = [
        [-15.5, -7],
        [15.5, -7],
      ];
      craneSpots.forEach(([x, z], ci) => {
        const rand = mulberry32(ci * 331 + 7);
        const towerMat = new THREE.MeshStandardMaterial({
          color: day ? 0x99a3ba : 0x10172f,
          metalness: 0.6,
          roughness: 0.4,
        });
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.95, 6.5, 0.95), towerMat);
        tower.geometry.translate(0, 3.25, 0);

        const midBrace = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 0.18, 0.28),
          new THREE.MeshStandardMaterial({
            color: day ? 0xa9b2c9 : 0x1a2350,
            metalness: 0.5,
            roughness: 0.5,
          })
        );

        const pivot = new THREE.Group();
        pivot.position.set(x, 6.5, z);
        tower.position.set(x, 0, z);
        midBrace.position.set(x, 3.4, z);

        const cabGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
        cabGeo.translate(0, 0.55, 0);
        const cabMat = new THREE.MeshStandardMaterial({
          color: day ? 0xb6bfd4 : 0x2a345f,
          metalness: 0.6,
          roughness: 0.35,
        });
        const cab = new THREE.Mesh(cabGeo, cabMat);
        cab.position.x = 0.6;

        const jibGeo = new THREE.BoxGeometry(10, 0.42, 0.5);
        jibGeo.translate(0, -0.3, 0);
        const jibMat = new THREE.MeshStandardMaterial({
          color: day ? 0x9ca6bd : 0x1d2650,
          metalness: 0.6,
          roughness: 0.4,
        });
        const jib = new THREE.Mesh(jibGeo, jibMat);
        jib.position.x = 4.6;

        const counterGeo = new THREE.BoxGeometry(1.2, 0.7, 1.1);
        counterGeo.translate(0, -0.2, 0);
        const counter = new THREE.Mesh(counterGeo, jibMat);
        counter.position.x = -2;

        const cableGeo = new THREE.BoxGeometry(0.05, 2.8, 0.05);
        cableGeo.translate(0, -1.4, 0);
        const cable = new THREE.Mesh(cableGeo, jibMat);
        cable.position.x = 9.2;

        const hookGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
        hookGeo.translate(0, -3.4, 0);
        const hookMat = new THREE.MeshStandardMaterial({
          color: 0xffb45e,
          emissive: 0xffb45e,
          emissiveIntensity: 0.4,
        });
        const hook = new THREE.Mesh(hookGeo, hookMat);
        hook.position.x = 9.2;

        pivot.add(cab, jib, counter, cable, hook);
        scene.add(tower, midBrace, pivot);

        cranes.push({
          pivot,
          hook,
          phase: rand() * Math.PI * 2,
          oscillate: ci === 1,
        });
      });
    })();

    // --- Floating wireframe holograms ---
    const holos: Holo[] = [];
    (function buildHolos() {
      const holoGeos = [
        new THREE.IcosahedronGeometry(1.9, 0),
        new THREE.OctahedronGeometry(1.6),
        new THREE.TorusKnotGeometry(1.15, 0.32, 48, 8),
      ];
      holoGeos.forEach((solid, i) => {
        const wire = new THREE.WireframeGeometry(solid);
        const mat = new THREE.LineBasicMaterial({
          color: i === 0 ? 0x3fd4ff : i === 1 ? 0x9b7bff : 0x59ffc8,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const lines = new THREE.LineSegments(wire, mat);
        const group = new THREE.Group();
        group.add(lines);
        scene.add(group);
        holos.push({
          group,
          orbit: 8 + i * 2.6,
          speed: 0.1 + i * 0.045,
          y: 7 + i * 2.4,
          phase: i * 2.3,
        });
      });
    })();

    // --- Energy pillars (vertical data lanes) ---
    const pillars: Pillar[] = [];
    (function buildPillars() {
      const pillarSpots: Array<[number, number]> = [
        [-10.5, -3.4],
        [10.5, -3.4],
        [0.5, -6.5],
      ];
      pillarSpots.forEach(([x, z], i) => {
        const rand = mulberry32(i * 223 + 41);
        const h = 13;
        const outer = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, h, 0.34),
          new THREE.MeshBasicMaterial({
            color: 0x59d6ff,
            transparent: true,
            opacity: 0.16,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        outer.position.set(x, h / 2, z);

        const capGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 24);
        const capMat = new THREE.MeshBasicMaterial({
          color: 0x3fd4ff,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const capA = new THREE.Mesh(capGeo, capMat);
        capA.rotation.x = Math.PI / 2;
        capA.position.set(x, 0.3, z);
        const capB = new THREE.Mesh(capGeo, capMat);
        capB.rotation.x = Math.PI / 2;
        capB.position.set(x, h - 0.3, z);

        const blobMat = new THREE.MeshBasicMaterial({
          color: 0xcdf0ff,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const blob = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.75), blobMat);
        blob.position.set(x, 4, z);
        scene.add(outer, capA, capB, blob);
        pillars.push({ blob, h, phase: rand() * Math.PI * 2, speed: 0.55 + rand() * 0.4 });
      });
    })();

    // --- Rising sparks (construction embers / data motes) ---
    const sparkPos = new Float32Array(SPARK_COUNT * 3);
    const sparkMeta = new Float32Array(SPARK_COUNT * 2);
    {
      const rand = mulberry32(99);
      for (let i = 0; i < SPARK_COUNT; i++) {
        const a = rand() * Math.PI * 2;
        const r = 2 + rand() * 15;
        sparkPos[i * 3] = Math.cos(a) * r;
        sparkPos[i * 3 + 1] = rand() * 22;
        sparkPos[i * 3 + 2] = Math.sin(a) * r;
        sparkMeta[i * 2] = 0.4 + rand() * 1.1;
        sparkMeta[i * 2 + 1] = rand() * Math.PI * 2;
      }
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: day ? 0x3d6ecf : 0x7fb4ff,
      size: 0.14,
      transparent: true,
      opacity: day ? 0.7 : 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // --- Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer!.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    function riseOffset(timing: RiseTiming, time: number): number {
      const cycle = (time + timing.phase) % timing.period;
      if (cycle < timing.riseDur) {
        const p = cycle / timing.riseDur;
        const e = 1 - Math.pow(1 - p, 3);
        return -18 + e * 18;
      }
      if (cycle < timing.riseDur + timing.settleDur) return 0;
      const p = (cycle - timing.riseDur - timing.settleDur) / timing.downDur;
      return -18 * p * p;
    }

    function advance(dt: number) {
      const time = performance.now() * 0.001;

      for (const building of buildings) {
        building.group.position.y = riseOffset(building.timing, time);
        if (building.elevator) {
          const p = 0.5 - 0.5 * Math.cos(time * building.elevatorSpeed + building.elevatorPhase);
          building.elevator.position.y = 1.8 + p * (building.h - 3.6);
        }
      }

      for (const stack of smokeStacks) {
        stack.anchor.getWorldPosition(stack.world);
        for (let i = 0; i < SMOKE_COUNT; i++) {
          stack.age[i] += dt / stack.lifespan[i];
          if (stack.age[i] >= 1) {
            stack.pos[i * 3] = stack.world.x + (Math.random() - 0.5) * 0.6;
            stack.pos[i * 3 + 1] = stack.world.y;
            stack.pos[i * 3 + 2] = stack.world.z + (Math.random() - 0.5) * 0.6;
            stack.vel[i * 2] = 0.6 + Math.random() * 1.1;
            stack.lifespan[i] = 2 + Math.random() * 2.4;
            stack.age[i] = 0;
          }
          const drift = stack.vel[i * 2 + 1];
          stack.pos[i * 3] += Math.sin(stack.age[i] * 4.1 + i) * dt * drift * 2;
          stack.pos[i * 3 + 1] += stack.vel[i * 2] * dt;
          stack.pos[i * 3 + 2] += Math.cos(stack.age[i] * 3.2 + i) * dt * drift * 2;
          const fade = 1 - stack.age[i];
          stack.color[i * 3] = 0.42 * fade;
          stack.color[i * 3 + 1] = 0.48 * fade;
          stack.color[i * 3 + 2] = 0.72 * fade;
        }
        stack.geo.attributes.position.needsUpdate = true;
        stack.geo.attributes.color.needsUpdate = true;
      }

      for (const crane of cranes) {
        crane.pivot.rotation.y = crane.oscillate
          ? 1.2 + 0.7 * Math.sin(time * 0.3 + crane.phase)
          : time * 0.22 + crane.phase;
        crane.hook.position.y = -(3.2 + 0.5 * Math.sin(time * 0.9 + crane.phase));
      }

      for (const beacon of beacons) {
        beacon.mat.opacity = 0.3 + 0.7 * Math.max(0, Math.sin(time * beacon.speed + beacon.phase));
      }

      for (const ring of rings) {
        const frac = (time * ring.speed + ring.offset) % 1;
        const s = 1.6 + frac * 15;
        ring.mesh.scale.set(s, s, 1);
        const mat = ring.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - frac) * 0.5;
      }

      for (const pillar of pillars) {
        const p = 0.5 - 0.5 * Math.cos(time * pillar.speed + pillar.phase);
        pillar.blob.position.y = 1.8 + p * (pillar.h - 3.6);
      }

      for (const holo of holos) {
        const ang = time * holo.speed + holo.phase;
        holo.group.position.set(
          Math.cos(ang) * holo.orbit,
          holo.y + Math.sin(time * 0.4 + holo.phase) * 0.8,
          Math.sin(ang) * holo.orbit
        );
        holo.group.rotation.x = time * 0.3;
        holo.group.rotation.y = time * 0.5;
      }

      const sparkArr = sparkGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < SPARK_COUNT; i++) {
        sparkArr[i * 3 + 1] += sparkMeta[i * 2] * dt;
        sparkArr[i * 3] += Math.sin(time * 0.7 + i * 3.7) * dt * 0.4;
        sparkArr[i * 3 + 2] += Math.cos(time * 0.6 + i * 5.1) * dt * 0.4;
        if (sparkArr[i * 3 + 1] > 22) {
          sparkArr[i * 3 + 1] = -2;
          sparkArr[i * 3] = (Math.random() - 0.5) * 30;
          sparkArr[i * 3 + 2] = -8 + Math.random() * 10;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
    }

    let lastTime = performance.now();

    if (prefersReduced) {
      // Static frame: full-height skyline, rendered once
      for (const building of buildings) building.group.position.y = 0;
      renderer.render(scene, camera);
    } else {
      const tick = (now: number) => {
        if (disposed) return;
        const dt = Math.min((now - lastTime) * 0.001, 0.1);
        lastTime = now;
        advance(dt);
        // Mouse parallax on camera
        camera.position.x += (mouseX * 0.9 - camera.position.x) * 0.02;
        camera.position.y += (CAM_BASE_Y - mouseY * 0.5 - camera.position.y) * 0.02;
        camera.lookAt(0, 5, 0);
        renderer!.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      };
      tick(performance.now());
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);

      scene.traverse((child) => {
        const object = child as THREE.Mesh | THREE.LineSegments | THREE.Points;
        object.geometry?.dispose?.();
        const material = (
          object as unknown as {
            material?: THREE.Material | THREE.Material[];
          }
        ).material;
        if (material) {
          (Array.isArray(material) ? material : [material]).forEach((m) => m.dispose());
        }
      });
      for (const tex of textures) tex.dispose();
      renderer?.dispose();
      const canvas = renderer?.domElement;
      if (canvas && canvas.parentNode === container) {
        container.removeChild(canvas);
      }
      renderer = null;
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-hero-scene
      className={`pointer-events-none absolute inset-0 opacity-60 ${className}`}
    />
  );
};

export default HeroScene;
