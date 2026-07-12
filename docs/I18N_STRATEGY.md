# Internationalization (i18n) Strategy

## Overview

This document defines the internationalization strategy for EngineerOS, focusing on English language learning support.

## Current Scope

### Primary Language

- **English (en):** All UI and content

### Future Languages (Planned)

- **Turkish (tr):** Native language support
- **Spanish (es):** High-demand language
- **French (fr):** Expansion market

## Architecture

### Frontend i18n

```typescript
// Current implementation
const messages = {
  en: {
    welcome: 'Welcome to EngineerOS',
    login: 'Log In',
    signup: 'Sign Up',
  },
};

// Usage
const { t } = useTranslation();
<h1>{t('welcome')}</h1>
```

### Backend i18n

```javascript
// Current implementation
const i18nMiddleware = (req, res, next) => {
  const lang = req.headers['accept-language'] || 'en';
  req.i18n = createI18n(lang);
  next();
};
```

## Translation Workflow

### 1. Extract Strings

```bash
npm run i18n:extract
```

### 2. Translate

- Use professional translation service
- Context-aware translations
- Avoid machine translation for UI

### 3. Review

- Native speaker review
- Context verification
- Consistency check

### 4. Integrate

```bash
npm run i18n:integrate
```

## Content Categories

### UI Strings

| Category | Examples |
|----------|----------|
| Navigation | Menu items, buttons |
| Forms | Labels, placeholders, errors |
| Messages | Success, error, warning |
| Modals | Confirmations, alerts |

### Educational Content

| Category | Examples |
|----------|----------|
| Lessons | Grammar, vocabulary |
| Exercises | Quizzes, practice |
| Feedback | Corrections, hints |
| Achievements | Badges, rewards |

## File Structure

```
src/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── learning.json
│   │   └── billing.json
│   ├── tr/
│   │   ├── common.json
│   │   └── ...
│   └── ...
├── i18n/
│   ├── index.ts
│   ├── config.ts
│   └── hooks.ts
└── components/
    └── TranslatedText.tsx
```

## Translation Management

### Tools

- **Translation:** Crowdin or Lokalise
- **Review:** Native speaker approval
- **Integration:** Automated CI/CD

### Process

1. Developer adds new strings
2. Strings extracted to translation tool
3. Translator provides translations
4. Reviewer approves
5. Translations integrated automatically

## Quality Standards

### Translation Quality

- Professional translators only
- Context-aware translations
- Consistent terminology
- Cultural sensitivity

### Technical Standards

- UTF-8 encoding
- Pluralization support
- Date/number formatting
- RTL support (future)

## Performance

### Loading Strategy

```typescript
// Lazy load translations
const en = () => import('./locales/en/common.json');
const tr = () => import('./locales/tr/common.json');

// Preload current language
const preloadLanguage = (lang: string) => {
  if (lang === 'en') en();
  else if (lang === 'tr') tr();
};
```

### Caching

- Cache translations in localStorage
- Version translations for updates
- Fallback to default language

## Monitoring

### Metrics

| Metric | Target |
|--------|--------|
| Translation coverage | 100% |
| Missing translations | 0 |
| Outdated translations | < 5% |
| User language distribution | Tracked |

### Alerts

- Missing translations detected
- Outdated translations flagged
- Language switching errors

## Roadmap

### Phase 1 (Current)

- [x] English UI
- [x] Basic i18n infrastructure
- [x] Translation extraction

### Phase 2 (Q3 2026)

- [ ] Turkish language support
- [ ] Translation management tool
- [ ] Automated testing

### Phase 3 (Q4 2026)

- [ ] Spanish language support
- [ ] French language support
- [ ] RTL support

## Last Updated

- **Date:** 2026-07-12
- **Version:** 1.0
