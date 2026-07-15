import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createI18nMiddleware } from '../src/i18n.js';

describe('i18n middleware', () => {
  it('defaults to English when no Accept-Language header', () => {
    const middleware = createI18nMiddleware();
    const req = { headers: {} };
    const res = {};
    let called = false;
    middleware(req, res, () => {
      called = true;
    });

    assert.equal(called, true);
    assert.equal(req.i18n.lang, 'en');
    assert.equal(
      req.i18n.t('authentication_required'),
      'A valid backend authorization token is required.'
    );
  });

  it('detects Turkish from Accept-Language header', () => {
    const middleware = createI18nMiddleware();
    const req = { headers: { 'accept-language': 'tr-TR,tr;q=0.9,en;q=0.8' } };
    const res = {};
    let called = false;
    middleware(req, res, () => {
      called = true;
    });

    assert.equal(req.i18n.lang, 'tr');
    assert.equal(
      req.i18n.t('authentication_required'),
      'Geçerli bir yetkilendirme jetonu gerekiyor.'
    );
  });

  it('falls back to English for unknown language', () => {
    const middleware = createI18nMiddleware();
    const req = { headers: { 'accept-language': 'fr-FR,fr;q=0.9' } };
    const res = {};
    let called = false;
    middleware(req, res, () => {
      called = true;
    });

    assert.equal(req.i18n.lang, 'en');
  });

  it('returns key itself when translation is missing', () => {
    const middleware = createI18nMiddleware();
    const req = { headers: {} };
    const res = {};
    middleware(req, res, () => {});

    assert.equal(req.i18n.t('nonexistent_key'), 'nonexistent_key');
  });

  it('handles malformed Accept-Language header', () => {
    const middleware = createI18nMiddleware();
    const req = { headers: { 'accept-language': '' } };
    const res = {};
    middleware(req, res, () => {});

    assert.equal(req.i18n.lang, 'en');
  });

  it('handles undefined Accept-Language header', () => {
    const middleware = createI18nMiddleware();
    const req = { headers: { 'accept-language': undefined } };
    const res = {};
    middleware(req, res, () => {});

    assert.equal(req.i18n.lang, 'en');
  });

  it('translates all major error categories in Turkish', () => {
    const middleware = createI18nMiddleware();
    const req = { headers: { 'accept-language': 'tr' } };
    const res = {};
    middleware(req, res, () => {});

    const keys = [
      'validation_error',
      'authentication_required',
      'STRIPE_NOT_CONFIGURED',
      'ai_timeout',
      'vocabulary_not_found',
      'workspace_not_found',
      'rate_limit_exceeded',
      'internal_error',
    ];
    keys.forEach((key) => {
      const translated = req.i18n.t(key);
      assert.notEqual(translated, key, `Key "${key}" should be translated`);
    });
  });
});
