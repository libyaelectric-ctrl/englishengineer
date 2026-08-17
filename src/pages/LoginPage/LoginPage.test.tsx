import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';

import LoginPage from './index';

const {
  loginMock,
  signUpMock,
  demoLoginMock,
  initializeMock,
  resetPasswordMock,
  getSupabaseClientMock,
} = vi.hoisted(() => ({
  loginMock: vi.fn(),
  signUpMock: vi.fn(),
  demoLoginMock: vi.fn(),
  initializeMock: vi.fn(),
  resetPasswordMock: vi.fn(),
  getSupabaseClientMock: vi.fn(),
}));

vi.mock('@/features/auth', async () => {
  const { create } = await import('zustand');
  return {
    useAuthStore: create(() => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      providerMode: 'supabase' as const,
      initialize: initializeMock,
      login: loginMock,
      signUp: signUpMock,
      demoLogin: demoLoginMock,
    })),
    AuthService: { resetPassword: resetPasswordMock },
  };
});

vi.mock('@/features/auth/supabase.client', () => ({
  getSupabaseClient: getSupabaseClientMock,
  isSupabaseConfigured: vi.fn(),
}));

const EMAIL_PLACEHOLDER = 'ornek@eposta.com';
const PASSWORD_PLACEHOLDER = '••••••••';

const fillCredentials = async (
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  password: string
) => {
  await user.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), email);
  await user.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), password);
};

const renderLoginPage = () => {
  const RouteProbe = () => {
    const location = useLocation();
    return <div data-testid="current-route">{location.pathname}</div>;
  };
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<RouteProbe />} />
      </Routes>
    </MemoryRouter>
  );
};

// jsdom does not run native constraint validation (required/type=email) on
// submit, so the form's onSubmit handler only fires when submitted directly.
// These tests exercise the handler-level validation that runs in addition to
// the browser's native checks.
const submitForm = () => {
  const form = document.querySelector('form');
  if (!form) throw new Error('Login form not found');
  fireEvent.submit(form);
};

beforeEach(() => {
  useAuthStore.setState({
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
    providerMode: 'supabase',
  });
  loginMock.mockReset();
  signUpMock.mockReset();
  demoLoginMock.mockReset();
  initializeMock.mockReset().mockResolvedValue(undefined);
  resetPasswordMock.mockReset();
  getSupabaseClientMock.mockReset();
  useLocalizationStore.getState().setLanguage('tr');
});

