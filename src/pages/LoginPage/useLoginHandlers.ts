import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { AuthService, useAuthStore } from '@/features/auth';
import { AUTH_CONFIG } from '@/features/auth/auth.config';
import { getSupabaseClient } from '@/features/auth/supabase.client';
import { useLocalizationStore } from '@/features/localization';

import { type RouteLocationState, getErrorMessage } from './constants';

const ALLOWED_SSO_HOSTS = ['supabase.com', 'auth0.com', 'okta.com'];

const isSafeRedirectUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_SSO_HOSTS.some(
      (h) => parsed.hostname.endsWith(`.${h}`) || parsed.hostname === h
    );
  } catch {
    return false;
  }
};

export const useLoginHandlers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLocalizationStore((s) => s.translate);
  const { login, signUp, demoLogin, initialize, isLoading, providerMode } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(location.pathname === '/signup');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [ssoDomain, setSsoDomain] = useState('');
  const [showSsoForm, setShowSsoForm] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const isSupabaseMode = providerMode === 'supabase';
  const isLocalAuthBlocked = !isSupabaseMode && !AUTH_CONFIG.localAuthAllowed;
  const isLocalDemoMode = !isSupabaseMode && !isLocalAuthBlocked;
  const from = (location.state as RouteLocationState | null)?.from?.pathname || '/dashboard';

  const isProviderNotEnabled = (msg: string) =>
    msg.includes('not enabled') || msg.includes('Unsupported provider');

  const localizedProvider = (provider: 'google' | 'linkedin' | 'apple') =>
    provider.charAt(0).toUpperCase() + provider.slice(1);

  const providerNotEnabledMsg = (provider: 'google' | 'linkedin' | 'apple') =>
    translate('login.providerNotEnabled').replace('{provider}', localizedProvider(provider));

  const providerSignInFailedMsg = (provider: 'google' | 'linkedin' | 'apple') =>
    translate('login.providerSignInFailed').replace('{provider}', localizedProvider(provider));

  const handleDemoSocialLogin = async (provider: 'google' | 'linkedin' | 'apple') => {
    try {
      setError(null);
      setSocialLoading(provider);
      useLearningStore.getState().resetAll();
      await demoLogin();
      const loggedUser = useAuthStore.getState().currentUser;
      if (loggedUser) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        useAuthStore.setState({
          currentUser: {
            ...loggedUser,
            displayName: `${providerName} Demo Engineer`,
            email: `demo.${provider}@engvox.io`,
          },
        });
      }
      setSocialLoading(null);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setSocialLoading(null);
      setError(
        getErrorMessage(
          err,
          translate('login.demoSignInFailed').replace('{provider}', localizedProvider(provider))
        )
      );
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin' | 'apple') => {
    const client = getSupabaseClient();

    if (!client || isLocalDemoMode) {
      await handleDemoSocialLogin(provider);
      return;
    }

    // Supabase Auth Mode
    const notEnabledMsg = providerNotEnabledMsg(provider);

    try {
      setSocialLoading(provider);
      setError(null);
      const { data, error: authError } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) {
        // Always clear the loading state so the form is never left disabled.
        setSocialLoading(null);
        const msg = getErrorMessage(authError, providerSignInFailedMsg(provider));
        setError(isProviderNotEnabled(msg) ? notEnabledMsg : msg);
        return;
      }
      // supabase-js already navigates in the browser, but redirect explicitly so
      // the flow also works when the automatic redirect is deferred or blocked.
      setSocialLoading(null);
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        setError(translate('login.ssoNoRedirect'));
      }
    } catch (err: unknown) {
      setSocialLoading(null);
      const msg = getErrorMessage(err, providerSignInFailedMsg(provider));
      setError(isProviderNotEnabled(msg) ? notEnabledMsg : msg);
    }
  };

  const handleDemoSubmit = async () => {
    try {
      setError(null);
      useLearningStore.getState().resetAll();
      await demoLogin();
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, translate('login.demoInitFailed')));
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError(translate('login.fillRequiredFields'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(translate('login.invalidEmail'));
      return;
    }
    if (!getSupabaseClient()) {
      setError(translate('login.resetUnsupported'));
      return;
    }
    try {
      setError(null);
      setNotice(null);
      await AuthService.resetPassword(email.trim());
      setNotice(translate('login.resetSent').replace('{email}', email.trim()));
    } catch (err: unknown) {
      setNotice(null);
      setError(getErrorMessage(err, translate('login.resetFailed')));
    }
  };

  const handleSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain.trim()) {
      setError(translate('login.ssoDomainRequired'));
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setError(translate('login.ssoRequiresSupabase'));
      return;
    }

    try {
      setSsoLoading(true);
      setError(null);
      const domainOrId = ssoDomain.trim();
      const domain = domainOrId.includes('@') ? domainOrId.split('@')[1] : domainOrId;
      const { data, error: authError } = await client.auth.signInWithSSO({
        domain,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      if (data?.url) {
        if (!isSafeRedirectUrl(data.url)) {
          setError(translate('login.ssoInvalidRedirect'));
          setSsoLoading(false);
          return;
        }
        window.location.href = data.url;
      } else {
        setError(translate('login.ssoNoRedirect'));
      }
    } catch (err: unknown) {
      setSsoLoading(false);
      setError(getErrorMessage(err, translate('login.ssoFailed')));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(translate('login.fillRequiredFields'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(translate('login.invalidEmail'));
      return;
    }

    if (password.length < 6) {
      setError(translate('login.passwordTooShort'));
      return;
    }

    const derivedDisplayName = email.trim().split('@')[0] || 'EngVox User';

    try {
      setError(null);
      if (isSignUpMode) {
        ProductAnalyticsService.track('signup_started', '/login', {
          metadata: { source: 'user' },
        });
        await signUp(derivedDisplayName, email.trim(), password);
        ProductAnalyticsService.track('signup_completed', '/login', {
          metadata: { source: 'system' },
        });
        navigate('/dashboard', { replace: true });
      } else {
        await login(derivedDisplayName, email.trim(), password);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, translate('login.signInFailed'));
      const normalized = msg.toLowerCase();
      if (normalized.includes('invalid login credentials')) {
        setError(translate('login.invalidCredentials'));
      } else if (normalized.includes('failed to fetch') || normalized.includes('fetch failed')) {
        setError(translate('login.backendUnreachable'));
      } else {
        setError(msg);
      }
    }
  };

  const toggleSignUpMode = () => {
    setIsSignUpMode((m) => !m);
    setError(null);
    setNotice(null);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSignUpMode,
    error,
    setError,
    notice,
    setNotice,
    socialLoading,
    ssoDomain,
    setSsoDomain,
    showSsoForm,
    setShowSsoForm,
    ssoLoading,
    isSupabaseMode,
    isLocalAuthBlocked,
    isLocalDemoMode,
    isLoading,
    initialize,
    handleSocialLogin,
    handleDemoSubmit,
    handleSsoSubmit,
    handleSubmit,
    handleForgotPassword,
    toggleSignUpMode,
  };
};
