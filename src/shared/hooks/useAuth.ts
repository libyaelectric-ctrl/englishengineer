import { useState } from 'react';

// Basit ve derlenebilir bir mock auth hook'u
export const useAuth = () => {
  // Kullan�lmayan setter'lar� ve useEffect'i kald�rd�k
  const user = {
    id: '1',
    name: 'M�hendis',
    discipline: 'general',
    onboardingCompleted: true,
    language: 'tr',
  };
  const loading = false;

  return { user, loading };
};
