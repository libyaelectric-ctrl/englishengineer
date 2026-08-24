import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
} from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

import { LearningProfileRepository } from '@/features/profile/profile.repository';

/* ------------------------------------------------------------------ */
/* Discipline accent colours (kept from original for icon-box tints)   */
/* ------------------------------------------------------------------ */
const DISCIPLINE_ACCENTS: Record<EngineeringDiscipline, { bg: string; fg: string }> = {
  architecture: { bg: 'rgba(217,119,6,0.18)', fg: '#f59e0b' },
  chemical: { bg: 'rgba(16,185,129,0.16)', fg: '#34d399' },
  civil: { bg: 'rgba(234,88,12,0.18)', fg: '#fb923c' },
  electrical: { bg: 'rgba(234,179,8,0.18)', fg: '#facc15' },
  electronics: { bg: 'rgba(6,182,212,0.16)', fg: '#22d3ee' },
  hse: { bg: 'rgba(16,185,129,0.16)', fg: '#4ade80' },
  industrial: { bg: 'rgba(59,130,246,0.16)', fg: '#60a5fa' },
  mechanical: { bg: 'rgba(244,63,94,0.16)', fg: '#fb7185' },
  mechatronics: { bg: 'rgba(168,85,247,0.18)', fg: '#c084fc' },
  software: { bg: 'rgba(56,189,248,0.16)', fg: '#38bdf8' },
};

/* ------------------------------------------------------------------ */
/* SVG icons for disciplines (inline, lightweight)                     */
/* ------------------------------------------------------------------ */
const DISCipline_SVGs: Record<string, string> = {
  Building2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V7l8-4 8 4v14"/><path d="M4 21h16"/><path d="M9 21V12h6v9"/></svg>`,
  FlaskConical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6L4 20a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L15 8V2"/><path d="M9 2h6"/><path d="M7 15h10"/></svg>`,
  HardHat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6"/><path d="M15 21v-6"/></svg>`,
  Zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></svg>`,
  Cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>`,
  ShieldCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.7 8 11 4.5-2.3 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>`,
  Factory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>`,
  Wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/></svg>`,
  Bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="11" rx="2"/><circle cx="9" cy="14.5" r="1"/><circle cx="15" cy="14.5" r="1"/><path d="M12 9V5"/><circle cx="12" cy="3.5" r="1.5"/><path d="M2 13h2M20 13h2"/></svg>`,
  Code2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
};

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#020617" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

/* ------------------------------------------------------------------ */
/* English-only discipline names (disciplines always show in English)   */
/* ------------------------------------------------------------------ */
const DISCIPLINE_EN: Record<EngineeringDiscipline, string> = {
  architecture: 'Architecture',
  chemical: 'Chemical Engineering',
  civil: 'Civil Engineering',
  electrical: 'Electrical Engineering',
  electronics: 'Electronics Engineering',
  hse: 'HSE Engineering',
  industrial: 'Industrial Engineering',
  mechanical: 'Mechanical Engineering',
  mechatronics: 'Mechatronics / Robotics',
  software: 'Software Engineering',
};



