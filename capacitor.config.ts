import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.engvox.app',
  appName: 'EngVox',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow navigation to external URLs (Dodo checkout, Clerk auth)
    allowNavigation: [
      'checkout.dodopayments.com',
      'test.checkout.dodopayments.com',
      'customer.dodopayments.com',
      'test.customer.dodopayments.com',
      '*.clerk.accounts.dev',
      'clerk.engvox.com',
      'api.clerk.com',
      '*.protect.clerk.com',
    ],
  },
  android: {
    // Allow mixed content (HTTP resources in HTTPS WebView)
    allowMixedContent: true,
    // Capture input for Clerk auth
    captureInput: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
