import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSupabaseClient } from '@/features/auth/supabase.client';
import { LoadingState } from '@/shared/components/LoadingState';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const client = getSupabaseClient();
      if (!client) {
        setError('Supabase is not configured.');
        return;
      }

      const code = searchParams.get('code');

      if (code) {
        // PKCE flow: exchange authorization code for session
        const { error: exchangeError } =
          await client.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error('OAuth code exchange failed:', exchangeError);
          setError(exchangeError.message);
          return;
        }
      }

      // For implicit flow (hash-based tokens), getSession() picks them up
      const {
        data: { session },
      } = await client.auth.getSession();

      if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('No session found after OAuth callback.');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/login', { replace: true })}>
          Back to Login
        </button>
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
