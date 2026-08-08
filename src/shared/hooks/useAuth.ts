import { useState } from 'react';

// Geçici mock veri - Gerçek auth entegrasyonu sonrası güncellenecek
export const useAuth = () => {
  const [user] = useState({
    id: '1',
    name: 'Mühendis',
    discipline: 'civil_engineering',
    onboardingCompleted: true,
    language: 'tr',
  });

  // Loading state'i şimdilik false dönüyoruz
  return { user, loading: false };
};
