import type * as THREE from 'three';

import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/shared/logger';

import { useLearningStore } from '@/core/learning';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

/* ------------------------------------------------------------------ */
/* Discipline / Language data                                          */
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
/* Canvas-texture sprite helper (replaces FontLoader + TextGeometry)   */
/* ------------------------------------------------------------------ */
function makeTextSprite(
  THREE: typeof import('three'),
  text: string,
  opts: { fontSize?: number; color?: string; scale?: number } = {}
) {
  const fontSize = opts.fontSize ?? 48;
  const color = opts.color ?? '#ffffff';
  const scale = opts.scale ?? 1;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `bold ${fontSize}px monospace`;
  ctx.font = font;
  const m = ctx.measureText(text);
  const pad = fontSize * 0.3;

  canvas.width = Math.ceil(m.width + pad * 2);
  canvas.height = Math.ceil(fontSize * 1.4 + pad * 2);

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set((canvas.width / canvas.height) * scale, scale, 1);
  return sprite;
}

/* ------------------------------------------------------------------ */
/* NeuralOrbPanel                                                      */
/* ------------------------------------------------------------------ */
export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage>('tr');
  const [isSaving, setIsSaving] = useState(false);
  const [consoleLines, setConsoleLines] = useState([
    '> SYSTEM READY...',
    '> SELECT 1 ORB PER SEGMENT',
  ]);
  const [statusColor, setStatusColor] = useState('#22c55e');

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneApi = useRef<{
    triggerOrbSelection: (code: string, segment: number) => void;
    clearSelection: () => void;
  } | null>(null);

  /* ---- helpers to update console ---- */
  const pushConsole = useCallback((line: string, color = '#22c55e') => {
    setConsoleLines((prev) => [prev[1] ?? '', line]);
    setStatusColor(color);
  }, []);

  /* ---- ENTER ---- */
  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !currentUser) {
      pushConsole('> ERROR: SELECT 1 DISCIPLINE!', '#f43f5e');
      return;
    }
    if (!selectedLanguage) {
      pushConsole('> ERROR: SELECT 1 LANGUAGE!', '#f43f5e');
      return;
    }
    setIsSaving(true);
    pushConsole(`> EXEC: [${selectedDiscipline}] + [${selectedLanguage}] GRANTED!`, '#22c55e');
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
  }, [selectedDiscipline, selectedLanguage, currentUser, setLanguage, onComplete, pushConsole]);

  /* ---- BACK ---- */
  const handleBack = useCallback(() => {
    setSelectedDiscipline(null);
    setSelectedLanguage('tr');
    pushConsole('> CLEARED. AWAITING INPUT...', '#f43f5e');
    sceneApi.current?.clearSelection();
  }, [pushConsole]);

  /* ---- orb selection callback ---- */
  const handleOrbSelect = useCallback(
    (code: string, segment: number) => {
      if (segment === 1) {
        const d = DISCIPLINES_DATA.find((x) => x.code === code);
        if (d) {
          setSelectedDiscipline(d.id);
          pushConsole(`> DISCIPLINE: [${d.code}] — ${d.full}`, '#c084fc');
        }
      } else {
        const l = LANGUAGES_DATA.find((x) => x.code === code);
        if (l) {
          setSelectedLanguage(l.id);
          pushConsole(`> LANGUAGE: [${l.code}] — ${l.id.toUpperCase()}`, '#38bdf8');
        }
      }
    },
    [pushConsole]
  );

  /* ---- menu click ---- */
  const handleMenuClick = useCallback(
    (code: string, segment: number) => {
      sceneApi.current?.triggerOrbSelection(code, segment);
      handleOrbSelect(code, segment);
    },
    [handleOrbSelect]
  );

  /* ================================================================ */
  /* Three.js Scene (dynamic import for code-splitting)               */
  /* ================================================================ */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId = 0;
    let destroyed = false;

    import('three').then((THREE) => {
      if (destroyed || !container) return;
      const el = container;

      /* ---- Scene / Camera / Renderer ---- */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );

      let r: THREE.WebGLRenderer;
      try {
        r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        logger.w('[NeuralOrbPanel] WebGL unavailable');
        return;
      }
      r.setSize(el.clientWidth, el.clientHeight);
      r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(r.domElement);

      function adjustCamera() {
        const aspect = el.clientWidth / el.clientHeight;
        camera.position.set(-1.8, 0, aspect < 1 ? 34 / aspect : 25);
      }
      adjustCamera();

      /* ---- Shared orb shader material ---- */
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
            vec4 p=permute(permute(permute(
              i.z+vec4(0.,i1.z,i2.z,1.))
              +i.y+vec4(0.,i1.y,i2.y,1.))
              +i.x+vec4(0.,i1.x,i2.x,1.));
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

      /* ---- Geometry & constants ---- */
      const sphereGeo = new THREE.SphereGeometry(1, 48, 48);
      const CENTER_R = 2.0;
      const ORBIT_R1 = 5.8;
      const ORBIT_R2 = 8.8;
      const SMALL_R = 0.6;

      /* ---- Center Sun ---- */
      const centerSun = new THREE.Mesh(sphereGeo, orbMaterial);
      centerSun.scale.setScalar(CENTER_R);
      scene.add(centerSun);

      /* ---- EN label on center sun ---- */
      const enLabel = makeTextSprite(THREE, 'EN', { fontSize: 64, color: '#ffffff', scale: 1.6 });
      centerSun.add(enLabel);

      /* ---- Orbit rings (decorative) ---- */
      function addRing(radius: number) {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 128; i++) {
          const t = (i / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
        }
        scene.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15 })
          )
        );
      }
      addRing(ORBIT_R1);
      addRing(ORBIT_R2);

      /* ---- Orbit groups ---- */
      const orbitGroup1 = new THREE.Group(); // disciplines
      const orbitGroup2 = new THREE.Group(); // languages
      scene.add(orbitGroup1);
      scene.add(orbitGroup2);

      /* ---- Track interactive orbs ---- */
      const interactiveOrbs: THREE.Mesh[] = [];
      const linkPairs: { inner: THREE.Object3D; outer: THREE.Object3D }[] = [];
      let sel1: THREE.Mesh | null = null;
      let sel2: THREE.Mesh | null = null;

      /* ---- Create discipline orbs (inner ring) ---- */
      DISCIPLINES_DATA.forEach((item, i) => {
        const angle = (i / DISCIPLINES_DATA.length) * Math.PI * 2;
        const pivot = new THREE.Group();
        pivot.position.set(Math.cos(angle) * ORBIT_R1, Math.sin(angle) * ORBIT_R1, 0);

        const orb = new THREE.Mesh(sphereGeo, orbMaterial.clone());
        orb.scale.setScalar(SMALL_R);
        orb.userData = { code: item.code, full: item.full, segment: 1 };
        pivot.add(orb);

        const label = makeTextSprite(THREE, item.code, {
          fontSize: 36,
          color: '#38bdf8',
          scale: 0.9,
        });
        label.position.z = 0.1;
        pivot.add(label);

        interactiveOrbs.push(orb);
        orbitGroup1.add(pivot);
      });

      /* ---- Create language orbs (outer ring) ---- */
      LANGUAGES_DATA.forEach((item, i) => {
        const angle = (i / LANGUAGES_DATA.length) * Math.PI * 2;
        const pivot = new THREE.Group();
        pivot.position.set(Math.cos(angle) * ORBIT_R2, Math.sin(angle) * ORBIT_R2, 0);

        const orb = new THREE.Mesh(sphereGeo, orbMaterial.clone());
        orb.scale.setScalar(SMALL_R);
        orb.userData = { code: item.code, full: item.full, segment: 2 };
        pivot.add(orb);

        const label = makeTextSprite(THREE, item.code, {
          fontSize: 36,
          color: '#c084fc',
          scale: 0.9,
        });
        label.position.z = 0.1;
        pivot.add(label);

        interactiveOrbs.push(orb);
        orbitGroup2.add(pivot);
      });

      /* ---- Neural link lines ---- */
      const innerOrbs = interactiveOrbs.filter((o) => o.userData.segment === 1);
      const outerOrbs = interactiveOrbs.filter((o) => o.userData.segment === 2);
      for (const inner of innerOrbs) {
        linkPairs.push({ inner, outer: outerOrbs[Math.floor(Math.random() * outerOrbs.length)] });
        linkPairs.push({ inner, outer: outerOrbs[Math.floor(Math.random() * outerOrbs.length)] });
      }

      const linkGeo = new THREE.BufferGeometry();
      linkGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(linkPairs.length * 2 * 3), 3)
      );
      const neuralLines = new THREE.LineSegments(
        linkGeo,
        new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.15,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(neuralLines);

      function updateNeuralLinks() {
        const pos = (neuralLines.geometry.attributes.position as THREE.BufferAttribute)
          .array as Float32Array;
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        let idx = 0;
        for (const pair of linkPairs) {
          pair.inner.getWorldPosition(a);
          pair.outer.getWorldPosition(b);
          pos[idx++] = a.x;
          pos[idx++] = a.y;
          pos[idx++] = a.z;
          pos[idx++] = b.x;
          pos[idx++] = b.y;
          pos[idx++] = b.z;
        }
        neuralLines.geometry.attributes.position.needsUpdate = true;
      }

      /* ---- Whip beam helpers ---- */
      function makeWhipBeam(color: number) {
        const m = new THREE.Mesh(
          new THREE.BufferGeometry(),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
          })
        );
        m.visible = false;
        scene.add(m);
        return m;
      }
      const whip1 = makeWhipBeam(0x38bdf8);
      const whip2 = makeWhipBeam(0xc084fc);

      function updateWhip(beam: THREE.Mesh, orb: THREE.Mesh | null, tOff: number) {
        if (!orb) {
          beam.visible = false;
          return;
        }
        beam.visible = true;
        const oPos = new THREE.Vector3();
        orb.getWorldPosition(oPos);
        const dir = oPos.clone().normalize();
        const start = dir.clone().multiplyScalar(CENTER_R);
        const end = oPos.clone().sub(dir.clone().multiplyScalar(orb.scale.x));
        const n = 20;
        const pts: THREE.Vector3[] = [];
        const time = Date.now() * 0.006 + tOff;
        const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1);
          const p = new THREE.Vector3().lerpVectors(start, end, t);
          p.add(perp.clone().multiplyScalar(Math.sin(t * 8 - time) * 0.18 * Math.sin(t * Math.PI)));
          pts.push(p);
        }
        beam.geometry.dispose();
        beam.geometry = new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(pts),
          24,
          0.075,
          8,
          false
        );
      }

      /* ---- Scene API for React ---- */
      sceneApi.current = {
        triggerOrbSelection(code, segment) {
          const orb = interactiveOrbs.find(
            (o) => o.userData.code === code && o.userData.segment === segment
          );
          if (!orb) return;
          if (segment === 1) {
            if (sel1) sel1.scale.setScalar(SMALL_R);
            sel1 = orb;
            sel1.scale.setScalar(0.85);
          } else {
            if (sel2) sel2.scale.setScalar(SMALL_R);
            sel2 = orb;
            sel2.scale.setScalar(0.85);
          }
        },
        clearSelection() {
          if (sel1) sel1.scale.setScalar(SMALL_R);
          if (sel2) sel2.scale.setScalar(SMALL_R);
          sel1 = null;
          sel2 = null;
        },
      };

      /* ---- 3D click / raycast ---- */
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const onPointerDown = (e: PointerEvent) => {
        const rect = r.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(interactiveOrbs);
        if (hits.length > 0) {
          const { code, segment } = hits[0].object.userData;
          sceneApi.current?.triggerOrbSelection(code, segment);
          handleOrbSelect(code, segment);
        }
      };
      el.addEventListener('pointerdown', onPointerDown);

      /* ---- Animation loop ---- */
      const clock = new THREE.Clock();
      function animate() {
        animId = requestAnimationFrame(animate);
        const dt = clock.getDelta();

        // Update ALL orb materials' time uniform
        orbMaterial.uniforms.uTime.value += dt;
        for (const orb of interactiveOrbs) {
          const mat = orb.material as THREE.ShaderMaterial;
          if (mat.uniforms?.uTime) mat.uniforms.uTime.value += dt;
        }

        centerSun.rotation.y += dt * 0.2;
        orbitGroup1.rotation.z += dt * 0.04;
        orbitGroup2.rotation.z -= dt * 0.025;

        // Counter-rotate pivots so text stays upright
        orbitGroup1.children.forEach((p) => {
          p.rotation.z = -orbitGroup1.rotation.z;
        });
        orbitGroup2.children.forEach((p) => {
          p.rotation.z = -orbitGroup2.rotation.z;
        });

        updateNeuralLinks();
        updateWhip(whip1, sel1, 0);
        updateWhip(whip2, sel2, 100);

        r.render(scene, camera);
      }
      animate();

      /* ---- Resize ---- */
      const onResize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        r.setSize(w, h);
        camera.aspect = w / h;
        adjustCamera();
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      /* ---- Cleanup ---- */
      return () => {
        destroyed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        el.removeEventListener('pointerdown', onPointerDown);
        r.dispose();
        el.removeChild(r.domElement);
        sceneApi.current = null;
      };
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      sceneApi.current = null;
    };
  }, [handleOrbSelect]);

  /* ================================================================ */
  /* JSX                                                              */
  /* ================================================================ */
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
      {/* ---- 3D Canvas ---- */}
      <div ref={containerRef} style={{ flex: '0 0 73%', height: '100%', position: 'relative' }} />

      {/* ---- UI Panel ---- */}
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

        {/* Bottom */}
        <div className="bottom-section">
          <div id="cipher-console">
            {consoleLines.map((line, i) => (
              <div
                key={`${i}-${line}`}
                className="console-line"
                style={{ color: i === 1 ? statusColor : undefined }}
              >
                {line}
              </div>
            ))}
          </div>
          <div className="button-group">
            <button type="button" className="cyber-btn btn-back" onClick={handleBack}>
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

      {/* ---- Panel CSS ---- */}
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
          min-height: 38px;
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
