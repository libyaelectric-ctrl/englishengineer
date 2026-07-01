import { timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.js';

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
        apikey: config.supabaseAnonKey,
      },
    });
    if (!response.ok) return null;
    const user = await response.json();
    return typeof user?.id === 'string' && user.id
      ? { userId: user.id, email: user.email, source: 'supabase-jwt' }
      : null;
  } catch {
    throw new ApiError(
      503,
      'auth_provider_unavailable',
      'Authentication provider is temporarily unavailable.'
    );
  }
};

export const extractAuthenticatedUser = (request) => request.auth ?? null;

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

    const supabaseUser = await validateSupabaseToken(config, token, fetchImpl);
    if (supabaseUser) return supabaseUser;

    if (config.allowInsecureDevAuth) {
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
