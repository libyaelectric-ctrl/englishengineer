export function useNotificationReminder() {
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    return Notification.requestPermission();
  };

  const scheduleDaily = (time: string, title: string, body: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();
    return setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      scheduleDaily(time, title, body);
    }, delay);
  };

  return { requestPermission, scheduleDaily };
}
