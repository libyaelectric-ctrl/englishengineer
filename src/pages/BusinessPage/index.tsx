import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, FileCheck2, HardHat, Mail, MessageSquareCode, Settings2, ShieldCheck, Users } from 'lucide-react';

import { Link } from 'react-router-dom';

import { PRODUCT_VERSION } from '@/config/product.config';
import { PageMetadata } from '@/shared/components/PageMetadata';

import { AUTH_SIGN_UP_URL } from '@/features/auth/firebase.config';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

const BUSINESS_CASES = [
  { icon: HardHat, title: 'Site Coordination & BIM Meetings', text: 'Prepare engineers for international coordination meetings, site decisions, and technical constraints.' },
  { icon: ClipboardCheck, title: 'QA/QC Inspection Responses', text: 'Practice concise inspection answers, NCR responses, and audit-ready technical explanations.' },
  { icon: FileCheck2, title: 'FIDIC & Submittal Writing', text: 'Draft variation notices, RFI messages, EOT claims, and material approval requests with confidence.' },
  { icon: MessageSquareCode, title: 'Client Review Defenses', text: 'Explain design revisions, risks, and budget recovery actions with precise technical English.' },
  { icon: BarChart3, title: 'Project Reporting', text: 'Turn progress updates and delay reasons into clear executive summaries.' },
  { icon: Users, title: 'Toolbox Talks & Safety', text: 'Run safety briefings, JSA talks, and PTW conversations in professional English.' },
] as const;

const ENTERPRISE_BENEFITS = [
  { icon: Users, title: 'Role-based privacy', text: 'Managers see readiness trends while individual practice stays private.' },
  { icon: BarChart3, title: 'Readiness analytics', text: 'Find communication risks before important project milestones.' },
  { icon: Settings2, title: 'Custom paths', text: 'Tailor learning by discipline, role, and project communication needs.' },
] as const;

const BusinessPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-20 text-slate-950 dark:bg-[#040611] dark:text-white">
      <PageMetadata title="EngVox for Teams" description="AI-supported technical English training for engineering teams." />
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(6,182,212,0.16),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(168,85,247,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_16%_8%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(168,85,247,0.18),transparent_28%)]" />
      <section className="relative mx-auto max-w-7xl px-6 pb-10 md:px-12">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-100"><ShieldCheck className="h-3.5 w-3.5" /> EngVox Teams · v{PRODUCT_VERSION}</div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Engineering English readiness for <span className="bg-gradient-to-r from-cyan-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-cyan-200 dark:to-fuchsia-200">global teams</span></h1>
            <p className="max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-200">Give site teams, MEP engineers, QA/QC inspectors, and BIM managers practical English training for real project communication.</p>
            <div className="flex flex-wrap items-center gap-3"><Link to={AUTH_SIGN_UP_URL} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 dark:bg-white dark:text-slate-950">Start team workspace <ArrowRight className="h-4 w-4" /></Link><button type="button" onClick={async () => { const { openMailto } = await import('@/shared/utils/capacitor'); await openMailto('sales@engvox.com', 'EngVox Enterprise Inquiry', ''); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-900/10 bg-white/70 px-5 py-3 text-sm font-black text-slate-950 backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-white/[0.07] dark:text-white"><Mail className="h-4 w-4 text-cyan-600 dark:text-cyan-200" /> Contact sales</button></div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-200"><span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-200" /> Privacy-first</span><span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-200" /> Zero AI model training</span><span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-200" /> Team analytics</span></div>
          </div>
          <div className="lg:col-span-5"><div className="rounded-[2rem] border border-slate-900/10 bg-white/72 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]"><div className="mb-4 flex items-center justify-between border-b border-slate-900/10 pb-3 dark:border-white/10"><div><h3 className="text-sm font-black">Team readiness dashboard</h3><p className="text-xs text-slate-600 dark:text-white/55">Live preview</p></div><span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-black text-cyan-700 dark:text-cyan-100">DEMO</span></div>{['Writing & RFI readiness', 'Speaking confidence', 'Technical terminology'].map((label, i) => (<div key={label} className="mb-4"><div className="mb-1 flex justify-between text-xs font-bold"><span>{label}</span><span className="text-cyan-700 dark:text-cyan-100">{82 + i * 5}%</span></div><div className="h-2 rounded-full bg-slate-900/10 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" style={{ width: `${82 + i * 5}%` }} /></div></div>))}</div></div>
        </div>
      </section>
      <section className="relative mx-auto max-w-7xl border-t border-slate-900/10 px-6 py-10 dark:border-white/10 md:px-12"><div className="mb-6"><h2 className="text-2xl font-black">Built for real project conversations</h2><p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Not generic English. Practical communication for engineering work.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{BUSINESS_CASES.map((item) => { const Icon = item.icon; return (<div key={item.title} className="rounded-3xl border border-slate-900/10 bg-white/70 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"><div className="mb-3 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-100"><Icon className="h-5 w-5" /></div><h3 className="text-sm font-black">{item.title}</h3></div><p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item.text}</p></div>); })}</div></section>
      <section className="relative mx-auto max-w-7xl px-6 py-10 md:px-12"><div className="grid gap-4 md:grid-cols-3">{ENTERPRISE_BENEFITS.map((b) => { const Icon = b.icon; return (<div key={b.title} className="rounded-3xl border border-slate-900/10 bg-white/70 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"><Icon className="mb-3 h-6 w-6 text-cyan-700 dark:text-cyan-100" /><h3 className="font-black">{b.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{b.text}</p></div>); })}</div></section>
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};

export default BusinessPage;
