import { useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';
import { logger } from '@/shared/logger';

import { useAuthStore } from '@/features/auth';
import { getSupabaseClient } from '@/features/auth/supabase.client';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const client = getSupabaseClient();
      if (!client) {
        await useAuthStore.getState().initialize();
        navigate('/dashboard', { replace: true });
        return;
      }

      const code = searchParams.get('code');

      if (code) {
        // PKCE flow: exchange authorization code for session
        const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          logger.e('OAuth code exchange failed:', exchangeError);
          setError(exchangeError.message);
          return;
        }
      }

      // Restore session state into auth store
      await useAuthStore.getState().initialize();

      const {
        data: { session },
      } = await client.auth.getSession();

      if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('No session found after OAuth callback.');
      }
    };

    void handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/login', { replace: true })}>Back to Login</button>
      </div>
    );
  }

  return (
    <LoadingState
      title="Signing you in"
      description="Completing authentication with your provider..."
    />
  );
}