/* ------------------------------------------------------------------ */
/* Three.js Orb (dynamic import, no audio — pure visual)               */
/* ------------------------------------------------------------------ */
const OrbCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId = 0;

    import('three').then((THREE) => {
      // Gracefully handle environments without WebGL (e.g. jsdom in tests)
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('webgl2');
        if (!gl) return;
      } catch {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.z = 3.5;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const vertexShader = `
        uniform float uTime;
        varying vec2 vUv;
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
          vUv=uv;
          vNormal=normalize(normalMatrix*normal);
          vPosition=position;
          float n1=snoise(position*2.+uTime*.4);
          float n2=snoise(position*4.-uTime*.3);
          float breathe=sin(uTime*1.2)*.05;
          float disp=(n1+n2*.5)*.15+breathe;
          vec3 np=position+normal*disp;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(np,1.);
        }
      `;

      const fragmentShader = `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main(){
          vec3 c1=vec3(.1,.2,.6);
          vec3 c2=vec3(.2,.7,1.);
          vec3 c3=vec3(.6,.2,.9);
          vec3 c4=vec3(.8,.3,.7);
          float gm=sin(vPosition.y*3.+uTime*.6)*.5+.5;
          vec3 base=mix(c1,c2,gm);
          float pm=sin(vPosition.x*4.-uTime*.5)*.5+.5;
          base=mix(base,c3,pm*.7);
          float hl=sin(vPosition.z*5.+uTime*.8)*.5+.5;
          if(hl>.8) base=mix(base,c4,(hl-.8)*5.);
          float fresnel=pow(1.-abs(dot(vNormal,vec3(0.,0.,1.))),3.5);
          vec3 glow=vec3(.6,.9,1.);
          vec3 final_=base+glow*fresnel*.9;
          gl_FragColor=vec4(final_,.95);
        }
      `;

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

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        uniforms.uTime.value += delta;
        orb.rotation.y += delta * 0.15;
        orb.rotation.z += delta * 0.05;
        renderer.render(scene, camera);
      };
      animId = requestAnimationFrame(animate);

      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      // Store cleanup for unmount
      (container as unknown as { __cleanup?: () => void }).__cleanup = () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    });

    return () => {
      (container as unknown as { __cleanup?: () => void }).__cleanup?.();
    };
  }, []);

  // Fallback when WebGL is not available (e.g. tests)
  const [hasWebGL, setHasWebGL] = useState(true);
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('webgl2');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div
        className="orb-container"
        style={{
          width: 240, height: 240,
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(56,189,248,0.3))',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 0 80px -10px rgba(139,92,246,0.4), 0 0 120px -20px rgba(56,189,248,0.2)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="orb-container"
      style={{
        width: 240,
        height: 240,
        position: 'relative',
        borderRadius: '9999px',
        backgroundColor: 'rgba(15,23,42,0.3)',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 0 80px -10px rgba(139,92,246,0.4), 0 0 120px -20px rgba(56,189,248,0.2)',
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Main Onboarding Panel                                               */
/* ------------------------------------------------------------------ */
export const OnboardingPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const translate = useLocalizationStore((s) => s.translate);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage>('tr');
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = useCallback(async () => {
    if (!selectedDiscipline || !currentUser) return;
    setIsSaving(true);
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

  const disciplineMeta = useMemo(() => {
    if (!selectedDiscipline) return null;
    return DISCIPLINE_META[selectedDiscipline];
  }, [selectedDiscipline]);

  const selectedLangOption = useMemo(() => {
    return INTERFACE_LANGUAGES.find((l) => l.id === selectedLanguage);
  }, [selectedLanguage]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#020617' }}>
      <style>{`
        .onb-eyebrow {
          text-align: center;
          font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
          font-size: 12px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .onb-headline {
          text-align: center;
          font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
          font-weight: 600;
          font-size: 28px;
          letter-spacing: -0.01em;
          margin: 0 0 40px;
          background: linear-gradient(90deg, #fff, #cdd6f4 55%, #a5b4fc);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .onb-layout {
          display: grid;
          grid-template-columns: 1fr 280px 1fr;
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
          align-items: start;
          padding: 48px 24px 64px;
        }
        .onb-col { min-width: 0; }
        .onb-col-title {
          font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #94a3b8;
          margin: 0 0 16px;
          padding-left: 4px;
        }
        .onb-col-hint {
          font-family: 'Inter', ui-sans-serif, sans-serif;
          font-size: 12.5px;
          color: #94a3b8;
          margin: -10px 0 16px;
          padding-left: 4px;
          line-height: 1.5;
        }
        .onb-disciplines { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .onb-card {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.14);
          background: rgba(15,23,42,0.45);
          backdrop-filter: blur(6px);
          transition: border-color .2s, box-shadow .25s, transform .15s, background .2s;
          box-shadow: 0 0 0 0 rgba(139,92,246,0);
        }
        .onb-card:hover {
          background: rgba(30,27,75,0.55);
          transform: translateY(-1px);
          border-color: rgba(148,163,184,0.28);
        }
        .onb-card:focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }
        .onb-card.selected {
          border-color: transparent;
          background: linear-gradient(#1e1b4b, #1e1b4b) padding-box,
                      linear-gradient(120deg, #8b5cf6, #38bdf8) border-box;
          border: 1px solid transparent;
          box-shadow: 0 0 22px -6px rgba(139,92,246,0.55), 0 0 34px -12px rgba(56,189,248,0.35);
        }
        .onb-icon-box {
          flex: 0 0 auto;
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .onb-icon-box svg { width: 18px; height: 18px; }
        .onb-card-text { min-width: 0; flex: 1; overflow: hidden; }
        .onb-card-title {
          font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
          font-weight: 600; font-size: 13.5px; color: #e9edf5;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .onb-check {
          margin-left: auto; flex: 0 0 auto;
          width: 16px; height: 16px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(120deg, #8b5cf6, #38bdf8);
          opacity: 0; transform: scale(.6);
          transition: opacity .2s, transform .2s;
        }
        .onb-card.selected .onb-check { opacity: 1; transform: scale(1); }
        .onb-check svg { width: 10px; height: 10px; }
        .onb-languages { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .onb-lang-card {
          all: unset;
          cursor: pointer;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 6px; padding: 18px 8px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.14);
          background: rgba(15,23,42,0.45);
          backdrop-filter: blur(6px);
          transition: border-color .2s, box-shadow .25s, transform .15s, background .2s;
          text-align: center;
        }
        .onb-lang-card:hover {
          background: rgba(30,27,75,0.55);
          transform: translateY(-1px);
          border-color: rgba(148,163,184,0.28);
        }
        .onb-lang-card:focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }
        .onb-lang-card.selected {
          border-color: transparent;
          background: linear-gradient(#1e1b4b, #1e1b4b) padding-box,
                      linear-gradient(120deg, #8b5cf6, #38bdf8) border-box;
          border: 1px solid transparent;
          box-shadow: 0 0 22px -6px rgba(139,92,246,0.55), 0 0 34px -12px rgba(56,189,248,0.35);
        }
        .onb-lang-code {
          font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
          font-weight: 700; font-size: 15px; letter-spacing: 0.03em; color: #e9edf5;
        }
        .onb-lang-native {
          font-family: 'Inter', ui-sans-serif, sans-serif;
          font-size: 12.5px; color: #94a3b8;
        }
        .onb-center-col {
          display: flex; flex-direction: column; align-items: center;
          transform: translateX(0);
          padding-top: 40px;
        }
        .onb-bottom-block {
          display: flex; flex-direction: column; align-items: center;
          width: 100%; margin-top: auto; padding-top: 32px;
        }
        .onb-summary {
          width: 100%; max-width: 240px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .onb-summary-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 16px; border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.14);
          background: rgba(15,23,42,0.45);
          font-family: 'Inter', ui-sans-serif, sans-serif; font-size: 13px;
        }
        .onb-summary-label { color: #94a3b8; }
        .onb-summary-value {
          font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
          font-weight: 600; color: #e9edf5;
          max-width: 190px; text-align: right;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .onb-summary-value.empty { color: #94a3b8; font-weight: 500; font-family: 'Inter', ui-sans-serif, sans-serif; }
        .onb-continue {
          all: unset;
          margin-top: 18px; width: 100%; max-width: 240px;
          text-align: center; cursor: pointer;
          padding: 14px 20px; border-radius: 14px;
          font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
          font-weight: 600; font-size: 14.5px; letter-spacing: 0.02em;
          color: #fff;
          background: linear-gradient(120deg, #8b5cf6, #38bdf8);
          box-shadow: 0 0 24px -6px rgba(139,92,246,0.6);
          transition: opacity .2s, transform .15s, box-shadow .2s;
        }
        .onb-continue:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 30px -4px rgba(56,189,248,0.6);
        }
        .onb-continue:disabled {
          cursor: not-allowed; opacity: 0.35;
          background: linear-gradient(120deg, #4c4a63, #3d4c5c);
          box-shadow: none;
        }
        .onb-continue:focus-visible { outline: 2px solid #38bdf8; outline-offset: 3px; }
        @media (max-width: 1080px) {
          .onb-layout { grid-template-columns: 1fr; }
          .onb-center-col { order: -1; margin-bottom: 12px; transform: none; }
        }
        @media (max-width: 480px) {
          .onb-disciplines { grid-template-columns: 1fr; }
          .onb-languages { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <p className="onb-eyebrow">{translate('onboarding.title')}</p>
      <h1 className="onb-headline">
        {translate('onboarding.selectDisciplineDesc')}
      </h1>

      <div className="onb-layout">
        {/* LEFT: Disciplines */}
        <div className="onb-col">
          <p className="onb-col-title">{translate('onboarding.selectDiscipline')}</p>
          <div className="onb-disciplines">
            {ENGINEERING_DISCIPLINES.map((id) => {
              const meta = DISCIPLINE_META[id];
              const accent = DISCIPLINE_ACCENTS[id];
              const isSelected = selectedDiscipline === id;
              const svgKey = meta.icon;
              const svgHtml = DISCipline_SVGs[svgKey] ?? DISCipline_SVGs.Code2;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedDiscipline(id)}
                  aria-pressed={isSelected}
                  className={`onb-card${isSelected ? ' selected' : ''}`}
                >
                  <span
                    className="onb-icon-box"
                    style={{ background: accent.bg, color: accent.fg }}
                    dangerouslySetInnerHTML={{ __html: svgHtml }}
                  />
                  <span className="onb-card-text">
                    <span className="onb-card-title">
                      {DISCIPLINE_EN[id]}
                    </span>
                  </span>
                  <span className="onb-check" dangerouslySetInnerHTML={{ __html: CHECK_SVG }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER: Orb + Summary + Continue */}
        <div className="onb-col onb-center-col">
          <OrbCanvas />

          <div className="onb-bottom-block">
            <div className="onb-summary">
              <div className="onb-summary-row">
                <span className="onb-summary-label">
                  {translate('onboarding.selectDiscipline')}
                </span>
                <span className={`onb-summary-value${!selectedDiscipline ? ' empty' : ''}`}>
                  {disciplineMeta
                    ? DISCIPLINE_EN[selectedDiscipline!]
                    : translate('onboarding.selectDiscipline')}
                </span>
              </div>
              <div className="onb-summary-row">
                <span className="onb-summary-label">
                  {translate('onboarding.selectLanguageTitle')}
                </span>
                <span className={`onb-summary-value${!selectedLangOption ? ' empty' : ''}`}>
                  {selectedLangOption
                    ? `${selectedLangOption.nativeLabel} (${selectedLangOption.id.toUpperCase()})`
                    : translate('onboarding.selectLanguage')}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="onb-continue"
              disabled={!selectedDiscipline || isSaving}
              onClick={handleFinish}
            >
              {translate('onboarding.start')}
            </button>
          </div>
        </div>

        {/* RIGHT: Languages */}
        <div className="onb-col">
          <p className="onb-col-title">{translate('onboarding.selectLanguageTitle')}</p>
          <p className="onb-col-hint">
            {translate('onboarding.selectLanguage')} ({translate('onboarding.englishFixedTarget')})
          </p>
          <div className="onb-languages">
            {INTERFACE_LANGUAGES.filter((l) => l.available).map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.id as SupportedInterfaceLanguage)}
                  aria-pressed={isSelected}
                  className={`onb-lang-card${isSelected ? ' selected' : ''}`}
                >
                  <span className="onb-lang-code">{lang.id.toUpperCase()}</span>
                  <span className="onb-lang-native">{lang.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPanel;
