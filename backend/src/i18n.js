const translations = {
  en: {
    // Validation errors
    validation_error: 'Invalid request body.',
    validation_query_error: 'Invalid query parameters.',
    missing_word: 'A vocabulary word is required.',
    invalid_word: 'Vocabulary words must be 100 characters or fewer.',
    invalid_target_language: 'targetLang must be a short language code.',
    invalid_prompt: 'A non-empty prompt is required.',
    prompt_too_large: 'Prompt must be 20,000 characters or fewer.',
    invalid_operation: 'The AI operation must match the requested route.',
    invalid_request: 'Invalid request.',
    missing_authenticated_user:
      'X-EngineerOS-User-Id is required for internal authentication.',
    memory_key_required: 'Memory key is required.',
    document_name_required: 'Document name is required.',

    // Auth errors
    authentication_required: 'A valid backend authorization token is required.',
    auth_provider_unavailable:
      'Authentication provider is temporarily unavailable.',
    FORBIDDEN_DEMO_ACTION: 'Demo profiles do not have billing privileges.',

    // Billing errors
    STRIPE_NOT_CONFIGURED:
      'Billing backend is unavailable because Stripe is not configured.',
    billing_user_mismatch: 'Billing requests cannot target another user.',
    BILLING_STATUS_UNAVAILABLE: 'Billing status is temporarily unavailable.',
    INVALID_PLAN: 'Unknown plan.',
    free_ai_coach_limit_exceeded:
      'Free plan accounts are limited to 3 AI Coach requests per day. Please upgrade to Pro.',
    monthly_ai_credit_limit_exceeded:
      'Monthly AI credit limit reached (300/300). Please contact support or upgrade.',

    // AI errors
    ai_timeout: 'The AI provider did not respond before the timeout.',
    ai_rate_limited: 'The AI provider rate limit was reached.',
    ai_provider_error: 'The AI provider is currently unavailable.',
    malformed_ai_response: 'The AI provider returned an invalid response.',

    // Vocabulary errors
    vocabulary_not_found: 'No external dictionary entry was found.',
    vocabulary_provider_unavailable:
      'External vocabulary lookup is temporarily unavailable.',
    vocabulary_lookup_timeout: 'External vocabulary lookup timed out.',

    // Workspace errors
    workspace_not_found: 'Workspace not found.',
    workspace_limit_reached: 'Workspace limit reached for your plan.',
    cannot_delete_last_workspace: 'Cannot delete the only workspace.',

    // Rate limiting
    rate_limit_exceeded: 'Too many requests. Please try again later.',

    // General errors
    route_not_found: 'Route not found.',
    internal_error: 'The backend could not complete the request.',
    stripe_webhook_not_configured:
      'Stripe webhook verification is not configured.',
    invalid_webhook_signature: 'Stripe webhook signature verification failed.',
  },
  tr: {
    // Validation errors
    validation_error: 'Geçersiz istek gövdesi.',
    validation_query_error: 'Geçersiz sorgu parametreleri.',
    missing_word: 'Bir kelime girilmesi gerekiyor.',
    invalid_word: 'Kelimeler 100 karakterden kısa olmalı.',
    invalid_target_language: 'Hedef dil kısa bir dil kodu olmalı.',
    invalid_prompt: 'Boş olmayan bir prompt gerekli.',
    prompt_too_large: 'Prompt 20.000 karakterden kısa olmalı.',
    invalid_operation: 'AI işlemi istenen rota ile eşleşmeli.',
    invalid_request: 'Geçersiz istek.',
    missing_authenticated_user:
      'Dahili kimlik doğrulama için X-EngineerOS-User-Id gereklidir.',
    memory_key_required: 'Bellek anahtarı gereklidir.',
    document_name_required: 'Belge adı gereklidir.',

    // Auth errors
    authentication_required: 'Geçerli bir yetkilendirme jetonu gerekiyor.',
    auth_provider_unavailable:
      'Kimlik doğrulama sağlayıcısı şu anda kullanılamıyor.',
    FORBIDDEN_DEMO_ACTION: 'Demo profilleri fatura işlemleri yapamaz.',

    // Billing errors
    STRIPE_NOT_CONFIGURED:
      'Stripe yapılandırılmadığı için fatura sistemi kullanılamıyor.',
    billing_user_mismatch:
      'Fatura istekleri başka bir kullanıcıyı hedefleyemez.',
    BILLING_STATUS_UNAVAILABLE: 'Fatura durumu geçici olarak kullanılamıyor.',
    INVALID_PLAN: 'Bilinmeyen plan.',
    free_ai_coach_limit_exceeded:
      'Ücretsiz plan hesapları günde 3 AI Koç isteği ile sınırlıdır. Pro planına yükseltin.',
    monthly_ai_credit_limit_exceeded:
      'Aylık AI kredi limiti doldu (300/300). Destek ile iletişime geçin veya yükseltme yapın.',

    // AI errors
    ai_timeout: 'AI sağlayıcısı zaman aşımında yanıt vermedi.',
    ai_rate_limited: 'AI sağlayıcı hız limitine ulaşıldı.',
    ai_provider_error: 'AI sağlayıcısı şu anda kullanılamıyor.',
    malformed_ai_response: 'AI sağlayıcısı geçersiz bir yanıt döndürdü.',

    // Vocabulary errors
    vocabulary_not_found: 'Dış sözlükte eşleşen kayıt bulunamadı.',
    vocabulary_provider_unavailable:
      'Dış sözlük araması geçici olarak kullanılamıyor.',
    vocabulary_lookup_timeout: 'Dış sözlük araması zaman aşımına uğradı.',

    // Workspace errors
    workspace_not_found: 'Çalışma alanı bulunamadı.',
    workspace_limit_reached: 'Planınız için çalışma alanı limitine ulaşıldı.',
    cannot_delete_last_workspace: 'Tek çalışma alanı silinemez.',

    // Rate limiting
    rate_limit_exceeded: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',

    // General errors
    route_not_found: 'Rota bulunamadı.',
    internal_error: 'Backend isteği tamamlayamadı.',
    stripe_webhook_not_configured:
      'Stripe webhook doğrulaması yapılandırılmamış.',
    invalid_webhook_signature: 'Stripe webhook imza doğrulaması başarısız.',
  },
};

const parseAcceptLanguage = (header) => {
  if (!header || typeof header !== 'string') return 'en';
  const preferred = header.split(',')[0]?.split(';')[0]?.trim().toLowerCase();
  return preferred?.startsWith('tr') ? 'tr' : 'en';
};

export const createI18nMiddleware = () => (req, _res, next) => {
  const lang = parseAcceptLanguage(req.headers['accept-language']);
  req.i18n = {
    lang,
    t: (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
  };
  next();
};
