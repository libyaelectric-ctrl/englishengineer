import { useEffect, useState } from 'react';

const readConsent = () => {
  try {
    return localStorage.getItem('engvox_cookie_consent') === 'accepted';
  } catch {
    return false;
  }
};

export const useAnalyticsConsent = () => {
  const [accepted, setAccepted] = useState(readConsent);
  useEffect(() => {
    const update = () => setAccepted(readConsent());
    window.addEventListener('engvox:cookie-consent', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('engvox:cookie-consent', update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return accepted;
};
