# Encryption & Data Security Strategy

## 1. Encryption At Rest

All persistent storage databases (Supabase / PostgreSQL) employ strict encryption-at-rest.

- **Underlying Technology:** Supabase provisions AWS EBS volumes using AES-256 encryption.
- **Key Management:** Managed by AWS Key Management Service (KMS).

## 2. Encryption In Transit

- **TLS Enforcement:** All communication between the client browser, Vercel frontend, and Supabase backend is strictly conducted over HTTPS using TLS 1.2 or higher.
- **HSTS:** Strict-Transport-Security headers are enforced via the `Helmet` middleware and Vercel configurations.

## 3. Application-Level Encryption

- **Authentication Secrets:** Passwords are not stored in plaintext; they are hashed by Supabase Auth using bcrypt/argon2.
- **JWT Verification:** JSON Web Tokens are symmetrically verified using `HMAC-SHA256` combined with a securely injected environment secret (`SUPABASE_JWT_SECRET`).

## 4. Secret Management

- **Local Environment:** Developer keys are stored in `.env.local` which is strictly `.gitignore`d.
- **Production Environment:** Secrets are securely injected using Vercel Environment Variables and are never hard-coded in the repository.
