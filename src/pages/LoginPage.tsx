import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Award,
  Zap,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useLocalizationStore } from '@/features/localization';
import { AUTH_COPY } from './LoginPage/constants';
import { TopNavBar } from './LoginPage/TopNavBar';
import { SocialLoginButtons } from './LoginPage/SocialLoginButtons';
import { SSOForm } from './LoginPage/SSOForm';
import { EmailPasswordForm } from './LoginPage/EmailPasswordForm';
import { useLoginHandlers } from './LoginPage/useLoginHandlers';

const LoginPage = () => {
  const h = useLoginHandlers();
  const language = useLocalizationStore((state) => state.language);
  const copy = AUTH_COPY[language] ?? AUTH_COPY.en;

  useEffect(() => {
    void h.initialize();
  }, [h.initialize]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Glows & Technical Grid */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[600px] rounded-full bg-gradient-to-br from-primary/15 via-blue-500/10 to-transparent blur-3xl opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

      <TopNavBar />

      <main className="flex flex-1 items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Panel: High Impact Engineering Showcase */}
          <div className="hidden lg:flex flex-col justify-between space-y-8 pr-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/80 backdrop-blur-xl px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                EngineerOS v4.0 · Production Ready
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Engineered for{' '}
                <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Technical Excellence.
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-muted-copy font-medium max-w-md">
                Join international MEP contractors, Civil leads, QA/QC
                inspectors, and software engineers mastering technical
                communication.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3">
              {[
                {
                  title: 'CEFR A1 to C2 Technical Path',
                  desc: 'Calibrated specifically for engineering career milestones.',
                  icon: Award,
                },
                {
                  title: 'AI Voice & Site Briefing Tutor',
                  desc: 'Practice site meetings, toolbox talks, and client submittals.',
                  icon: Zap,
                },
                {
                  title: 'FIDIC & RFI Corrections',
                  desc: 'Professional AI review for technical claims and reports.',
                  icon: CheckCircle2,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-border-soft bg-surface/70 p-3.5 backdrop-blur-md transition-all hover:border-border-hover"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border-soft bg-background text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted-copy leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Testimonial Quote */}
            <div className="rounded-xl border border-border-soft bg-surface/90 p-4 backdrop-blur-md space-y-2">
              <p className="text-xs italic text-muted-copy leading-relaxed">
                &quot;EngVox allowed our commissioning team to present NFPA
                submittals confidently to international clients in Dubai.&quot;
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold text-foreground">
                <span>— Lead Electrical Commissioning Engineer</span>
                <span className="text-primary uppercase tracking-widest">
                  Verified User
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Glassmorphic Auth Form */}
          <div className="w-full max-w-md mx-auto rounded-2xl border border-border-soft bg-surface/90 backdrop-blur-xl p-8 shadow-2xl space-y-6 animate-in fade-in duration-300 hover:border-border-hover transition-colors">
            {/* Header / Mode Switcher */}
            <div className="text-center space-y-1">
              <div className="inline-flex rounded-xl border border-border-soft bg-background p-1 text-xs mb-2">
                <button
                  type="button"
                  onClick={() => h.isSignUpMode && h.toggleSignUpMode()}
                  className={`rounded-lg px-4 py-1.5 font-bold transition-all cursor-pointer ${
                    !h.isSignUpMode
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-copy hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => !h.isSignUpMode && h.toggleSignUpMode()}
                  className={`rounded-lg px-4 py-1.5 font-bold transition-all cursor-pointer ${
                    h.isSignUpMode
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-copy hover:text-foreground'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {h.isSignUpMode ? copy.signupTitle : copy.loginTitle}
              </h2>
              <p className="text-xs text-muted-copy font-medium">
                {h.isSignUpMode ? copy.signupSubtitle : copy.loginSubtitle}
              </p>
            </div>

            {/* Error Notification Alert */}
            {h.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-500 font-medium animate-in fade-in">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{h.error}</span>
              </div>
            )}

            {/* Social Logins */}
            <SocialLoginButtons
              socialLoading={h.socialLoading}
              onSocialLogin={h.handleSocialLogin}
              orContinueWith={copy.orContinueWith}
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
                copy={copy}
              />
            )}

            {/* Instant Demo Preview Login */}
            {h.isLocalDemoMode && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-center space-y-2">
                <button
                  type="button"
                  onClick={h.handleDemoSubmit}
                  disabled={h.isLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-primary" />
                  <span>Launch Instant Demo Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <p className="text-[10px] font-medium text-muted-copy leading-tight">
                  {copy.demoMessage}
                </p>
              </div>
            )}

            {/* Terms & Privacy */}
            <p className="text-center text-[10px] text-muted-copy leading-relaxed">
              By continuing, you agree to EngVox{' '}
              <Link
                to="/legal/terms"
                className="underline hover:text-primary font-semibold"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/legal/privacy"
                className="underline hover:text-primary font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
