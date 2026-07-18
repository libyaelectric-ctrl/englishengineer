import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { useLearningStore } from '@/core/learning';
import { AUTH_CONFIG } from '@/features/auth/auth.config';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { getSupabaseClient } from '@/features/auth/supabase.client';
import { getErrorMessage, type RouteLocationState } from './constants';

export const useLoginHandlers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, demoLogin, initialize, isLoading, providerMode } =
    useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(
    location.pathname === '/signup'
  );
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [ssoDomain, setSsoDomain] = useState('');
  const [showSsoForm, setShowSsoForm] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const isSupabaseMode = providerMode === 'supabase';
  const isLocalAuthBlocked = !isSupabaseMode && !AUTH_CONFIG.localAuthAllowed;
  const isLocalDemoMode = !isSupabaseMode && !isLocalAuthBlocked;
  const from =
    (location.state as RouteLocationState | null)?.from?.pathname ||
    '/dashboard';

  const handleSocialLogin = async (
    provider: 'google' | 'linkedin' | 'apple'
  ) => {
    if (provider === 'apple') {
      setError('Apple Sign In is coming soon. Please use Google or LinkedIn.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setError(
        'Social login requires Supabase authentication to be configured.'
      );
      return;
    }

    try {
      setSocialLoading(provider);
      setError(null);
      const { error: authError } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (authError) {
        if (
          authError.message?.includes('not enabled') ||
          authError.message?.includes('Unsupported provider')
        ) {
          setError(
            `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet enabled. Please use email login or try the demo mode.`
          );
        } else {
          throw authError;
        }
      }
    } catch (err: unknown) {
      setSocialLoading(null);
      const msg = getErrorMessage(err, `${provider} sign-in failed.`);
      if (msg.includes('not enabled') || msg.includes('Unsupported provider')) {
        setError(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet enabled. Please use email login or try the demo mode.`
        );
      } else {
        setError(msg);
      }
    }
  };

  const handleDemoSubmit = async () => {
    try {
      setError(null);
      useLearningStore.getState().resetAll();
      await demoLogin();
      const loggedUser = useAuthStore.getState().currentUser;
      if (loggedUser) {
        const { LearningProfileRepository } =
          await import('@/features/profile/profile.repository');
        LearningProfileRepository.updatePreferences(loggedUser.id, {
          onboardingCompleted: true,
        });
      }
      navigate(from, { replace: true });
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
      const domain = domainOrId.includes('@')
        ? domainOrId.split('@')[1]
        : domainOrId;
      const { data, error: authError } = await client.auth.signInWithSSO({
        domain,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (authError) throw authError;
      if (data?.url) {
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

    const derivedDisplayName = email.trim().split('@')[0] || 'EngVox User';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

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
      } else {
        await login(derivedDisplayName, email.trim(), password);
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Sign-in failed.'));
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
