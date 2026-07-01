import { useEffect } from 'react';

interface PageMetadataProps {
  title: string;
  description: string;
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

export const PageMetadata = ({ title, description }: PageMetadataProps) => {
  useEffect(() => {
    document.title = `${title} | EngineerOS`;
    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    });
    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: `${title} | EngineerOS`,
    });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    });
  }, [description, title]);

  return null;
};
