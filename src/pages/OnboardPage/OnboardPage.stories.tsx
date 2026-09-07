import '@/index.css';
import type { Meta, StoryObj } from '@storybook/react';

import { MemoryRouter } from 'react-router-dom';

import { ThemeProvider } from '@/features/theme/ThemeProvider';

import OnboardPage from './index';

const meta: Meta<typeof OnboardPage> = {
  title: 'Pages/OnboardPage',
  component: OnboardPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <MemoryRouter initialEntries={['/onboard']}>
          <Story />
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
