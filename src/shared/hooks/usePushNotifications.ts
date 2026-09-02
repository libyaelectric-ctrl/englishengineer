import { useEffect } from 'react';
import { isNativePlatform } from '@/shared/utils/capacitor';

/**
 * Requests push notification permission on native platforms.
 * Does nothing on web (web push is handled separately).
 */
export function usePushNotifications() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    import('@capacitor/push-notifications').then(({ PushNotifications }) => {
      // Request permission
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          // Register for FCM/APNs
          PushNotifications.register();
        }
      }).catch((err) => {
        console.warn('[PushNotifications] Permission request failed:', err);
      });

      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.info('[PushNotifications] Registered:', token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (err) => {
        console.warn('[PushNotifications] Registration error:', err);
      });

      // Listen for incoming notifications (foreground)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.info('[PushNotifications] Received:', notification.title);
      });

      // Listen for notification tap
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.info('[PushNotifications] Action performed:', action.actionId);
      });
    }).catch(() => {
      // Plugin not available — ignore
    });
  }, []);
}
