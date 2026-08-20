import * as THREE from 'three';

import { useEffect, useRef } from 'react';

interface HeroSceneProps {
  className?: string;
}

/**
 * Abstract particle flow field - a sophisticated stream of particles
 * flowing along gentle 3D curves. Elegant, non-eye-straining,
 * with subtle mouse parallax and scroll-depth awareness.
 * Falls back gracefully when WebGL is unavailable.
 */
export const HeroScene = ({ className = '' }: HeroSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 18);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- Particle Flow Field ---
    // Multiple streamlines with particles flowing along them
    const STREAM_COUNT = 12;
    const PARTICLES_PER_STREAM = 110;

    // Stream parameters
    const streams: Array<{
      x0: number;
      z0: number;
      amplitude: number;
      frequency: number;
      phaseOffset: number;
      colorMix: number;
      speed: number;
    }> = [];

    for (let i = 0; i < STREAM_COUNT; i++) {
      const angle = (i / STREAM_COUNT) * Math.PI * 2;
      const radius = 4 + Math.random() * 5;
      streams.push({
        x0: Math.cos(angle) * radius * 0.6,
        z0: Math.sin(angle) * radius * 0.6,
        amplitude: 2.5 + Math.random() * 2.5,
        frequency: 0.12 + Math.random() * 0.18,
        phaseOffset: Math.random() * Math.PI * 2,
        colorMix: Math.random(), // 0=blue, 1=violet
        speed: 0.08 + Math.random() * 0.06,
      });
    }

    const positions = new Float32Array(STREAM_COUNT * PARTICLES_PER_STREAM * 3);
    const seeds = new Float32Array(STREAM_COUNT * PARTICLES_PER_STREAM);
    const flowData = new Float32Array(STREAM_COUNT * PARTICLES_PER_STREAM * 3); // streamId, phase0, colorMix

    for (let s = 0; s < STREAM_COUNT; s++) {
      const base = s * PARTICLES_PER_STREAM;
      for (let j = 0; j < PARTICLES_PER_STREAM; j++) {
        const idx = base + j;
        seeds[idx] = Math.random() * Math.PI * 2; // twinkle seed
        flowData[idx * 3] = s; // streamId
        flowData[idx * 3 + 1] = j / PARTICLES_PER_STREAM; // phase0
        flowData[idx * 3 + 2] = streams[s].colorMix; // colorMix
        // Initial position (will be overwritten in first frame)
        positions[idx * 3] = 0;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = 0;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aFlow', new THREE.BufferAttribute(flowData, 3));

    // Shader material for soft, glowing particles
    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        precision highp float;
        attribute float aSeed;
        attribute vec3 aFlow; // x=streamId, y=phase0, z=colorMix
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        varying float vColorMix;
        void main() {
          vec3 p = position;
          float seed = aSeed;
          float streamId = aFlow.x;
          float phase0 = aFlow.y;
          float colorMix = aFlow.z;
          float H = 12.0;
          float phase = mod(phase0 + uTime * 0.12, 1.0);
          float u = phase;
          // Edge fade (soft entry/exit at top/bottom)
          float edgeFade = smoothstep(0.0, 0.12, u) * (1.0 - smoothstep(0.88, 1.0, u));
          float baseAlpha = 0.45 + 0.55 * sin(uTime * 1.8 + aSeed * 6.28318);
          vAlpha = baseAlpha * edgeFade;
          // Twinkle
          float twinkle = 0.8 + 0.2 * sin(uTime * 2.5 + aSeed * 12.566);
          vAlpha *= twinkle;
          vColorMix = aFlow.z;
          vec3 p0 = position;
          vec4 mv = modelViewMatrix * vec4(p0, 1.0);
          gl_PointSize = (2.5 + 0.8 * sin(uTime * 2.0 + aSeed)) * uPixelRatio * (250.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying float vAlpha;
        varying float vColorMix;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          a = pow(a, 1.8);
          vec3 blue = vec3(0.18, 0.4, 0.95);
          vec3 violet = vec3(0.55, 0.3, 0.95);
          vec3 color = mix(blue, violet, vColorMix);
          gl_FragColor = vec4(color, a * vAlpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      },
    });

    const points = new THREE.Points(geometry, particleMaterial);
    scene.add(points);

    // Soft ambient particles (dust)
    const DUST_COUNT = 400;
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustSeeds = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      const r = 12 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 28;
      dustPositions[i * 3] = Math.cos(theta) * r;
      dustPositions[i * 3 + 1] = y;
      dustPositions[i * 3 + 2] = Math.sin(theta) * r;
      dustSeeds[i] = Math.random() * Math.PI * 2;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeeds, 1));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0x5a8cff,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    // Interaction
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
      particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let lastTime = performance.now();

    if (prefersReduced) {
      // Static render for reduced motion
      updatePositions(0);
      renderer!.render(scene, camera);
    } else {
      const tick = (now: number) => {
        if (disposed) return;
        const dt = (now - lastTime) * 0.001;
        lastTime = now;
        updatePositions(dt);
        // Mouse parallax on camera
        camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.015;
        camera.position.y += (-mouseY * 0.6 - camera.position.y) * 0.015;
        camera.lookAt(0, 0, 0);
        renderer!.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      };
      tick(performance.now());
    }

    function updatePositions(_dt: number) {
      const positionsArray = geometry.attributes.position.array as Float32Array;
      const flowArray = geometry.attributes.aFlow.array as Float32Array;
      const now = performance.now() * 0.001;

      for (let s = 0; s < STREAM_COUNT; s++) {
        const stream = streams[s];
        for (let j = 0; j < PARTICLES_PER_STREAM; j++) {
          const idx = s * PARTICLES_PER_STREAM + j;
          const phase0 = flowArray[idx * 3 + 1];
          const phase = (phase0 + now * stream.speed) % 1.0;
          const u = phase;
          const y = -12 + u * 24;
          const x =
            stream.x0 + stream.amplitude * Math.sin(stream.frequency * y + stream.phaseOffset);
          const z =
            stream.z0 +
            stream.amplitude * Math.cos(stream.frequency * y + stream.phaseOffset + 0.5);
          const idxA = s * PARTICLES_PER_STREAM * 3 + j * 3;
          positionsArray[idxA] = x;
          positionsArray[idxA + 1] = y;
          positionsArray[idxA + 2] = z;
        }
      }
      geometry.attributes.position.needsUpdate = true;
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      renderer?.dispose();
      geometry.dispose();
      particleMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      const canvas = renderer?.domElement;
      if (canvas && canvas.parentNode === container) {
        container.removeChild(canvas);
      }
      renderer = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-hero-scene
      className={`pointer-events-none absolute inset-0 opacity-60 ${className}`}
    />
  );
};
