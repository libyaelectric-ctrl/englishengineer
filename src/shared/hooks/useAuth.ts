import { useEffect, useState } from 'react';

export const useAuth = () => {
  // Ger�ek auth gelene kadar sahte kullan�c�
  const [user, setUser] = useState<any>({
    id: '1',
    name: 'Misafir',
    discipline: 'general',
    onboardingCompleted: true,
  });
  const [loading, setLoading] = useState(false);
  return { user, loading };
};
