import { logger } from './logger.js';

interface SessionConfig {
  maxSessionsPerUser: number;
  sessionTimeoutMs: number;
  enableRotation: boolean;
}

interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  ip: string;
  userAgent: string;
}

const activeSessions = new Map<string, UserSession>();
const userSessionCounts = new Map<string, number>();

const defaultConfig: SessionConfig = {
  maxSessionsPerUser: 5,
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  enableRotation: true,
};

/**
 * Session security manager.
 * Handles session limits, rotation, and cleanup.
 */
export class SessionSecurity {
  private config: SessionConfig;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Creates a new session for a user.
   * Enforces max sessions per user limit.
   */
  createSession(
    userId: string,
    ip: string,
    userAgent: string
  ): { allowed: boolean; sessionId?: string; reason?: string } {
    const currentCount = userSessionCounts.get(userId) || 0;

    if (currentCount >= this.config.maxSessionsPerUser) {
      // Remove oldest session
      const oldestSession = this.findOldestSession(userId);
      if (oldestSession) {
        this.destroySession(oldestSession.sessionId);
        logger.w('Session limit reached, oldest session removed', {
          userId,
          sessionId: oldestSession.sessionId,
        });
      }
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const session: UserSession = {
      sessionId,
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ip,
      userAgent,
    };

    activeSessions.set(sessionId, session);
    userSessionCounts.set(userId, (userSessionCounts.get(userId) || 0) + 1);

    return { allowed: true, sessionId };
  }

  /**
   * Validates a session is still active.
   */
  validateSession(sessionId: string): {
    valid: boolean;
    session?: UserSession;
    reason?: string;
  } {
    const session = activeSessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    // Check timeout
    const now = Date.now();
    if (now - session.lastActivity > this.config.sessionTimeoutMs) {
      this.destroySession(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Update last activity
    session.lastActivity = now;

    return { valid: true, session };
  }

  /**
   * Destroys a session.
   */
  destroySession(sessionId: string): void {
    const session = activeSessions.get(sessionId);
    if (session) {
      const count = userSessionCounts.get(session.userId) || 1;
      userSessionCounts.set(session.userId, Math.max(0, count - 1));
      activeSessions.delete(sessionId);
    }
  }

  /**
   * Destroys all sessions for a user.
   */
  destroyAllUserSessions(userId: string): number {
    let destroyed = 0;
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.userId === userId) {
        activeSessions.delete(sessionId);
        destroyed++;
      }
    }
    userSessionCounts.set(userId, 0);
    return destroyed;
  }

  /**
   * Rotates session ID for security.
   */
  rotateSession(oldSessionId: string): {
    success: boolean;
    newSessionId?: string;
  } {
    if (!this.config.enableRotation) {
      return { success: false };
    }

    const validation = this.validateSession(oldSessionId);
    if (!validation.valid || !validation.session) {
      return { success: false };
    }

    const session = validation.session;
    this.destroySession(oldSessionId);

    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newSession: UserSession = {
      ...session,
      sessionId: newSessionId,
      lastActivity: Date.now(),
    };

    activeSessions.set(newSessionId, newSession);
    userSessionCounts.set(
      session.userId,
      (userSessionCounts.get(session.userId) || 0) + 1
    );

    return { success: true, newSessionId };
  }

  /**
   * Gets active session count for a user.
   */
  getUserSessionCount(userId: string): number {
    return userSessionCounts.get(userId) || 0;
  }

  /**
   * Cleans up expired sessions.
   */
  cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of activeSessions.entries()) {
      if (now - session.lastActivity > this.config.sessionTimeoutMs) {
        activeSessions.delete(sessionId);
        const count = userSessionCounts.get(session.userId) || 1;
        userSessionCounts.set(session.userId, Math.max(0, count - 1));
        cleaned++;
      }
    }

    return cleaned;
  }

  private findOldestSession(userId: string): UserSession | null {
    let oldest: UserSession | null = null;
    for (const session of activeSessions.values()) {
      if (session.userId === userId) {
        if (!oldest || session.createdAt < oldest.createdAt) {
          oldest = session;
        }
      }
    }
    return oldest;
  }
}

// Singleton instance
let instance: SessionSecurity | null = null;

export const getSessionSecurity = (
  config?: Partial<SessionConfig>
): SessionSecurity => {
  if (!instance) {
    instance = new SessionSecurity(config);
  }
  return instance;
};
