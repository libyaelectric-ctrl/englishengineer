import type { NextFunction, Request, Response } from 'express';
import { timingSafeEqual, webcrypto } from 'node:crypto';

import type { AuthConfig, AuthenticatedUser, RuntimeEnvironment } from '../types.js';
import { ApiError } from './errors.js';
import { logger } from './logger.js';

const subtle = webcrypto.subtle;

const base64urlDecode = (str: string): Buffer => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64');
};

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
}

interface JwtHeader {
  alg?: string;
  typ?: string;
}

const jwtAudienceMatches = (actual: JwtPayload['aud'], expected: string): boolean =>
  typeof actual === 'string'
    ? actual === expected
    : Array.isArray(actual) && actual.includes(expected);

const hasValidClaims = (
  header: JwtHeader,
  payload: JwtPayload,
  config: AuthConfig,
  now: number
): boolean => {
  if (header.alg !== 'HS256' || header.typ !== 'JWT') return false;
  if (typeof payload.sub !== 'string' || !SAFE_USER_ID_PATTERN.test(payload.sub)) return false;
  if (!Number.isInteger(payload.exp) || !Number.isInteger(payload.iat)) return false;
  if (payload.exp! <= now - 60 || payload.iat! > now + 60 || payload.exp! <= payload.iat!)
    return false;
  if (
    typeof payload.iss !== 'string' ||
    normalizeIssuer(payload.iss) !== normalizeIssuer(config.supabaseJwtIssuer!)
  )
    return false;
  if (!jwtAudienceMatches(payload.aud, config.supabaseJwtAudience!)) return false;
  return true;
};

export const verifyJwtLocally = async (
  token: string,
  config: AuthConfig,
  now = Math.floor(Date.now() / 1000)
): Promise<AuthenticatedUser | null> => {
  const jwtSecret = config.supabaseJwtSecret;
  if (!token || !jwtSecret || !config.supabaseJwtIssuer || !config.supabaseJwtAudience) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    const header = JSON.parse(base64urlDecode(headerB64!).toString('utf8')) as JwtHeader;
    const payload = JSON.parse(base64urlDecode(payloadB64!).toString('utf8')) as JwtPayload;
    if (!hasValidClaims(header, payload, config, now)) return null;

    const secretKey = await subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const isValid = await subtle.verify(
      'HMAC',
      secretKey,
      new Uint8Array(base64urlDecode(signatureB64!)),
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    );
    if (!isValid) return null;
    return {
      userId: payload.sub as string,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
      source: 'local-jwt',
    };
  } catch {
    logger.warn('Failed to verify local JWT');
    return null;
  }
};

const readBearerToken = (request: Request): string | null => {
  const authorization = request.headers.authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.slice('Bearer '.length).trim() || null;
};

const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Google publishes the signing keys for Firebase Auth ID tokens at a fixed,
 * project-independent URL (the issuer only varies per project).
 *
 * IMPORTANT: this must be the v1/jwk path. There is no "v3/jwks" endpoint —
 * that path 404s, which silently broke every Firebase sign-in verification
 * (the fetch failure is caught in authenticate()'s try/catch and the auth
 * chain just falls through to a 401, indistinguishable from "bad token"
 * client-side). See: https://firebase.google.com/docs/auth/admin/verify-id-tokens
 */
const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const firebaseIssuerFor = (projectId: string): string =>
  `https://securetoken.google.com/${projectId}`;

interface FirebaseJwk {
  kid?: string;
  kty?: string;
  n?: string;
  e?: string;
  alg?: string;
  use?: string;
}

interface FirebaseClaims {
  sub?: string;
  aud?: string;
  iss?: string;
  exp?: number;
  iat?: number;
  auth_time?: number;
  email?: string;
  email_verified?: boolean;
  role?: string;
  isSuperUser?: boolean;
  firebase?: { sign_in_provider?: string };
}

let firebaseJwksCache: { url: string; keys: FirebaseJwk[]; fetchedAt: number } | null = null;

