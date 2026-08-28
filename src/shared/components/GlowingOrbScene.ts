import * as THREE from 'three';

/**
 * WebGL orb renderer for GlowingOrb. Kept in its own module so the three.js
 * runtime is only downloaded when a GlowingOrb actually mounts (and WebGL is
 * available), instead of being pulled into the Landing/Pricing page chunks.
 */
const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    float noise1 = snoise(position * 2.0 + uTime * 0.4);
    float noise2 = snoise(position * 4.0 - uTime * 0.3);
    
    float breathe = sin(uTime * 1.2) * 0.05;
    float displacement = (noise1 + noise2 * 0.5) * 0.15 + breathe;
    
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 colorDeepBlue = vec3(0.1, 0.2, 0.6);
    vec3 colorCyan = vec3(0.2, 0.7, 1.0);
    vec3 colorPurple = vec3(0.6, 0.2, 0.9);
    vec3 colorPinkish = vec3(0.8, 0.3, 0.7);

    float gradientMix = sin(vPosition.y * 3.0 + uTime * 0.6) * 0.5 + 0.5;
    vec3 baseColor = mix(colorDeepBlue, colorCyan, gradientMix);

    float purpleMix = sin(vPosition.x * 4.0 - uTime * 0.5) * 0.5 + 0.5;
    baseColor = mix(baseColor, colorPurple, purpleMix * 0.7);
    
    float highlight = sin(vPosition.z * 5.0 + uTime * 0.8) * 0.5 + 0.5;
    if (highlight > 0.8) {
      baseColor = mix(baseColor, colorPinkish, (highlight - 0.8) * 5.0);
    }

    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.5);
    vec3 glowColor = vec3(0.6, 0.9, 1.0);
    
    vec3 finalColor = baseColor + glowColor * fresnel * 0.9;

    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

export const mountGlowingOrbScene = (container: HTMLElement): (() => void) | undefined => {
  let renderer: THREE.WebGLRenderer | null = null;
  let rafId = 0;
  let disposed = false;

  try {
    const probe = document.createElement('canvas');
    const gl =
      probe.getContext('webgl2') ??
      probe.getContext('webgl') ??
      (probe.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return undefined;
    gl.getExtension?.('WEBGL_lose_context')?.loseContext?.();
  } catch {
    return undefined;
  }

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.z = 3.5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const uniforms = { uTime: { value: 0 } };

  const geometry = new THREE.SphereGeometry(1, 128, 128);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const orb = new THREE.Mesh(geometry, material);
  scene.add(orb);

  const clock = new THREE.Clock();

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

  if (prefersReduced) {
    renderer.render(scene, camera);
  } else {
    const tick = () => {
      if (disposed) return;
      const delta = clock.getDelta();
      uniforms.uTime.value += delta;

      orb.rotation.y += delta * 0.15;
      orb.rotation.z += delta * 0.05;

      renderer!.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    observer.disconnect();
    scene.traverse((child) => {
      const object = child as THREE.Mesh;
      object.geometry?.dispose?.();
      const mat = (object as { material?: THREE.Material | THREE.Material[] }).material;
      if (mat) {
        (Array.isArray(mat) ? mat : [mat]).forEach((m) => m.dispose());
      }
    });
    renderer?.dispose();
    const canvas = renderer?.domElement;
    if (canvas && canvas.parentNode === container) {
      container.removeChild(canvas);
    }
    renderer = null;
  };
};
