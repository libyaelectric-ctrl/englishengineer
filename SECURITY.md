# Security Policy

## Supported Versions

| Version | Supported              |
| ------- | ---------------------- |
| 4.0.x   | ✅ Yes                 |
| 3.x     | ⚠️ Critical fixes only |
| < 3.0   | ❌ No                  |

## Reporting a Vulnerability

**Please do NOT open public issues for security vulnerabilities.**

Instead, email: **libyaelectric@gmail.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response timeline:**

- Acknowledgment: Within 48 hours
- Initial assessment: Within 1 week
- Fix released: Within 30 days (critical), 90 days (non-critical)

## Security Headers

EngineerOS uses the following security headers (via Helmet):

| Header                    | Value                             | Purpose                  |
| ------------------------- | --------------------------------- | ------------------------ |
| Content-Security-Policy   | `default-src 'self'`              | XSS prevention           |
| Strict-Transport-Security | `max-age=31536000`                | HTTPS enforcement        |
| X-Content-Type-Options    | `nosniff`                         | MIME sniffing prevention |
| X-Frame-Options           | `DENY`                            | Clickjacking prevention  |
| Referrer-Policy           | `strict-origin-when-cross-origin` | Privacy                  |

## Dependency Security

- **npm audit**: Run in CI on every PR
- **Dependabot**: Enabled for automatic security updates
- **License checker**: Rejects GPL/AGPL licenses
- **Update policy**: Patch/minor auto-merge, major manual review

## Authentication

- JWT tokens with 1-hour expiration
- Refresh token rotation
- Supabase Row Level Security (RLS) enabled
- Password requirements: 8+ chars, mixed case, number

## Data Protection

- All data encrypted at rest (Supabase)
- TLS 1.3 for all connections
- PII minimized — only email and name stored
- GDPR compliance: Right to deletion, data export

## AI Provider Security

- API keys stored in environment variables (never in code)
- Rate limiting per user (prevents abuse)
- Prompt sanitization via DOMPurify
- No user data shared with AI providers for training

## Security Checklist

### For Developers

- [ ] Never commit `.env` files
- [ ] Use `VITE_` prefix only for public env vars
- [ ] Validate all inputs with Zod schemas
- [ ] Sanitize user-generated content
- [ ] Review Dependabot PRs within 7 days

### For Ops

- [ ] Rotate API keys quarterly
- [ ] Review Sentry error trends weekly
- [ ] Monitor Stripe webhook logs
- [ ] Audit Supabase RLS policies monthly
- [ ] Run `npm audit` before each release

## Security Audit History

| Date       | Auditor    | Findings          | Status      |
| ---------- | ---------- | ----------------- | ----------- |
| 2026-07-27 | Self-audit | 0 critical, 3 low | In progress |

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Supabase Security](https://supabase.com/docs/guides/security)

## Last Updated

- **Date:** 2026-07-27
