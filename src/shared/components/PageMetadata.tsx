import { useEffect } from 'react';

interface PageMetadataProps {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) =>
    element?.setAttribute(name, value)
  );
};

export const PageMetadata = ({ title, description, canonical, jsonLd }: PageMetadataProps) => {
  useEffect(() => {
    document.title = `${title} | EngVox`;
    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    });
    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: `${title} | EngVox`,
    });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: 'EngVox',
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: `${title} | EngVox`,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });

    if (canonical) {
      let linkEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.setAttribute('rel', 'canonical');
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute('href', canonical);
    }

    if (jsonLd) {
      let scriptEl = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    }
  }, [description, title, canonical, jsonLd]);

  return null;
};
