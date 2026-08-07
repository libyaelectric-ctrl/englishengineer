import React, { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<Props> = ({ onComplete }) => {
  // Sayfa aï¿½ï¿½lï¿½r aï¿½ï¿½lmaz hiï¿½bir ï¿½ey sormadan direkt tamamlanmï¿½ï¿½ say
  useEffect(() => {
    console.log('Otomatik geï¿½iï¿½ yapï¿½lï¿½yor...');
    setTimeout(() => onComplete(), 500); // 0.5 saniye bekle ve geï¿½ir
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sistem Hazï¿½rlanï¿½yor...</h2>
        <p className="text-gray-600">Yï¿½nlendiriliyorsunuz.</p>
        <div className="mt-4 h-2 w-48 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-600 animate-[width_1s_ease-in-out]"></div>
        </div>
      </div>
    </div>
  );
};
