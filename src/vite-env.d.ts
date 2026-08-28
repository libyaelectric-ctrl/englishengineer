/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_VERSION?: string;
  VITE_ENVIRONMENT_MODE?: string;
  VITE_AI_PROVIDER?: string;
  VITE_AI_PROXY_URL?: string;
  VITE_AUTH_PROVIDER?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_BILLING_API_URL?: string;

  VITE_ERROR_MONITORING_PROVIDER?: string;
  VITE_SENTRY_DSN?: string;
  VITE_ERROR_MONITORING_SAMPLE_RATE?: string;
  VITE_VOCABULARY_API_URL?: string;
  VITE_LIBRETRANSLATE_URL?: string;
  VITE_LOG_LEVEL?: string;
  VITE_PRODUCT_ANALYTICS_ENABLED?: string;
  VITE_PRODUCT_ANALYTICS_PROVIDER?: string;
  VITE_SITE_URL?: string;
  VITE_ALLOW_LOCAL_AUTH?: string;
  VITE_BACKEND_URL?: string;
}
