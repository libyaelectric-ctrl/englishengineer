/**
 * Capacitor-aware utility functions.
 * These detect whether the app is running inside a native Capacitor shell
 * (Android/iOS) or a regular browser and provide cross-platform fallbacks.
 */
import { Capacitor } from '@capacitor/core';

/** True when running inside a Capacitor native shell (Android or iOS). */
export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();

/** True when running on Android specifically. */
export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

/** True when running on iOS specifically. */
export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';

/**
 * Open a URL. On native platforms, uses @capacitor/browser to open in the
 * system browser. In a regular browser, falls back to window.open().
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, toolbarColor: '#1a1a2e' });
    } catch {
      // Fallback if plugin fails
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Copy text to clipboard. On native platforms, uses @capacitor/clipboard.
 * In a regular browser, falls back to navigator.clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (isNativePlatform()) {
    try {
      const { Clipboard } = await import('@capacitor/clipboard');
      await Clipboard.write({ string: text });
      return true;
    } catch {
      return false;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reload the app. On native platforms, navigates to root path.
 * In a regular browser, uses window.location.reload().
 */
export async function reloadApp(): Promise<void> {
  if (isNativePlatform()) {
    try {
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  } else {
    window.location.reload();
  }
}

/**
 * Navigate to a route within the app. The app uses a hash router on every
 * platform (web and Capacitor), so internal navigation must update the
 * `location.hash` — assigning `window.location.href = '/dashboard'` would
 * trigger a full document load and, inside the Capacitor WebView, depend on
 * the local server's index.html fallback instead of letting react-router
 * handle the route (full reload, landing flash, lost in-memory state).
 */
export function navigateTo(path: string): void {
  const target = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
}

/**
 * Check if the Clipboard API is available (used for conditional rendering).
 */
export function isClipboardAvailable(): boolean {
  if (isNativePlatform()) return true; // @capacitor/clipboard always available
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
}

/**
 * Check if Speech Recognition is available.
 * WebView on Android does NOT support webkitSpeechRecognition.
 */
export function isSpeechRecognitionAvailable(): boolean {
  if (isNativePlatform()) return false; // Not available in WebView
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

/**
 * Check if getUserMedia (microphone) is available.
 * Works on native but may need permissions prompt.
 */
export function isMicrophoneAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

/**
 * Open a mailto: link. On native platforms, uses the system mail client.
 * In a browser, uses window.open.
 */
export async function openMailto(to: string, subject: string, body: string): Promise<void> {
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: mailtoUrl });
    } catch {
      window.open(mailtoUrl);
    }
  } else {
    window.open(mailtoUrl);
  }
}

/**
 * Download a file. On native platforms, uses Web Share API or Capacitor Filesystem.
 * In a regular browser, uses the standard <a download> pattern.
 */
export async function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType = 'text/plain'
): Promise<void> {
  if (isNativePlatform()) {
    try {
      const text = typeof content === 'string' ? content : await content.text();
      const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;

      // Try Web Share API first (opens share sheet on mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          return;
        }
      }

      // Fallback: Capacitor Filesystem write + download
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const base64 =
        typeof content === 'string'
          ? btoa(unescape(encodeURIComponent(text)))
          : await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
              reader.readAsDataURL(blob);
            });

      await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });
    } catch {
      // Last resort: try standard <a download>
      const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } else {
    const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
