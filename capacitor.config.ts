import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.engvox.app',
  appName: 'EngVox',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow navigation to external URLs (Dodo checkout, Clerk auth, OAuth providers)
    allowNavigation: [
      // Dodo Payments checkout
      'checkout.dodopayments.com',
      'test.checkout.dodopayments.com',
      'customer.dodopayments.com',
      'test.customer.dodopayments.com',
      // Clerk authentication
      '*.clerk.accounts.dev',
      'clerk.engvox.com',
      'api.clerk.com',
      '*.protect.clerk.com',
      // OAuth providers (Google, Apple)
      'accounts.google.com',
      'oauthaccount.googleapis.com',
      'appleid.apple.com',
      // Sentry error tracking
      '*.sentry.io',
    ],
  },
  android: {
    // Allow mixed content (HTTP resources in HTTPS WebView)
    allowMixedContent: true,
    // Capture input for Clerk auth
    captureInput: true,
    // Build for latest Play Store requirements
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f0f23',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
