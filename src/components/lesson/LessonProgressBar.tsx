import React from 'react';

interface LessonProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const LessonProgressBar: React.FC<LessonProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((currentStep / totalSteps) * 100)));

  return (
    <div className="w-full bg-[var(--color-border-soft)] h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 ease-out shadow-sm"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
