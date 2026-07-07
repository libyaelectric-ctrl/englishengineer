import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Shared/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'neutral', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Info: Story = {
  args: {
    label: 'Info Badge',
    tone: 'info',
  },
};

export const Success: Story = {
  args: {
    label: 'Completed',
    tone: 'success',
  },
};

export const Warning: Story = {
  args: {
    label: 'Needs Attention',
    tone: 'warning',
  },
};

export const Error: Story = {
  args: {
    label: 'Failed',
    tone: 'danger',
  },
};
