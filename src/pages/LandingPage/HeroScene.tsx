import * as THREE from 'three';

import { useEffect, useRef } from 'react';

interface HeroSceneProps {
  className?: string;
}

/**
 * Subtle WebGL constellation/network globe for the hero background.
 * Deliberately low-contrast and slow so it feels premium, never distracting.
 * Falls back to nothing when WebGL is unavailable (SSR, jsdom tests, old browsers).
 */
export const HeroScene = ({ className = '' }: HeroSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let rafId = 0;
    let disposed = false;

    // WebGL detection – early exit for test/jsdom environments.
    try {
      const probe = document.createElement('canvas');
      const gl =
        probe.getContext('webgl2') ??
        probe.getContext('webgl') ??
        (probe.getContext('experimental-webgl') as WebGLRenderingContext | null);
      if (!gl) return;
      (gl as WebGLRenderingContext).getExtension?.('WEBGL_lose_context')?.loseContext?.();
    } catch {
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    camera.position.z = 20;

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const RADIUS = 7;

    // ---- Wire network globe ----
    const globe = new THREE.Group();
    scene.add(globe);

    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x4a7dd8,
      transparent: true,
      opacity: 0.14,
    });

    const makeLatitudeRing = (latDeg: number, segments = 80) => {
      const lat = (latDeg * Math.PI) / 180;
      const points: THREE.Vector3[] = [];
      const r = Math.cos(lat) * RADIUS;
      const y = Math.sin(lat) * RADIUS;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, ringMaterial);
    };

    [-70, -45, -20, 0, 20, 45, 70].forEach((lat) => globe.add(makeLatitudeRing(lat)));

    const makeMeridian = (thetaDeg: number, steps = 48) => {
      const theta = (thetaDeg * Math.PI) / 180;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= steps; i++) {
        const lat = (i / steps) * Math.PI - Math.PI / 2;
        points.push(
          new THREE.Vector3(
            Math.cos(lat) * Math.cos(theta) * RADIUS,
            Math.sin(lat) * RADIUS,
            Math.cos(lat) * Math.sin(theta) * RADIUS
          )
        );
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, ringMaterial);
    };

    [0, 30, 60, 90, 120, 150].forEach((deg) => globe.add(makeMeridian(deg)));

    // ---- Fibonacci sphere of nodes (engineering points) ----
    const nodeCount = 260;
    const positions = new Float32Array(nodeCount * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      positions[i * 3] = Math.cos(theta) * r * RADIUS * 1.01;
      positions[i * 3 + 1] = y * RADIUS * 1.01;
      positions[i * 3 + 2] = Math.sin(theta) * r * RADIUS * 1.01;
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x5b8def,
      size: 0.14,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    globe.add(nodes);

    // ---- Background star dust ----
    const dustCount = 160;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 15 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 26;
      dustPositions[i * 3] = Math.cos(theta) * r;
      dustPositions[i * 3 + 1] = y;
      dustPositions[i * 3 + 2] = Math.sin(theta) * r;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0x8fb4f5,
      size: 0.07,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    globe.add(dust);

    // ---- Interaction ----
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const resize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    renderer.render(scene, camera);

    const tick = () => {
      if (disposed) return;
      if (prefersReduced) {
        renderer?.render(scene, camera);
      } else {
        globe.rotation.y += 0.0016;
        globe.rotation.x += (mouseY * 0.14 - globe.rotation.x) * 0.02;
        globe.rotation.z += (mouseX * 0.08 - globe.rotation.z) * 0.02;
        renderer?.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      renderer?.dispose();
      [nodeGeometry, dustGeometry].forEach((geometry) => geometry.dispose());
      [nodeMaterial, dustMaterial, ringMaterial].forEach((material) => material.dispose());
      globe.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
        }
      });
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
      className={`pointer-events-none absolute inset-0 opacity-70 ${className}`}
    />
  );
};
