import { timingSafeEqual, webcrypto } from 'node:crypto';
import { ApiError } from './errors.js';
import { logger } from './logger.js';
import type {
  AuthConfig,
  AuthenticatedUser,
  RuntimeEnvironment,
} from '../types.js';
import type { Request, Response, NextFunction } from 'express';

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
  exp?: number;
}

const verifyJwtLocally = async (
  token: string,
  jwtSecret: string
): Promise<AuthenticatedUser | null> => {
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
    const signatureBytes = base64urlDecode(signatureB64!);
    const dataBytes = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const isValid = await subtle.verify(
      'HMAC',
      secretKey,
      signatureBytes,
      dataBytes
    );
    if (!isValid) return null;
    const payloadJson = Buffer.from(payloadB64!, 'base64').toString('utf8');
    const payload: JwtPayload = JSON.parse(payloadJson);
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

const readBearerToken = (request: Request): string | null => {
  const authorization = request.headers.authorization;
  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith('Bearer ')
  ) {
    return null;
  }
  return authorization.slice('Bearer '.length).trim() || null;
};

const secretsMatch = (left: string | null | undefined, right: string | null | undefined): boolean => {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
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
          source: 'supabase-jwt',
        }
      : null;
  } catch (error) {
    logger.error('validateSupabaseToken failed', {}, error as Error);
    throw new ApiError(
      503,
      'auth_provider_unavailable',
      'Authentication provider is temporarily unavailable.'
    );
  }
};

export const extractAuthenticatedUser = (
  request: Request
): AuthenticatedUser | null => request.auth ?? null;

export interface BackendAuthConfig extends AuthConfig {
  environment: RuntimeEnvironment;
}

export interface BackendAuth {
  requireBackendAuth: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  optionalBackendAuth: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
}

export const createBackendAuth = (
  config: BackendAuthConfig,
  fetchImpl: typeof fetch = fetch
): BackendAuth => {
  const authenticateInternalSecret = (
    token: string | undefined,
    request: Request
  ): AuthenticatedUser | null => {
    if (!secretsMatch(token, config.internalApiSecret)) return null;
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
  };

  const getRequestedUserId = (request: Request): string | undefined => {
    const raw =
      request.body?.userId ??
      request.query?.userId ??
      request.headers['x-engineeros-user-id'];
    return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
  };

  const authenticateDevBypass = (
    request: Request
  ): AuthenticatedUser | null => {
    if (!config.allowInsecureDevAuth || config.environment === 'production')
      return null;
    const email =
      typeof request.body?.email === 'string' ? request.body.email : undefined;
    return {
      userId: getRequestedUserId(request) ?? 'engineeros-dev-user',
      email,
      source: 'dev-bypass',
    };
  };

  const authenticate = async (request: Request): Promise<AuthenticatedUser> => {
    const token = readBearerToken(request);

    const internalUser = authenticateInternalSecret(token ?? undefined, request);
    if (internalUser) return internalUser;

    if (config.supabaseJwtSecret && token) {
      const localUser = await verifyJwtLocally(token, config.supabaseJwtSecret);
      if (localUser) return localUser;
    }

    const supabaseUser = await validateSupabaseToken(config, token, fetchImpl);
    if (supabaseUser) return supabaseUser;

    const devUser = authenticateDevBypass(request);
    if (devUser) return devUser;

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
      request.auth = null as any;
    }
    next();
  };

  return { requireBackendAuth, optionalBackendAuth };
};
