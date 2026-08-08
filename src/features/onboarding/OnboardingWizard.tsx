import React, { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<Props> = ({ onComplete }) => {
  // Sayfa açılır açılmaz hiçbir şey sormadan direkt tamamlanmış say
  useEffect(() => {
    console.log('Otomatik geçiş yapılıyor...');
    setTimeout(() => onComplete(), 500); // 0.5 saniye bekle ve geçir
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sistem Hazırlanıyor...</h2>
        <p className="text-gray-600">Yönlendiriliyorsunuz.</p>
        <div className="mt-4 h-2 w-48 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-600 animate-[width_1s_ease-in-out]"></div>
        </div>
      </div>
    </div>
  );
};
