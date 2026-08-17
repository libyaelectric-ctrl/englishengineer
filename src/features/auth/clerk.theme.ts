import type { ClerkProviderProps } from '@clerk/clerk-react';

/**
 * Clerk brand look (indigo #6C47FF) shared by <SignIn>, <SignUp> and
 * <UserButton> through the ClerkProvider `appearance` prop, so every Clerk
 * surface matches the product palette instead of the default blue.
 */
export const CLERK_THEME: ClerkProviderProps['appearance'] = {
  variables: {
    colorPrimary: '#6C47FF',
    colorTextOnPrimaryBackground: '#FFFFFF',
    colorText: '#23253A',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#F7F7FB',
    colorNeutral: '#6C47FF',
    borderRadius: '12px',
  },
  elements: {
    card: {
      boxShadow: '0 24px 60px -24px rgba(38, 20, 96, 0.45)',
      border: '1px solid rgba(108, 71, 255, 0.14)',
    },
    headerTitle: { color: '#191C2E' },
    footerActionLink: { color: '#6C47FF' },
  },
};
