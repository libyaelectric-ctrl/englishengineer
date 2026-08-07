import { useState } from 'react';

// Geï¿½ici mock veri - Gerï¿½ek auth entegrasyonu sonrasï¿½ gï¿½ncellenecek
export const useAuth = () => {
  const [user] = useState({
    id: '1',
    name: 'Mï¿½hendis',
    discipline: 'civil_engineering',
    onboardingCompleted: true,
    language: 'tr',
  });

  // Loading state'i ï¿½imdilik false dï¿½nï¿½yoruz
  return { user, loading: false };
};
