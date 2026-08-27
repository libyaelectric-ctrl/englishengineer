import type { ClerkProviderProps } from '@clerk/clerk-react';

/**
 * Clerk brand look matching EngVox tokens in both dark and light modes,
 * applied through the ClerkProvider `appearance` prop.
 */
export const getClerkTheme = (theme?: 'light' | 'dark'): ClerkProviderProps['appearance'] => {
  const isDark = theme === 'dark';

  return {
    variables: {
      colorPrimary: isDark ? '#3366CC' : '#0047BB',
      colorTextOnPrimaryBackground: '#FFFFFF',
      colorText: isDark ? '#E2E4E7' : '#0A0A1A',
      colorBackground: isDark ? '#1C1F26' : '#FFFFFF',
      colorInputBackground: isDark ? '#14171E' : '#F7F7FB',
      colorInputText: isDark ? '#E2E4E7' : '#0A0A1A',
      colorNeutral: isDark ? '#949BA4' : '#5A5A6E',
      borderRadius: '8px',
    },
    elements: {
      card: {
        backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
        boxShadow: isDark
          ? '0 24px 60px -24px rgba(0, 0, 0, 0.7)'
          : '0 24px 60px -24px rgba(0, 71, 187, 0.15)',
        border: isDark ? '1px solid rgba(51, 102, 204, 0.24)' : '1px solid rgba(0, 71, 187, 0.14)',
      },
      headerTitle: { color: isDark ? '#FFFFFF' : '#0A0A1A' },
      headerSubtitle: { color: isDark ? '#949BA4' : '#5A5A6E' },
      socialButtonsBlockButton: {
        borderColor: isDark ? 'rgba(51, 102, 204, 0.24)' : '#D9D9E3',
        backgroundColor: isDark ? '#14171E' : '#FFFFFF',
        color: isDark ? '#E2E4E7' : '#0A0A1A',
      },
      formFieldInput: {
        backgroundColor: isDark ? '#14171E' : '#F7F7FB',
        borderColor: isDark ? 'rgba(51, 102, 204, 0.24)' : '#D9D9E3',
        color: isDark ? '#E2E4E7' : '#0A0A1A',
      },
      footerActionLink: { color: isDark ? '#5599FF' : '#0047BB' },
    },
  };
};

export const CLERK_THEME = getClerkTheme('light');
