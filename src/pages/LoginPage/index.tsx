import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Cpu,
  Factory,
  FlaskConical,
  HardHat,
  Play,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

import { EmailPasswordForm } from './EmailPasswordForm';
import { SSOForm } from './SSOForm';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useLoginHandlers } from './useLoginHandlers';

const DISCIPLINE_ICONS: Record<EngineeringDiscipline, React.ElementType> = {
  architecture: Building2,
  chemical: FlaskConical,
  civil: HardHat,
  software: Code2,
  electrical: Zap,
  electronics: Cpu,
  hse: ShieldCheck,
  industrial: Factory,
  mechanical: Wrench,
  mechatronics: Bot,
};

const DISCIPLINES = ENGINEERING_DISCIPLINES.map((id) => ({
  id,
  titleKey: `discipline.${id}` as TranslationKey,
  badgeKey: `discipline.${id}.desc` as TranslationKey,
  icon: DISCIPLINE_ICONS[id],
}));

const LoginPage = () => {
  const h = useLoginHandlers();
  const translate = useLocalizationStore((state) => state.translate);

  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(() => {
    return localStorage.getItem('preselected_discipline');
  });

  const handleDisciplineSelect = (id: string) => {
    setSelectedDiscipline(id);
    localStorage.setItem('preselected_discipline', id);
  };

  const getDisciplineLabel = (id: string) => {
    const translated = translate(`discipline.${id}` as TranslationKey);
    return translated !== `discipline.${id}` ? translated : id;
  };

  useEffect(() => {
    void h.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize is a stable ref from useLoginHandlers
  }, [h.initialize]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      {/* Background Ambient Motion Orbs & Technical Grid */}
      <div className="pointer-events-none absolute -top-10 left-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-primary/35 via-blue-500/25 to-indigo-500/35 blur-3xl opacity-75 animate-ambient-glow" />
      <div className="pointer-events-none absolute -bottom-10 right-10 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-indigo-500/30 via-cyan-500/25 to-primary/35 blur-3xl opacity-75 animate-ambient-glow" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.04)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Fixed Top Navbar with Try Demo Action */}
      <Navbar onDemoClick={h.handleDemoSubmit} />

      {/* Fixed Middle Net Content Area - Bounded Strictly Between Top 64px (top-16) and Bottom 56px (bottom-14) */}
      <main className="fixed top-16 bottom-14 inset-x-0 z-10 flex items-center justify-center px-6 lg:px-12 overflow-hidden">
        {/* Ambient 360° Rotating Aura Ring around Login Workspace */}
        <div className="w-full max-w-5xl h-full relative group">
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-xl opacity-50 animate-spin-slow pointer-events-none" />
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch py-3 relative z-10">
            {/* Left Column: Pre-select Engineering Discipline */}
            <div className="w-full rounded-2xl border border-border-soft bg-surface/90 backdrop-blur-xl p-4.5 shadow-xl hover:border-border-hover transition-colors h-full flex flex-col justify-between relative light-sweep-container overflow-hidden">
              <div className="text-center space-y-0.5">
                <span className="group inline-flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary border border-border-soft">
                  <Zap className="h-3 w-3" />
                  {translate('login.preSelection')}
                </span>
                <h2 className="text-sm font-bold text-foreground leading-none">
                  {translate('login.chooseDiscipline')}
                </h2>
                <p className="text-[10px] text-muted-copy leading-tight">
                  {translate('login.disciplineDesc')}
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-1 min-h-0 py-1">
                {DISCIPLINES.map((d) => {
                  const Icon = d.icon;
                  const isSelected = selectedDiscipline === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleDisciplineSelect(d.id)}
                      className={`flex items-center gap-2.5 rounded-lg border py-1 px-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary shadow-sm font-semibold'
                          : 'border-border-soft bg-background/50 text-foreground hover:border-primary/50'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border-soft bg-surface text-muted-copy'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold truncate leading-none">
                          {translate(d.titleKey)}
                        </h4>
                        <span className="text-[9px] text-muted-copy truncate font-normal">
                          {translate(d.badgeKey)}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-border-soft bg-background/50 p-1.5 text-center">
                <p className="text-[10px] text-muted-copy leading-none font-semibold">
                  {selectedDiscipline ? (
                    <>
                      {translate('login.selected')}{' '}
                      <span className="font-bold text-primary truncate max-w-[200px] inline-block align-middle ml-1">
                        {getDisciplineLabel(selectedDiscipline)}
                      </span>
                    </>
                  ) : (
                    translate('login.noDiscipline')
                  )}
                </p>
              </div>
            </div>

            {/* Right Column: Glassmorphic Auth Form */}
            <div className="w-full rounded-2xl border border-border-soft bg-surface/90 backdrop-blur-xl p-4.5 shadow-xl hover:border-border-hover transition-colors h-full flex flex-col justify-between relative light-sweep-container overflow-hidden">
              {/* Header / Mode Switcher */}
              <div className="text-center space-y-1">
                <div className="inline-flex rounded-lg border border-border-soft bg-background p-1 text-xs mb-0.5">
                  <button
                    type="button"
                    onClick={() => h.isSignUpMode && h.toggleSignUpMode()}
                    className={`rounded-md px-3.5 py-1 font-bold transition-all cursor-pointer text-xs ${
                      !h.isSignUpMode
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-copy hover:text-foreground'
                    }`}
                  >
                    {translate('login.signIn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => !h.isSignUpMode && h.toggleSignUpMode()}
                    className={`rounded-md px-3.5 py-1 font-bold transition-all cursor-pointer text-xs ${
                      h.isSignUpMode
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-copy hover:text-foreground'
                    }`}
                  >
                    {translate('login.createAccount')}
                  </button>
                </div>

                <h2 className="text-sm font-extrabold tracking-tight text-foreground leading-none animated-gradient-title">
                  {h.isSignUpMode
                    ? translate('login.createYourAccount')
                    : translate('login.welcomeBack')}
                </h2>
                <p className="text-[10px] text-muted-copy font-medium">
                  {h.isSignUpMode
                    ? translate('login.startJourney')
                    : translate('login.signInContinue')}
                </p>
              </div>

              {/* Error Notification Alert */}
              {h.error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-500 font-medium animate-in fade-in">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{h.error}</span>
                </div>
              )}

              {/* Social Logins */}
              <SocialLoginButtons
                socialLoading={h.socialLoading}
                onSocialLogin={h.handleSocialLogin}
              />

              {/* Forms: SSO vs Email/Password */}
              {h.showSsoForm ? (
                <SSOForm
                  ssoDomain={h.ssoDomain}
                  onSsoDomainChange={h.setSsoDomain}
                  ssoLoading={h.ssoLoading}
                  onSubmit={h.handleSsoSubmit}
                  onBack={() => {
                    h.setShowSsoForm(false);
                    h.setError(null);
                  }}
                />
              ) : (
                <EmailPasswordForm
                  email={h.email}
                  onEmailChange={h.setEmail}
                  password={h.password}
                  onPasswordChange={h.setPassword}
                  isSignUpMode={h.isSignUpMode}
                  isLoading={h.isLoading}
                  isLocalAuthBlocked={h.isLocalAuthBlocked}
                  isSupabaseMode={h.isSupabaseMode}
                  onSubmit={h.handleSubmit}
                  onShowSsoForm={() => {
                    h.setShowSsoForm(true);
                    h.setError(null);
                  }}
                />
              )}

              {/* Instant Demo Preview Login */}
              {h.isLocalDemoMode && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-1.5 text-center space-y-0.5">
                  <button
                    type="button"
                    onClick={h.handleDemoSubmit}
                    disabled={h.isLoading}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer transition-colors"
                  >
                    <Play className="h-3 w-3 fill-primary" />
                    <span>{translate('login.launchDemo')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <p className="text-[8px] font-medium text-muted-copy leading-tight">
                    {translate('login.demoMessage')}
                  </p>
                </div>
              )}

              {/* Section 3 Interactive Auth Toolset Toolbar (Items 21-30) */}
              {/* Back to Home */}
              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                >
                  <span>{translate('login.backToHome')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </div>
  );
};

export default LoginPage;