describe('LoginPage — validation and error messages', () => {
  it('shows a required-fields error when submitting an empty form', async () => {
    renderLoginPage();

    submitForm();

    expect(await screen.findByText('Lütfen tüm zorunlu alanları doldurun.')).toBeVisible();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'not-an-email');
    await user.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), 'secret1');
    submitForm();

    expect(await screen.findByText('Lütfen geçerli bir e-posta adresi girin.')).toBeVisible();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rejects a password shorter than 6 characters', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await fillCredentials(user, 'user@example.com', '123');
    await user.click(screen.getByRole('button', { name: 'Giriş yap' }));

    expect(await screen.findByText('Şifre en az 6 karakter olmalıdır.')).toBeVisible();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('maps "Invalid login credentials" to the localized guidance message', async () => {
    loginMock.mockRejectedValue(new Error('Invalid login credentials'));
    const user = userEvent.setup();
    renderLoginPage();

    await fillCredentials(user, 'user@example.com', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Giriş yap' }));

    expect(await screen.findByText(/E-posta veya şifre hatalı/)).toBeVisible();
    expect(loginMock).toHaveBeenCalledWith('user', 'user@example.com', 'secret1');
  });

  it('maps network failures to the backend-unreachable message', async () => {
    loginMock.mockRejectedValue(new Error('Failed to fetch'));
    const user = userEvent.setup();
    renderLoginPage();

    await fillCredentials(user, 'user@example.com', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Giriş yap' }));

    expect(await screen.findByText(/Arka uç hizmetine şu anda ulaşılamıyor/)).toBeVisible();
  });

  it('shows unknown backend errors as-is', async () => {
    loginMock.mockRejectedValue(new Error('Custom backend error'));
    const user = userEvent.setup();
    renderLoginPage();

    await fillCredentials(user, 'user@example.com', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Giriş yap' }));

    expect(await screen.findByText('Custom backend error')).toBeVisible();
  });

  it('maps sign-up failures to the localized message', async () => {
    signUpMock.mockRejectedValue(new Error('Invalid login credentials'));
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Hesap Oluştur' }));
    await fillCredentials(user, 'user@example.com', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Hesap oluştur' }));

    expect(await screen.findByText(/E-posta veya şifre hatalı/)).toBeVisible();
  });

  it('clears the previous error when a submit succeeds', async () => {
    loginMock.mockRejectedValueOnce(new Error('Invalid login credentials'));
    const user = userEvent.setup();
    renderLoginPage();

    await fillCredentials(user, 'user@example.com', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Giriş yap' }));
    expect(await screen.findByText(/E-posta veya şifre hatalı/)).toBeVisible();

    loginMock.mockResolvedValueOnce(undefined);
    await user.click(screen.getByRole('button', { name: 'Giriş yap' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-route').textContent).toBe('/dashboard');
    });
    expect(screen.queryByText(/E-posta veya şifre hatalı/)).not.toBeInTheDocument();
  });
});

describe('LoginPage — forgot password', () => {
  it('requires an email before sending a reset link', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Şifremi unuttum?' }));

    expect(await screen.findByText('Lütfen tüm zorunlu alanları doldurun.')).toBeVisible();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it('validates the email format before sending a reset link', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'bad-email');
    await user.click(screen.getByRole('button', { name: 'Şifremi unuttum?' }));

    expect(await screen.findByText('Lütfen geçerli bir e-posta adresi girin.')).toBeVisible();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it('explains that password reset needs Supabase when no client is available', async () => {
    getSupabaseClientMock.mockReturnValue(null);
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Şifremi unuttum?' }));

    expect(
      await screen.findByText(
        'Şifre sıfırlama için Supabase kimlik doğrulaması gerekir. Bunun yerine yeni bir hesap oluşturabilir veya demo modunu kullanabilirsiniz.'
      )
    ).toBeVisible();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it('sends the reset link and shows a success notice with the email', async () => {
    getSupabaseClientMock.mockReturnValue({} as never);
    resetPasswordMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Şifremi unuttum?' }));

    expect(
      await screen.findByText(
        'Şifre sıfırlama bağlantısı user@example.com adresine gönderildi. E-postanızı kontrol edin.'
      )
    ).toBeVisible();
    expect(resetPasswordMock).toHaveBeenCalledWith('user@example.com');
  });

  it('shows an error when sending the reset link fails', async () => {
    getSupabaseClientMock.mockReturnValue({} as never);
    resetPasswordMock.mockRejectedValue('network down');
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Şifremi unuttum?' }));

    expect(await screen.findByText('Şifre sıfırlama bağlantısı gönderilemedi.')).toBeVisible();
  });
});

describe('LoginPage — demo workspace', () => {
  it('launches the demo workspace and navigates to /welcome', async () => {
    demoLoginMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Anlık Demo Çalışma Alanını Başlat' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-route').textContent).toBe('/welcome');
    });
    expect(demoLoginMock).toHaveBeenCalledTimes(1);
  });

  it('shows an error when demo login fails', async () => {
    demoLoginMock.mockRejectedValue('demo offline');
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Anlık Demo Çalışma Alanını Başlat' }));

    expect(await screen.findByText('Demo başlatılamadı.')).toBeVisible();
  });

  it('shows a provider-specific error when demo social login fails', async () => {
    getSupabaseClientMock.mockReturnValue(null);
    demoLoginMock.mockRejectedValue('demo offline');
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Google ile devam et' }));

    expect(await screen.findByText('Google ile giriş yapılamadı.')).toBeVisible();
    expect(demoLoginMock).toHaveBeenCalledTimes(1);
  });
});
