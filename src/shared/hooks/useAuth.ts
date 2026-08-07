import { useState } from 'react';

// Basitle�tirilmi� Auth Hook'u (Build hatas� vermemesi i�in)
export const useAuth = () => {
  // Ger�ek uygulamada buras� Context veya API'den gelir
  const [user] = useState({
    id: '1',
    name: 'M�hendis',
    discipline: 'general',
    onboardingCompleted: true,
    language: 'tr',
  });

  // Loading state'i sabit false olarak d�n�yoruz (�imdilik)
  const loading = false;

  return { user, loading };
};
