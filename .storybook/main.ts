import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // Storybook 10 ships the essentials (controls, actions, viewport, backgrounds,
  // docs) and interactions inside core, so the standalone v8 addon packages must
  // not be listed here — they import from `storybook/internal/components`, which
  // no longer exports `Icons`, and the build fails with a NoMatchingExportError.
  addons: ['@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: true,
    reactDocgen: 'react-docgen',
  },
};

export default config;
