import type { ClerkProviderProps } from '@clerk/clerk-react';

/**
 * Clerk brand look matching EngVox tokens in both dark and light modes,
 * applied through the ClerkProvider `appearance` prop.
 */
const pick = (isDark: boolean, darkValue: string, lightValue: string): string =>
  isDark ? darkValue : lightValue;

export const getClerkTheme = (theme?: 'light' | 'dark'): ClerkProviderProps['appearance'] => {
  const isDark = theme === 'dark';

  return {
    variables: {
      colorPrimary: pick(isDark, '#3366CC', '#0047BB'),
      colorTextOnPrimaryBackground: '#FFFFFF',
      colorText: pick(isDark, '#E2E4E7', '#0A0A1A'),
      colorBackground: pick(isDark, '#1C1F26', '#FFFFFF'),
      colorInputBackground: pick(isDark, '#14171E', '#F7F7FB'),
      colorInputText: pick(isDark, '#E2E4E7', '#0A0A1A'),
      colorNeutral: pick(isDark, '#949BA4', '#5A5A6E'),
      borderRadius: '8px',
    },
    elements: {
      card: {
        backgroundColor: pick(isDark, '#1C1F26', '#FFFFFF'),
        boxShadow: pick(
          isDark,
          '0 24px 60px -24px rgba(0, 0, 0, 0.7)',
          '0 24px 60px -24px rgba(0, 71, 187, 0.15)'
        ),
        border: pick(
          isDark,
          '1px solid rgba(51, 102, 204, 0.24)',
          '1px solid rgba(0, 71, 187, 0.14)'
        ),
      },
      headerTitle: { color: pick(isDark, '#FFFFFF', '#0A0A1A') },
      headerSubtitle: { color: pick(isDark, '#949BA4', '#5A5A6E') },
      socialButtonsBlockButton: {
        borderColor: pick(isDark, 'rgba(51, 102, 204, 0.24)', '#D9D9E3'),
        backgroundColor: pick(isDark, '#14171E', '#FFFFFF'),
        color: pick(isDark, '#E2E4E7', '#0A0A1A'),
      },
      formFieldInput: {
        backgroundColor: pick(isDark, '#14171E', '#F7F7FB'),
        borderColor: pick(isDark, 'rgba(51, 102, 204, 0.24)', '#D9D9E3'),
        color: pick(isDark, '#E2E4E7', '#0A0A1A'),
      },
      footerActionLink: { color: pick(isDark, '#5599FF', '#0047BB') },
    },
  };
};

export const CLERK_THEME = getClerkTheme('light');
