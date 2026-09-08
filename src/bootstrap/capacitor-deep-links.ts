const WEB_DEEP_LINK_HOSTS = new Set(['engvox.com', 'www.engvox.com']);
const NATIVE_SCHEME = 'com.engvox.app:';

export function toInternalDeepLinkPath(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.protocol === 'https:' && WEB_DEEP_LINK_HOSTS.has(url.hostname)) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    if (url.protocol === NATIVE_SCHEME) {
      const path = `/${url.host}${url.pathname}`.replace(/\/{2,}/g, '/');
      return `${path}${url.search}${url.hash}`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function registerCapacitorDeepLinks(): Promise<void> {
  const { App } = await import('@capacitor/app');
  const navigate = ({ url }: { url: string }) => {
    const internalPath = toInternalDeepLinkPath(url);
    if (!internalPath) return;
    window.history.pushState({}, '', internalPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  await App.addListener('appUrlOpen', navigate);
  const launchUrl = await App.getLaunchUrl();
  if (launchUrl?.url) navigate(launchUrl);
}
