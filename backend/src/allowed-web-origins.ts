export const allowedWebOrigins = (config: {
  environment: string;
  appOrigin?: string;
  corsAllowedOrigins?: string[];
}): string[] => {
  const origins = [
    config.appOrigin,
    ...(config.corsAllowedOrigins ?? []),
    ...(config.environment === 'production'
      ? ['https://engvox.com', 'https://www.engvox.com', 'capacitor://localhost']
      : []),
  ].filter((origin): origin is string => Boolean(origin));
  return [
    ...new Set(
      origins.flatMap((origin) => {
        try {
          const url = new URL(origin);
          const host = url.hostname.startsWith('www.')
            ? url.hostname.slice(4)
            : `www.${url.hostname}`;
          return [origin, `${url.protocol}//${host}${url.port ? `:${url.port}` : ''}`];
        } catch {
          return [origin];
        }
      })
    ),
  ];
};
