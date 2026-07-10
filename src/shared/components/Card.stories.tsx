import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Shared/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-4">
        <h3 className="text-sm font-bold text-foreground">Card Title</h3>
        <p className="mt-1 text-xs text-muted-copy">
          Card description content goes here.
        </p>
      </div>
    ),
  },
};

export const WithBorder: Story = {
  args: {
    children: (
      <div className="p-4">
        <h3 className="text-sm font-bold text-foreground">Bordered Card</h3>
        <p className="mt-1 text-xs text-muted-copy">
          This card has a visible border.
        </p>
      </div>
    ),
  },
};