const fetchFirebaseJwks = async (fetchImpl: typeof fetch): Promise<FirebaseJwk[]> => {
  if (
    firebaseJwksCache &&
    firebaseJwksCache.url === FIREBASE_JWKS_URL &&
    Date.now() - firebaseJwksCache.fetchedAt < JWKS_CACHE_TTL_MS
  ) {
    return firebaseJwksCache.keys;
  }
  const response = await fetchImpl(FIREBASE_JWKS_URL);
  if (!response.ok) {
    throw new ApiError(503, 'auth_provider_unavailable', 'Firebase JWKS could not be fetched.');
  }
  const document = (await response.json()) as { keys?: FirebaseJwk[] };
  firebaseJwksCache = { url: FIREBASE_JWKS_URL, keys: document.keys ?? [], fetchedAt: Date.now() };
  return firebaseJwksCache.keys;
};

export const resetFirebaseJwksCache = (): void => {
  firebaseJwksCache = null;
};

const base64UrlBytes = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const buffer = Buffer.from(padded, 'base64');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

interface DecodedFirebaseToken {
  header: { kid?: string; alg?: string; typ?: string };
  payload: FirebaseClaims;
  signingInput: string;
  signature: Uint8Array;
}

const decodeFirebaseToken = (token: string): DecodedFirebaseToken | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    return {
      header: JSON.parse(base64urlDecode(headerB64!).toString('utf8')) as {
        kid?: string;
        alg?: string;
        typ?: string;
      },
      payload: JSON.parse(base64urlDecode(payloadB64!).toString('utf8')) as FirebaseClaims,
      signingInput: `${headerB64}.${payloadB64}`,
      signature: base64UrlBytes(signatureB64!),
    };
  } catch {
    logger.warn('Failed to parse Firebase ID token parts');
    return null;
  }
};

const normalizeIssuer = (value: string): string => value.replace(/\/+$/, '');

const hasValidFirebaseClaims = (
  payload: FirebaseClaims,
  projectId: string,
  now: number
): boolean => {
  if (typeof payload.sub !== 'string' || !payload.sub) return false;
  if (typeof payload.aud !== 'string' || payload.aud !== projectId) return false;
  if (
    typeof payload.iss !== 'string' ||
    normalizeIssuer(payload.iss) !== firebaseIssuerFor(projectId)
  ) {
    return false;
  }
  if (!Number.isInteger(payload.exp) || payload.exp! <= now - 60) return false;
  if (!Number.isInteger(payload.iat) || payload.iat! > now + 60) return false;
  if (payload.exp! <= payload.iat!) return false;
  return true;
};

const toAuthenticatedUser = (payload: FirebaseClaims): AuthenticatedUser => ({
  userId: payload.sub as string,
  email: typeof payload.email === 'string' ? payload.email : undefined,
  role: typeof payload.role === 'string' ? payload.role : undefined,
  source: 'firebase-jwt',
});

/**
 * Verifies a Firebase Auth ID token against Google's public JWKS using
 * WebCrypto (RS256). No Firebase Admin SDK is required for verification —
 * the public signing keys are published at a fixed googleapis.com URL.
 * Returns the authenticated user when the token is valid, issued for the
 * configured project, and unexpired; otherwise null so callers can fall
 * through to the next auth provider.
 */
const verifyFirebaseToken = async (
  token: string,
  projectId: string | null,
  fetchImpl: typeof fetch
): Promise<AuthenticatedUser | null> => {
  if (!projectId) return null;
  const decoded = decodeFirebaseToken(token);
  if (!decoded) return null;
  if (decoded.header.alg !== 'RS256' || (decoded.header.typ && decoded.header.typ !== 'JWT'))
    return null;
  if (!hasValidFirebaseClaims(decoded.payload, projectId, Math.floor(Date.now() / 1000))) {
    return null;
  }

  const keys = await fetchFirebaseJwks(fetchImpl);
  const key = keys.find((candidate) => candidate.kid === decoded.header.kid);
  if (!key?.n || !key.e) return null;

  try {
    const cryptoKey = await subtle.importKey(
      'jwk',
      { kty: 'RSA', alg: 'RS256', use: 'sig', n: key.n, e: key.e },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      Buffer.from(decoded.signature),
      new TextEncoder().encode(decoded.signingInput)
    );
    if (!valid) return null;
    return toAuthenticatedUser(decoded.payload);
  } catch {
    logger.warn('Firebase ID token verification failed');
    return null;
  }
};

const SAFE_USER_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

