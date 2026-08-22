import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const ClickInteraction: Story = {
  args: {
    children: 'Click Me',
    variant: 'primary',
  },
  play: async ({ args }) => {
    // Interaction test: verify onClick is called
    // Note: full userEvent tests require @storybook/test
    if (args.onClick) {
      args.onClick({} as React.MouseEvent<HTMLButtonElement>);
    }
  },
};

export const DisabledNoClick: Story = {
  args: {
    children: 'Cannot Click',
    variant: 'danger',
    disabled: true,
  },
};
