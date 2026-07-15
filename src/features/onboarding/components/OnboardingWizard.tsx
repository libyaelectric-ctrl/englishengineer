import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/shared/components/Button';

const WelcomeStep = () => (
  <div className="text-center">
    <div className="mb-4 text-6xl">🚀</div>
    <p className="text-gray-600">
      EngineerOS helps engineers master English through AI-powered coaching,
      vocabulary practice, and real-world scenarios.
    </p>
  </div>
);

const LevelStep = () => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-3 gap-3">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => setSelected(level)}
          className={`rounded-lg border-2 p-4 text-center font-bold transition ${
            selected === level
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

const GoalsStep = () => {
  const goals = [
    { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'grammar', label: 'Grammar', icon: '✏️' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'speaking', label: 'Speaking', icon: '🗣️' },
  ];
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => toggle(goal.id)}
          className={`rounded-lg border-2 p-4 text-center transition ${
            selected.includes(goal.id)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="mb-2 text-2xl">{goal.icon}</div>
          <div className="font-medium">{goal.label}</div>
        </button>
      ))}
    </div>
  );
};

const ReadyStep = () => (
  <div className="text-center">
    <div className="mb-4 text-6xl">🎉</div>
    <p className="text-gray-600">
      Your personalized learning path is ready. Let's begin!
    </p>
  </div>
);

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to EngineerOS',
    description: 'Your journey to English mastery begins here.',
    component: WelcomeStep,
  },
  {
    id: 'level',
    title: 'Your English Level',
    description: 'Help us personalize your experience.',
    component: LevelStep,
  },
  {
    id: 'goals',
    title: 'Learning Goals',
    description: 'What would you like to improve?',
    component: GoalsStep,
  },
  {
    id: 'ready',
    title: "You're All Set!",
    description: 'Start learning now.',
    component: ReadyStep,
  },
];

export const OnboardingWizard: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="mb-8 flex justify-center">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="mb-8 text-center">
        <h2 className="mb-2 text-xl font-bold">{steps[currentStep].title}</h2>
        <p className="text-gray-600">{steps[currentStep].description}</p>
      </div>

      <div className="mb-8 min-h-[200px]">
        <StepComponent />
      </div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            <>
              Get Started <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