const secretsMatch = (
  left: string | null | undefined,
  right: string | null | undefined
): boolean => {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

const validateSupabaseToken = async (
  config: AuthConfig,
  token: string | null,
  fetchImpl: typeof fetch
): Promise<AuthenticatedUser | null> => {
  if (!config.supabaseUrl || !config.supabaseAnonKey || !token) return null;
  try {
    const response = await fetchImpl(`${config.supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: config.supabaseAnonKey.trim(),
      },
    });
    if (!response.ok) return null;
    const user = (await response.json()) as Record<string, unknown>;
    return typeof user?.id === 'string' && user.id
      ? {
          userId: user.id as string,
          email: user.email as string | undefined,
          role: (user.app_metadata as Record<string, unknown>)?.role as string | undefined,
          source: 'supabase-jwt',
        }
      : null;
  } catch (error) {
    logger.error('validateSupabaseToken failed', {}, error as Error);
    return null;
  }
};

export interface BackendAuthConfig extends AuthConfig {
  environment: RuntimeEnvironment;
}

export interface BackendAuth {
  requireBackendAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  optionalBackendAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export const createBackendAuth = (
  config: BackendAuthConfig,
  fetchImpl: typeof fetch = fetch
): BackendAuth => {
  const authenticateInternalSecret = (token: string | undefined): AuthenticatedUser | null => {
    if (!secretsMatch(token, config.internalApiSecret)) return null;
    if (!config.internalServiceId || !SAFE_USER_ID_PATTERN.test(config.internalServiceId)) {
      throw new ApiError(
        503,
        'internal_service_identity_unavailable',
        'Internal authentication is not bound to a valid service identity.'
      );
    }
    return {
      userId: config.internalServiceId,
      email: config.internalServiceEmail ?? undefined,
      role: config.internalServiceRole ?? 'service',
      source: 'internal-secret',
    };
  };

  const getRequestedUserId = (request: Request): string | undefined => {
    const raw =
      request.body?.userId ?? request.query?.userId ?? request.headers['x-engineeros-user-id'];
    return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
  };

  const authenticateDevBypass = (request: Request): AuthenticatedUser | null => {
    if (config.environment === 'production' || process.env.NODE_ENV === 'production') {
      logger.warn('Dev auth bypass attempted in production — blocked');
      return null;
    }
    if (!config.allowInsecureDevAuth) return null;
    const email = typeof request.body?.email === 'string' ? request.body.email : undefined;
    const bodyRole = typeof request.body?.role === 'string' ? request.body.role : undefined;
    const headerRole =
      typeof request.headers['x-engineeros-user-role'] === 'string'
        ? request.headers['x-engineeros-user-role']
        : undefined;
    return {
      userId: getRequestedUserId(request) ?? 'engineeros-dev-user',
      email,
      role: bodyRole || headerRole || 'user',
      source: 'dev-bypass',
    };
  };

  const tryRemoteAuth = async (token: string): Promise<AuthenticatedUser | null> => {
    if (config.firebaseProjectId) {
      try {
        return await verifyFirebaseToken(token, config.firebaseProjectId, fetchImpl);
      } catch (error) {
        logger.warn('Firebase token verification failed', { error: (error as Error).message });
        return null;
      }
    }
    return validateSupabaseToken(config, token, fetchImpl);
  };

  const authenticate = async (request: Request): Promise<AuthenticatedUser> => {
    const token = readBearerToken(request);

    const internalUser = authenticateInternalSecret(token ?? undefined);
    if (internalUser) return internalUser;

    if (config.supabaseJwtSecret && token) {
      const localUser = await verifyJwtLocally(token, config);
      if (localUser) return localUser;
    }

    if (token) {
      const remoteUser = await tryRemoteAuth(token);
      if (remoteUser) return remoteUser;
    }

    const devUser = authenticateDevBypass(request);
    if (devUser) return devUser;

    logger.warn('Backend auth rejected request', {
      path: request.path,
      hadToken: Boolean(token),
      firebaseConfigured: Boolean(config.firebaseProjectId),
      supabaseJwtConfigured: Boolean(config.supabaseJwtSecret),
      supabaseAuthConfigured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
    });

    throw new ApiError(
      401,
      'authentication_required',
      'A valid backend authorization token is required.'
    );
  };

  const requireBackendAuth = async (
    request: Request,
    _response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      request.auth = await authenticate(request);
      next();
    } catch (error) {
      next(error);
    }
  };

  const optionalBackendAuth = async (
    request: Request,
    _response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      request.auth = await authenticate(request);
    } catch {
      request.auth = undefined;
    }
    next();
  };

  return { requireBackendAuth, optionalBackendAuth };
};
