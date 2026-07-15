import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_TITLE = 'EngineerOS - Engineering English Training';
const DEFAULT_DESCRIPTION =
  'Master engineering English with AI-powered learning, vocabulary building, and professional communication practice.';
const DEFAULT_IMAGE = '/brand/og-image.png';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
}) => {
  const fullTitle = title ? `${title} | EngineerOS` : DEFAULT_TITLE;
  const baseUrl = 'https://englishengineer.vercel.app';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="image"
        content={image.startsWith('http') ? image : `${baseUrl}${image}`}
      />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta
        property="og:image"
        content={image.startsWith('http') ? image : `${baseUrl}${image}`}
      />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="EngineerOS" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content={image.startsWith('http') ? image : `${baseUrl}${image}`}
      />

      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEO;
