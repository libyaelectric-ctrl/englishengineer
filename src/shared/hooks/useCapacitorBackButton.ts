import { useEffect } from 'react';
import { router } from '@/routes/router';
import { isNativePlatform } from '@/shared/utils/capacitor';

/**
 * Handles the Android hardware back button.
 * - On root paths (/dashboard, /, /pricing), exits the app.
 * - On other paths, navigates back via router.
 */
export function useCapacitorBackButton() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let removeListener: (() => Promise<void>) | null = null;

    import('@capacitor/app').then(({ App }) => {
      App.addListener('backButton', ({ canGoBack }) => {
        const currentPath =
          router?.state?.location?.pathname ||
          window.location.hash.replace(/^#/, '') ||
          '/';
        const rootPaths = ['/', '/dashboard', '/pricing', '/onboard', '/start'];

        if (rootPaths.includes(currentPath)) {
          App.exitApp();
        } else if (canGoBack) {
          router.navigate(-1);
        } else {
          router.navigate('/dashboard');
        }
      }).then((handle) => {
        removeListener = handle.remove;
      });
    });

    return () => {
      removeListener?.();
    };
  }, []);
}

