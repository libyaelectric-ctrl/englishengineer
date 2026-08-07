import { useState } from 'react';

// Ge�ici mock veri - Ger�ek auth entegrasyonu sonras� g�ncellenecek
export const useAuth = () => {
  const [user] = useState({
    id: '1',
    name: 'M�hendis',
    discipline: 'civil_engineering',
    onboardingCompleted: true,
    language: 'tr',
  });

  // Loading state'i �imdilik false d�n�yoruz
  return { user, loading: false };
};
