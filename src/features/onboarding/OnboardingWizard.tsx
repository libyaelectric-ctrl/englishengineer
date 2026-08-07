import React from 'react';

interface Props {
  onComplete: () => void;
}
export const OnboardingWizard: React.FC<Props> = ({ onComplete }) => (
  <div className="p-10 text-center">
    <h2>Onboarding Y�kleniyor...</h2>
    <button onClick={onComplete} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
      Tamamla
    </button>
  </div>
);
