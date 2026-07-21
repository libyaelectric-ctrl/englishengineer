import DOMPurify from 'isomorphic-dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export const SafeHTML = ({
  html,
  className,
  allowedTags,
  allowedAttributes,
}: SafeHTMLProps) => {
  const config: Record<string, unknown> = {};
  if (allowedTags) config.ALLOWED_TAGS = allowedTags;
  if (allowedAttributes) config.ALLOWED_ATTR = allowedAttributes;

  const clean = DOMPurify.sanitize(html, config as Parameters<typeof DOMPurify.sanitize>[1]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
