import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import {
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';

import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { useAuthStore } from '@/features/auth';
import { AUTH_CONFIG } from '@/features/auth/auth.config';
import { getSupabaseClient } from '@/features/auth/supabase.client';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

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
  const { login, signUp, demoLogin, initialize, isLoading, providerMode } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(location.pathname === '/signup');
  const [error, setError] = useState<string | null>(null);
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
        LearningProfileRepository.updatePreferences(loggedUser.id, {
          discipline: (loggedUser.engineeringDiscipline ||
            ENGINEERING_DISCIPLINES[0]) as EngineeringDiscipline,
          onboardingCompleted: true,
          interfaceLanguage: useLocalizationStore.getState().language,
        });
      }
      setSocialLoading(null);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setSocialLoading(null);
      setError(getErrorMessage(err, `Failed to sign in with ${provider}`));
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin' | 'apple') => {
    const client = getSupabaseClient();

    if (!client || isLocalDemoMode) {
      await handleDemoSocialLogin(provider);
      return;
    }

    // Supabase Auth Mode
    const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    const notEnabledMsg = `${capitalizedProvider} login is not yet configured on Supabase. Use email login or try demo mode.`;

    try {
      setSocialLoading(provider);
      setError(null);
      const { error: authError } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError && isProviderNotEnabled(authError.message ?? '')) {
        setError(notEnabledMsg);
      } else if (authError) {
        throw authError;
      }
    } catch (err: unknown) {
      setSocialLoading(null);
      const msg = getErrorMessage(err, `${provider} sign-in failed.`);
      setError(isProviderNotEnabled(msg) ? notEnabledMsg : msg);
    }
  };

  const handleDemoSubmit = async () => {
    try {
      setError(null);
      useLearningStore.getState().resetAll();
      await demoLogin();
      const loggedUser = useAuthStore.getState().currentUser;
      if (loggedUser) {
        LearningProfileRepository.updatePreferences(loggedUser.id, {
          discipline: (loggedUser.engineeringDiscipline ||
            ENGINEERING_DISCIPLINES[0]) as EngineeringDiscipline,
          onboardingCompleted: true,
          interfaceLanguage: useLocalizationStore.getState().language,
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to initialize demo'));
    }
  };

  const handleSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain.trim()) {
      setError('Please enter your company domain or SSO Provider ID.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setError('SSO requires Supabase authentication to be configured.');
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
          setError('SSO provider returned an unexpected redirect URL.');
          setSsoLoading(false);
          return;
        }
        window.location.href = data.url;
      } else {
        setError('No redirect URL returned from SSO provider.');
      }
    } catch (err: unknown) {
      setSsoLoading(false);
      setError(getErrorMessage(err, 'SSO authentication failed.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
        navigate('/welcome', { replace: true });
      } else {
        await login(derivedDisplayName, email.trim(), password);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Sign-in failed.');
      if (
        msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('fetch failed')
      ) {
        setError(
          'Backend service is currently unreachable. Please check your internet connection or try local demo mode.'
        );
      } else {
        setError(msg);
      }
    }
  };

  const toggleSignUpMode = () => {
    setIsSignUpMode((m) => !m);
    setError(null);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSignUpMode,
    error,
    setError,
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
    toggleSignUpMode,
  };
};
