import { timingSafeEqual, webcrypto } from 'node:crypto';
import { ApiError } from './errors.js';

const subtle = webcrypto.subtle;

const base64urlDecode = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64');
};

const verifyJwtLocally = async (token, jwtSecret) => {
  if (!token || !jwtSecret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    const secretKey = await subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const signatureBytes = base64urlDecode(signatureB64);
    const dataBytes = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const isValid = await subtle.verify(
      'HMAC',
      secretKey,
      signatureBytes,
      dataBytes
    );
    if (!isValid) return null;
    const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return typeof payload.sub === 'string' && payload.sub
      ? { userId: payload.sub, email: payload.email, source: 'local-jwt' }
      : null;
  } catch {
    return null;
  }
};

const readBearerToken = (request) => {
  const authorization = request.headers.authorization;
  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith('Bearer ')
  ) {
    return null;
  }
  return authorization.slice('Bearer '.length).trim() || null;
};

const secretsMatch = (left, right) => {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
};

const validateSupabaseToken = async (config, token, fetchImpl) => {
  if (!config.supabaseUrl || !config.supabaseAnonKey || !token) return null;
  try {
    const response = await fetchImpl(`${config.supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: config.supabaseAnonKey.trim(),
      },
    });
    if (!response.ok) return null;
    const user = await response.json();
    return typeof user?.id === 'string' && user.id
      ? { userId: user.id, email: user.email, source: 'supabase-jwt' }
      : null;
  } catch (error) {
    console.error('[validateSupabaseToken] failed:', error);
    throw new ApiError(
      503,
      'auth_provider_unavailable',
      'Authentication provider is temporarily unavailable.'
    );
  }
};

export const extractAuthenticatedUser = (request) => request.auth ?? null;

/**
 * Creates backend authentication middleware supporting internal API secrets,
 * Supabase JWT verification, and development bypass modes.
 *
 * Auth decision chain (first match wins):
 *
 * | Priority | Path            | Trigger condition                                              |
 * |----------|-----------------|----------------------------------------------------------------|
 * | 1        | internal-secret | Bearer token === config.internalApiSecret + X-EngineerOS-User-Id header |
 * | 2        | local-jwt       | config.supabaseJwtSecret is set + Bearer token is valid HMAC-SHA256 JWT with sub claim |
 * | 3        | supabase-jwt    | config.supabaseUrl is set + Bearer token validated via Supabase /auth/v1/user |
 * | 4        | dev-bypass      | config.allowInsecureDevAuth=true AND config.environment !== 'production' |
 * | —        | rejected        | None of the above → 401                                       |
 *
 * @param {Object} config - Auth configuration
 * @param {string} [config.internalApiSecret] - Internal API secret for server-to-server auth
 * @param {string} [config.supabaseJwtSecret] - Supabase JWT secret for local token verification
 * @param {Object} [config.supabaseUrl] - Supabase URL for remote token validation
 * @param {Object} [config.supabaseAnonKey] - Supabase anon key for remote validation
 * @param {boolean} [config.allowInsecureDevAuth] - Allow dev bypass (non-production only)
 * @param {string} [config.environment] - Runtime environment ('development'|'test'|'staging'|'production')
 * @param {Function} [fetchImpl=fetch] - Fetch implementation for testing
 * @returns {{ requireBackendAuth, optionalBackendAuth }} Express middleware functions
 */
export const createBackendAuth = (config, fetchImpl = fetch) => {
  const authenticate = async (request) => {
    const token = readBearerToken(request);
    if (secretsMatch(token, config.internalApiSecret)) {

      const userId = request.headers['x-engineeros-user-id'];
      if (typeof userId !== 'string' || !userId.trim()) {
        throw new ApiError(
          400,
          'missing_authenticated_user',
          'X-EngineerOS-User-Id is required for internal authentication.'
        );
      }
      return {
        userId: userId.trim(),
        email:
          typeof request.headers['x-engineeros-user-email'] === 'string'
            ? request.headers['x-engineeros-user-email']
            : undefined,
        source: 'internal-secret',
      };
    }

    if (config.supabaseJwtSecret && token) {
      const localUser = await verifyJwtLocally(token, config.supabaseJwtSecret);
      if (localUser) return localUser;
    }

    const supabaseUser = await validateSupabaseToken(config, token, fetchImpl);
    if (supabaseUser) return supabaseUser;

    if (config.allowInsecureDevAuth && config.environment !== 'production') {
      const requestedUser =
        request.body?.userId ??
        request.query?.userId ??
        request.headers['x-engineeros-user-id'];
      return {
        userId:
          typeof requestedUser === 'string' && requestedUser.trim()
            ? requestedUser.trim()
            : 'engineeros-dev-user',
        email:
          typeof request.body?.email === 'string'
            ? request.body.email
            : undefined,
        source: 'dev-bypass',
      };
    }

    throw new ApiError(
      401,
      'authentication_required',
      'A valid backend authorization token is required.'
    );
  };

  const requireBackendAuth = async (request, _response, next) => {
    try {
      request.auth = await authenticate(request);
      next();
    } catch (error) {
      next(error);
    }
  };

  const optionalBackendAuth = async (request, _response, next) => {
    try {
      request.auth = await authenticate(request);
    } catch {
      request.auth = null;
    }
    next();
  };

  return { requireBackendAuth, optionalBackendAuth };
};
