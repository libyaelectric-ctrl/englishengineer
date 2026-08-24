import { useCallback, useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';

import { useLearningStore } from '@/core/learning';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

/* ------------------------------------------------------------------ */
/* Discipline data for the 3D scene                                    */
/* ------------------------------------------------------------------ */
const DISCIPLINES_DATA = [
  { code: 'AR', full: 'Architecture', id: 'architecture' as EngineeringDiscipline },
  { code: 'CH', full: 'Chemical Eng.', id: 'chemical' as EngineeringDiscipline },
  { code: 'CI', full: 'Civil Eng.', id: 'civil' as EngineeringDiscipline },
  { code: 'EL', full: 'Electrical Eng.', id: 'electrical' as EngineeringDiscipline },
  { code: 'EC', full: 'Electronics Eng.', id: 'electronics' as EngineeringDiscipline },
  { code: 'SO', full: 'Software Eng.', id: 'software' as EngineeringDiscipline },
  { code: 'ME', full: 'Mechatronics', id: 'mechatronics' as EngineeringDiscipline },
  { code: 'MC', full: 'Mechanical Eng.', id: 'mechanical' as EngineeringDiscipline },
  { code: 'IN', full: 'Industrial Eng.', id: 'industrial' as EngineeringDiscipline },
  { code: 'HS', full: 'HSE Eng.', id: 'hse' as EngineeringDiscipline },
];

const LANGUAGES_DATA = INTERFACE_LANGUAGES.filter((l) => l.available).map((l) => ({
  code: l.id.toUpperCase(),
  full: `${l.nativeLabel} (${l.label})`,
  id: l.id as SupportedInterfaceLanguage,
}));

/* ------------------------------------------------------------------ */
/* NeuralOrbPanel Component                                            */
/* ------------------------------------------------------------------ */
export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage>('tr');
  const [isSaving, setIsSaving] = useState(false);
  const [consoleMsg, setConsoleMsg] = useState('> SYSTEM READY...');
  const [statusColor, setStatusColor] = useState('#38bdf8');

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    triggerOrbSelection: (code: string, segment: number) => void;
    clearSelection: () => void;
  } | null>(null);

  /* ---- ENTER handler ---- */
  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !currentUser) {
      setConsoleMsg('> ERROR: SELECT 1 DISCIPLINE!');
      setStatusColor('#f43f5e');
      return;
    }
    if (!selectedLanguage) {
      setConsoleMsg('> ERROR: SELECT 1 LANGUAGE!');
      setStatusColor('#f43f5e');
      return;
    }

    setIsSaving(true);
    setConsoleMsg(`> EXEC: [${selectedDiscipline}] + [${selectedLanguage}] GRANTED!`);
    setStatusColor('#22c55e');

    try {
      setLanguage(selectedLanguage);
      LearningProfileRepository.updatePreferences(currentUser.id, {
        discipline: selectedDiscipline,
        professionalTrack: selectedDiscipline as never,
        onboardingCompleted: true,
        interfaceLanguage: selectedLanguage,
      });
      useAuthStore.setState({
        currentUser: {
          ...useAuthStore.getState().currentUser!,
          engineeringDiscipline: selectedDiscipline,
        },
      });
      useLearningStore.getState().resetAll();
      onComplete?.();
    } finally {
      setIsSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, currentUser, setLanguage, onComplete]);

  /* ---- BACK handler ---- */
  const handleBack = useCallback(() => {
    setSelectedDiscipline(null);
    setSelectedLanguage('tr');
    setConsoleMsg('> CLEARED. AWAITING INPUT...');
    setStatusColor('#f43f5e');
    sceneRef.current?.clearSelection();
  }, []);

  /* ---- Orb selection callback ---- */
  const handleOrbSelect = useCallback(
    (code: string, segment: number) => {
      if (segment === 1) {
        const d = DISCIPLINES_DATA.find((x) => x.code === code);
        if (d) {
          setSelectedDiscipline(d.id);
          setConsoleMsg(`> DISCIPLINE: [${d.code}] — ${d.full}`);
          setStatusColor('#c084fc');
        }
      } else {
        const l = LANGUAGES_DATA.find((x) => x.code === code);
        if (l) {
          setSelectedLanguage(l.id);
          setConsoleMsg(`> LANGUAGE: [${l.code}] — ${l.id.toUpperCase()}`);
          setStatusColor('#38bdf8');
        }
      }
    },
    [],
  );

  /* ---- Menu click handlers ---- */
  const handleMenuClick = useCallback(
    (code: string, segment: number) => {
      sceneRef.current?.triggerOrbSelection(code, segment);
      handleOrbSelect(code, segment);
    },
    [handleOrbSelect],
  );

  /* ---- Three.js Scene ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId = 0;
    let disposed = false;

    import('three').then((THREE: typeof import('three')) => {
      if (disposed || !container) return;
      const el = container;

      /* ---- Scene Setup ---- */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        el.clientWidth / el.clientHeight,
        0.1,
        1000,
      );

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        console.warn('[NeuralOrbPanel] WebGL not available');
        return () => { disposed = true; sceneRef.current = null; };
      }
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      function adjustCamera() {
        const aspect = el.clientWidth / el.clientHeight;
        camera.position.set(-1.8, 0, aspect < 1 ? 34 / aspect : 25);
      }
      adjustCamera();

      /* ---- Orb Shader Material ---- */
      const orbMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vPosition;
          vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
          vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
          vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
          float snoise(vec3 v){
            const vec2 C=vec2(1./6.,1./3.);
            const vec4 D=vec4(0.,.5,1.,2.);
            vec3 i=floor(v+dot(v,C.yyy));
            vec3 x0=v-i+dot(i,C.xxx);
            vec3 g=step(x0.yzx,x0.xyz);
            vec3 l=1.-g;
            vec3 i1=min(g.xyz,l.zxy);
            vec3 i2=max(g.xyz,l.zxy);
            vec3 x1=x0-i1+C.xxx;
            vec3 x2=x0-i2+C.yyy;
            vec3 x3=x0-D.yyy;
            i=mod289(i);
            vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
            float n_=.142857142857;
            vec3 ns=n_*D.wyz-D.xzx;
            vec4 j=p-49.*floor(p*ns.z*ns.z);
            vec4 x_=floor(j*ns.z);
            vec4 y_=floor(j-7.*x_);
            vec4 x=x_*ns.x+ns.yyyy;
            vec4 y=y_*ns.x+ns.yyyy;
            vec4 h=1.-abs(x)-abs(y);
            vec4 b0=vec4(x.xy,y.xy);
            vec4 b1=vec4(x.zw,y.zw);
            vec4 s0=floor(b0)*2.+1.;
            vec4 s1=floor(b1)*2.+1.;
            vec4 sh=-step(h,vec4(0.));
            vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
            vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
            vec3 p0=vec3(a0.xy,h.x);
            vec3 p1=vec3(a0.zw,h.y);
            vec3 p2=vec3(a1.xy,h.z);
            vec3 p3=vec3(a1.zw,h.w);
            vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
            p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
            vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
            m=m*m;
            return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
          }
          void main(){
            vNormal=normalize(normalMatrix*normal);
            vPosition=position;
            float n1=snoise(position*2.+uTime*.4);
            float n2=snoise(position*4.-uTime*.3);
            float breathe=sin(uTime*1.2)*.05;
            float disp=(n1+n2*.5)*.15+breathe;
            vec3 np=position+normal*disp;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(np,1.);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main(){
            vec3 c1=vec3(.1,.2,.6);
            vec3 c2=vec3(.2,.7,1.);
            vec3 c3=vec3(.6,.2,.9);
            float gm=sin(vPosition.y*3.+uTime*.6)*.5+.5;
            vec3 base=mix(c1,c2,gm);
            float pm=sin(vPosition.x*4.-uTime*.5)*.5+.5;
            base=mix(base,c3,pm*.7);
            float fresnel=pow(1.-abs(dot(vNormal,vec3(0.,0.,1.))),3.5);
            vec3 glow=vec3(.4,.9,1.);
            gl_FragColor=vec4(base+glow*fresnel*1.2,.95);
          }
        `,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const sphereGeo = new THREE.SphereGeometry(1, 48, 48);
      const centerSunRadius = 2.0;
      const orbitRadius1 = 5.8;
      const orbitRadius2 = 8.8;
      const smallOrbRadius = 0.6;

      /* ---- Center Sun ---- */
      const centerSun = new THREE.Mesh(sphereGeo, orbMaterial);
      centerSun.scale.set(centerSunRadius, centerSunRadius, centerSunRadius);
      scene.add(centerSun);

      /* ---- Orbit Rings ---- */
      function createOrbitRing(radius: number) {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 128; i++) {
          const theta = (i / 128) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.15,
        });
        return new THREE.Line(geo, mat);
      }
      scene.add(createOrbitRing(orbitRadius1));
      scene.add(createOrbitRing(orbitRadius2));

      const orbitGroup1 = new THREE.Group();
      const orbitGroup2 = new THREE.Group();
      scene.add(orbitGroup1);
      scene.add(orbitGroup2);

      const allInteractiveOrbs: THREE.Mesh[] = [];
      const linkPairs: { inner: THREE.Object3D; outer: THREE.Object3D }[] = [];
      let selectedOrbSeg1: THREE.Mesh | null = null;
      let selectedOrbSeg2: THREE.Mesh | null = null;

      /* ---- Neural Link Lines ---- */
      let neuralLinesMesh: THREE.LineSegments | null = null;

      function initNeuralLinks() {
        const innerOrbs = allInteractiveOrbs.filter((o) => o.userData.segment === 1);
        const outerOrbs = allInteractiveOrbs.filter((o) => o.userData.segment === 2);
        for (let i = 0; i < innerOrbs.length; i++) {
          linkPairs.push({
            inner: innerOrbs[i],
            outer: outerOrbs[Math.floor(Math.random() * outerOrbs.length)],
          });
          linkPairs.push({
            inner: innerOrbs[i],
            outer: outerOrbs[Math.floor(Math.random() * outerOrbs.length)],
          });
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(linkPairs.length * 2 * 3), 3),
        );
        neuralLinesMesh = new THREE.LineSegments(
          geo,
          new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
          }),
        );
        scene.add(neuralLinesMesh);
      }

      function updateNeuralLinks() {
        if (!neuralLinesMesh || linkPairs.length === 0) return;
        const positions = (
          neuralLinesMesh.geometry.attributes.position as THREE.BufferAttribute
        ).array as Float32Array;
        const posInner = new THREE.Vector3();
        const posOuter = new THREE.Vector3();
        let idx = 0;
        linkPairs.forEach((pair) => {
          pair.inner.getWorldPosition(posInner);
          pair.outer.getWorldPosition(posOuter);
          positions[idx++] = posInner.x;
          positions[idx++] = posInner.y;
          positions[idx++] = posInner.z;
          positions[idx++] = posOuter.x;
          positions[idx++] = posOuter.y;
          positions[idx++] = posOuter.z;
        });
        neuralLinesMesh.geometry.attributes.position.needsUpdate = true;
      }

      /* ---- Whip Beam Effect ---- */
      const whipBeam1 = createWhipBeam(0x38bdf8);
      const whipBeam2 = createWhipBeam(0xc084fc);

      function createWhipBeam(colorHex: number) {
        const mat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        });
        const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
        mesh.visible = false;
        scene.add(mesh);
        return mesh;
      }

      function updateWhipBeam(
        beamMesh: THREE.Mesh,
        orb: THREE.Mesh | null,
        timeOffset: number,
      ) {
        if (!orb) {
          beamMesh.visible = false;
          return;
        }
        beamMesh.visible = true;
        const orbPos = new THREE.Vector3();
        orb.getWorldPosition(orbPos);
        const dir = new THREE.Vector3().subVectors(orbPos, new THREE.Vector3(0, 0, 0)).normalize();
        const startPt = dir.clone().multiplyScalar(centerSunRadius);
        const endPt = orbPos.clone().sub(dir.clone().multiplyScalar(orb.scale.x));
        const pts = 20;
        const points: THREE.Vector3[] = [];
        const time = Date.now() * 0.006 + timeOffset;
        const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
        for (let i = 0; i < pts; i++) {
          const t = i / (pts - 1);
          const p = new THREE.Vector3().lerpVectors(startPt, endPt, t);
          const wave = Math.sin(t * 8 - time) * 0.18 * Math.sin(t * Math.PI);
          p.add(perp.clone().multiplyScalar(wave));
          points.push(p);
        }
        const curve = new THREE.CatmullRomCurve3(points);
        beamMesh.geometry.dispose();
        beamMesh.geometry = new THREE.TubeGeometry(curve, 24, 0.075, 8, false);
      }

      /* ---- Public API for React ---- */
      sceneRef.current = {
        triggerOrbSelection(code: string, segment: number) {
          const orb = allInteractiveOrbs.find(
            (o) => o.userData.code === code && o.userData.segment === segment,
          );
          if (!orb) return;
          const seg = orb.userData.segment;
          if (seg === 1) {
            if (selectedOrbSeg1)
              selectedOrbSeg1.scale.set(smallOrbRadius, smallOrbRadius, smallOrbRadius);
            selectedOrbSeg1 = orb;
            selectedOrbSeg1.scale.set(0.85, 0.85, 0.85);
          } else {
            if (selectedOrbSeg2)
              selectedOrbSeg2.scale.set(smallOrbRadius, smallOrbRadius, smallOrbRadius);
            selectedOrbSeg2 = orb;
            selectedOrbSeg2.scale.set(0.85, 0.85, 0.85);
          }
        },
        clearSelection() {
          if (selectedOrbSeg1)
            selectedOrbSeg1.scale.set(smallOrbRadius, smallOrbRadius, smallOrbRadius);
          if (selectedOrbSeg2)
            selectedOrbSeg2.scale.set(smallOrbRadius, smallOrbRadius, smallOrbRadius);
          selectedOrbSeg1 = null;
          selectedOrbSeg2 = null;
        },
      };

      /* ---- 3D Click / Raycast ---- */
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onPointerDown = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(allInteractiveOrbs);
        if (intersects.length > 0) {
          const orb = intersects[0].object;
          const code = orb.userData.code;
          const seg = orb.userData.segment;
          sceneRef.current?.triggerOrbSelection(code, seg);
          handleOrbSelect(code, seg);
        }
      };
      el.addEventListener('pointerdown', onPointerDown);

      /* ---- Font Loading & Orb Creation ---- */
      Promise.all([
        import('three/examples/jsm/loaders/FontLoader.js'),
        import('three/examples/jsm/geometries/TextGeometry.js'),
      ]).then(([fontMod, textGeoMod]) => {
        if (disposed) return;
        const { FontLoader } = fontMod;
        const { TextGeometry } = textGeoMod;
        const fontLoader = new FontLoader();
        fontLoader.load(
          'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
          (font) => {
            if (disposed) return;
            const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

            /* EN Text on center sun */
            const enGeo = new TextGeometry('EN', {
              font,
              size: 0.675,
              depth: 0.05,
              curveSegments: 8,
            });
            enGeo.computeBoundingBox();
            const enOffset = new THREE.Vector3();
            enGeo.boundingBox!.getCenter(enOffset);
            const enMesh = new THREE.Mesh(enGeo, textMat);
            enMesh.position.set(-enOffset.x, -enOffset.y, -enOffset.z);
            centerSun.add(enMesh);

            /* Segment 1 — Disciplines */
            DISCIPLINES_DATA.forEach((item) => {
              const angle =
                (DISCIPLINES_DATA.indexOf(item) / DISCIPLINES_DATA.length) * Math.PI * 2;
              const pivot = new THREE.Group();
              pivot.position.set(
                Math.cos(angle) * orbitRadius1,
                Math.sin(angle) * orbitRadius1,
                0,
              );
              const orb = new THREE.Mesh(sphereGeo, orbMaterial.clone());
              orb.scale.set(smallOrbRadius, smallOrbRadius, smallOrbRadius);
              orb.userData = { code: item.code, full: item.full, segment: 1 };
              pivot.add(orb);
              allInteractiveOrbs.push(orb);

              const tGeo = new TextGeometry(item.code, {
                font,
                size: 0.3,
                depth: 0.02,
                curveSegments: 8,
              });
              tGeo.computeBoundingBox();
              const off = new THREE.Vector3();
              tGeo.boundingBox!.getCenter(off);
              const tMesh = new THREE.Mesh(tGeo, textMat);
              tMesh.position.set(-off.x, -off.y, 0.1);
              pivot.add(tMesh);
              orbitGroup1.add(pivot);
            });

            /* Segment 2 — Languages */
            LANGUAGES_DATA.forEach((item) => {
              const angle =
                (LANGUAGES_DATA.indexOf(item) / LANGUAGES_DATA.length) * Math.PI * 2;
              const pivot = new THREE.Group();
              pivot.position.set(
                Math.cos(angle) * orbitRadius2,
                Math.sin(angle) * orbitRadius2,
                0,
              );
              const orb = new THREE.Mesh(sphereGeo, orbMaterial.clone());
              orb.scale.set(smallOrbRadius, smallOrbRadius, smallOrbRadius);
              orb.userData = { code: item.code, full: item.full, segment: 2 };
              pivot.add(orb);
              allInteractiveOrbs.push(orb);

              const tGeo = new TextGeometry(item.code, {
                font,
                size: 0.3,
                depth: 0.02,
                curveSegments: 8,
              });
              tGeo.computeBoundingBox();
              const off = new THREE.Vector3();
              tGeo.boundingBox!.getCenter(off);
              const tMesh = new THREE.Mesh(tGeo, textMat);
              tMesh.position.set(-off.x, -off.y, 0.1);
              pivot.add(tMesh);
              orbitGroup2.add(pivot);
            });

            initNeuralLinks();
          },
        );
      });

      /* ---- Animation Loop ---- */
      const clock = new THREE.Clock();
      function animate() {
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        orbMaterial.uniforms.uTime.value += delta;
        centerSun.rotation.y += delta * 0.2;
        orbitGroup1.rotation.z += delta * 0.04;
        orbitGroup2.rotation.z -= delta * 0.025;
        orbitGroup1.children.forEach((p) => (p.rotation.z = -orbitGroup1.rotation.z));
        orbitGroup2.children.forEach((p) => (p.rotation.z = -orbitGroup2.rotation.z));
        updateNeuralLinks();
        updateWhipBeam(whipBeam1, selectedOrbSeg1, 0);
        updateWhipBeam(whipBeam2, selectedOrbSeg2, 100);
        renderer.render(scene, camera);
      }
      animate();

      /* ---- Resize ---- */
      const onResize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        adjustCamera();
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      /* ---- Cleanup ---- */
      return () => {
        disposed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        el.removeEventListener('pointerdown', onPointerDown);
        renderer.dispose();
        el.removeChild(renderer.domElement);
        sceneRef.current = null;
      };
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      sceneRef.current = null;
    };
  }, [handleOrbSelect]);

  /* ---- JSX ---- */
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#020617',
        backgroundImage: 'radial-gradient(circle at 30% 50%, #1e1b4b 0%, #020617 75%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: 'hidden',
        margin: 0,
      }}
    >
      {/* 3D Canvas */}
      <div ref={containerRef} style={{ flex: '0 0 73%', height: '100%', position: 'relative' }} />

      {/* UI Panel */}
      <div
        style={{
          flex: '0 0 27%',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(56, 189, 248, 0.2)',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#f8fafc',
          overflow: 'hidden',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        {/* Disciplines */}
        <div>
          <div className="cyber-header">
            <span>DISCIPLINES</span>
            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>SEG 01</span>
          </div>
          <div className="segment-container">
            {DISCIPLINES_DATA.map((d) => (
              <div
                key={d.code}
                className={`menu-item${selectedDiscipline === d.id ? ' active-seg1' : ''}`}
                onClick={() => handleMenuClick(d.code, 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMenuClick(d.code, 1);
                }}
              >
                <span>{d.full}</span>
                <span className="code-tag">{d.code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <div className="cyber-header">
            <span>LANGUAGES</span>
            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>SEG 02</span>
          </div>
          <div className="segment-container">
            {LANGUAGES_DATA.map((l) => (
              <div
                key={l.code}
                className={`menu-item${selectedLanguage === l.id ? ' active-seg2' : ''}`}
                onClick={() => handleMenuClick(l.code, 2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMenuClick(l.code, 2);
                }}
              >
                <span>{l.full}</span>
                <span className="code-tag">{l.code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div id="cipher-console">
            <div className="console-line">{'> SYSTEM READY...'}</div>
            <div className="console-line" style={{ color: statusColor }}>
              {consoleMsg}
            </div>
          </div>
          <div className="button-group">
            <button
              type="button"
              className="cyber-btn btn-back"
              onClick={handleBack}
            >
              ◄ BACK
            </button>
            <button
              type="button"
              className="cyber-btn btn-enter"
              onClick={handleEnter}
              disabled={isSaving}
            >
              ENTER ►
            </button>
          </div>
        </div>
      </div>

      {/* Inline Styles for Panel CSS */}
      <style>{`
        .cyber-header {
          font-size: 0.75rem;
          letter-spacing: 1.2px;
          color: #38bdf8;
          text-transform: uppercase;
          border-bottom: 1px dashed rgba(56, 189, 248, 0.3);
          padding-bottom: 1px;
          margin-bottom: 2px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: monospace;
        }
        .cyber-header::before {
          content: "// ";
          color: #f43f5e;
        }
        .segment-container {
          display: flex;
          flex-direction: column;
          gap: 1px;
          max-height: 30vh;
          overflow-y: auto;
        }
        .menu-item {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1px 6px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.68rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.15s ease;
          font-family: monospace;
          height: 20px;
          color: #f8fafc;
        }
        .menu-item:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          transform: translateX(-2px);
        }
        .menu-item.active-seg1 {
          background: rgba(56, 189, 248, 0.3);
          border-color: #38bdf8;
          color: #38bdf8;
          font-weight: bold;
        }
        .menu-item.active-seg2 {
          background: rgba(192, 132, 252, 0.3);
          border-color: #c084fc;
          color: #c084fc;
          font-weight: bold;
        }
        .code-tag {
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          padding: 0px 3px;
          border-radius: 2px;
          font-size: 0.62rem;
        }
        .menu-item.active-seg1 .code-tag { background: #38bdf8; color: #020617; }
        .menu-item.active-seg2 .code-tag { background: #c084fc; color: #020617; }
        #cipher-console {
          background: #000;
          border: 1px solid #1e293b;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.65rem;
          color: #22c55e;
          height: 38px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .console-line { opacity: 0.9; white-space: nowrap; }
        .button-group { display: flex; gap: 6px; }
        .cyber-btn {
          flex: 1;
          padding: 5px 0;
          font-family: monospace;
          font-size: 0.7rem;
          font-weight: bold;
          letter-spacing: 1px;
          border: 1px solid;
          background: transparent;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s ease;
          text-align: center;
        }
        .btn-back { color: #f43f5e; border-color: #f43f5e; }
        .btn-back:hover { background: rgba(244, 63, 94, 0.2); box-shadow: 0 0 8px rgba(244, 63, 94, 0.4); }
        .btn-enter { color: #38bdf8; border-color: #38bdf8; }
        .btn-enter:hover { background: rgba(56, 189, 248, 0.2); box-shadow: 0 0 8px rgba(56, 189, 248, 0.4); }
        .bottom-section { display: flex; flex-direction: column; gap: 4px; }
      `}</style>
    </div>
  );
};

export default NeuralOrbPanel;
