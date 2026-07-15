import { useState, useEffect } from 'react';

interface NetworkStatus {
  online: boolean;
  downlink: number | null;
  effectiveType: string | null;
  rtt: number | null;
  saveData: boolean;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    downlink: null,
    effectiveType: null,
    rtt: null,
    saveData: false,
  });

  useEffect(() => {
    const handleOnline = () => setStatus((prev) => ({ ...prev, online: true }));
    const handleOffline = () =>
      setStatus((prev) => ({ ...prev, online: false }));

    const updateNetworkInfo = () => {
      const connection = (
        navigator as unknown as { connection?: NetworkInformation }
      ).connection;
      if (connection) {
        setStatus({
          online: navigator.onLine,
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const connection = (
        navigator as unknown as { connection?: NetworkInformation }
      ).connection;
      connection?.addEventListener('change', updateNetworkInfo);
      updateNetworkInfo();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        const connection = (
          navigator as unknown as { connection?: NetworkInformation }
        ).connection;
        connection?.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return status;
};

interface NetworkInformation {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}
