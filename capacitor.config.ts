import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.engvox.app',
  appName: 'EngVox',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
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
      // Sentry error tracking
      '*.sentry.io',
    ],
  },
  android: {
    captureInput: true,
  },
  plugins: {
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