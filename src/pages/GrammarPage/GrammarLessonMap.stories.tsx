import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { GrammarLessonMap } from './GrammarLessonMap';

const meta: Meta<typeof GrammarLessonMap> = {
  title: 'Pages/Grammar/GrammarLessonMap',
  component: GrammarLessonMap,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

const MOCK_PATH_GROUPS = [
  {
    module: 'Verb Tenses',
    entries: [
      {
        rule: {
          id: 'vt-1',
          title: 'Present Simple',
          grammarCategory: 'Tenses',
        },
        status: 'Mastered' as const,
      },
      {
        rule: {
          id: 'vt-2',
          title: 'Present Continuous',
          grammarCategory: 'Tenses',
        },
        status: 'Practicing' as const,
      },
      {
        rule: { id: 'vt-3', title: 'Past Simple', grammarCategory: 'Tenses' },
        status: 'New' as const,
      },
      {
        rule: {
          id: 'vt-4',
          title: 'Present Perfect',
          grammarCategory: 'Tenses',
        },
        status: 'New' as const,
      },
    ],
  },
  {
    module: 'Conditionals',
    entries: [
      {
        rule: {
          id: 'cd-1',
          title: 'Zero Conditional',
          grammarCategory: 'Conditionals',
        },
        status: 'Mastered' as const,
      },
      {
        rule: {
          id: 'cd-2',
          title: 'First Conditional',
          grammarCategory: 'Conditionals',
        },
        status: 'Practicing' as const,
      },
      {
        rule: {
          id: 'cd-3',
          title: 'Second Conditional',
          grammarCategory: 'Conditionals',
        },
        status: 'New' as const,
      },
    ],
  },
  {
    module: 'Passive Voice',
    entries: [
      {
        rule: {
          id: 'pv-1',
          title: 'Passive Present',
          grammarCategory: 'Voice',
        },
        status: 'Needs Reading/Writing' as const,
      },
      {
        rule: { id: 'pv-2', title: 'Passive Past', grammarCategory: 'Voice' },
        status: 'New' as const,
      },
    ],
  },
];

const GrammarLessonMapWrapper = ({
  pathGroups,
  selectedId,
}: {
  pathGroups: typeof MOCK_PATH_GROUPS;
  selectedId?: string;
}) => {
  const lessonStripRef = useRef<HTMLDivElement | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState(selectedId ?? 'vt-2');

  return (
    <GrammarLessonMap
      pathGroups={pathGroups}
      selectedRule={{ id: selectedRuleId }}
      selectRule={setSelectedRuleId}
      scrollLessonStrip={(dir) => {
        if (lessonStripRef.current) {
          lessonStripRef.current.scrollBy({
            left: dir === 'left' ? -200 : 200,
            behavior: 'smooth',
          });
        }
      }}
      lessonStripRef={lessonStripRef}
    />
  );
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <GrammarLessonMapWrapper pathGroups={MOCK_PATH_GROUPS} />,
};

export const EmptyState: Story = {
  render: () => <GrammarLessonMapWrapper pathGroups={[]} />,
};
