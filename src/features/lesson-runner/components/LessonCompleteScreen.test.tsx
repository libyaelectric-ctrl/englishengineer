import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LessonCompleteScreen } from './LessonCompleteScreen';

const translate = (key: string) => {
  const map: Record<string, string> = {
    'lesson.completedBadge': 'Task milestone completed',
    'lesson.completedTitle': 'Inspection approved!',
    'lesson.completedDesc': 'You successfully verified {count} technical specification items.',
    'lesson.careerPoints': 'Career Points',
    'lesson.accuracy': 'Accuracy',
    'lesson.nextTask': 'Next task',
    'lesson.backToRoadmap': 'Back to roadmap',
  };
  return map[key] ?? key;
};

const renderScreen = (
  overrides: {
    earnedCp?: number;
    correctCount?: number;
    totalCount?: number;
  } = {}
) => {
  const onContinue = vi.fn();
  const onBackToRoadmap = vi.fn();
  render(
    <LessonCompleteScreen
      earnedCp={overrides.earnedCp ?? 120}
      correctCount={overrides.correctCount ?? 9}
      totalCount={overrides.totalCount ?? 10}
      onContinue={onContinue}
      onBackToRoadmap={onBackToRoadmap}
      translate={translate}
    />
  );
  return { onContinue, onBackToRoadmap };
};

describe('LessonCompleteScreen', () => {
  it('renders the earned CP and accuracy stats', () => {
    renderScreen({ earnedCp: 120, correctCount: 9, totalCount: 10 });

    expect(screen.getByText('+120')).toBeTruthy();
    expect(screen.getByText('90%')).toBeTruthy();
    expect(
      screen.getByText('You successfully verified 10 technical specification items.')
    ).toBeTruthy();
  });

  it('handles a perfect score of 100%', () => {
    renderScreen({ correctCount: 10, totalCount: 10 });
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('calls the continue and roadmap handlers', () => {
    const { onContinue, onBackToRoadmap } = renderScreen();

    screen.getByRole('button', { name: 'Next task' }).click();
    screen.getByRole('button', { name: 'Back to roadmap' }).click();

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onBackToRoadmap).toHaveBeenCalledTimes(1);
  });
});
