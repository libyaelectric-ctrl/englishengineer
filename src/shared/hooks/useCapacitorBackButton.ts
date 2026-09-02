import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isNativePlatform } from '@/shared/utils/capacitor';

/**
 * Handles the Android hardware back button.
 * - On root paths (/dashboard, /, /pricing), exits the app.
 * - On other paths, navigates back via react-router.
 */
export function useCapacitorBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNativePlatform()) return;

    let removeListener: (() => Promise<void>) | null = null;

    import('@capacitor/app').then(({ App }) => {
      App.addListener('backButton', ({ canGoBack }) => {
        const rootPaths = ['/', '/dashboard', '/pricing', '/onboard'];

        if (rootPaths.includes(location.pathname)) {
          App.exitApp();
        } else if (canGoBack) {
          navigate(-1);
        } else {
          navigate('/dashboard');
        }
      }).then((handle) => {
        removeListener = handle.remove;
      });
    });

    return () => {
      removeListener?.();
    };
  }, [navigate, location.pathname]);
}
