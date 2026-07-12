/**
 * AI Memory Management Service
 * Manages conversation history and context
 */

const MAX_HISTORY_LENGTH = 20;
const MAX_CONTEXT_TOKENS = 4000;

export class ConversationMemory {
  constructor(userId, sessionId) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.history = [];
    this.metadata = {
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
    };
  }

  addMessage(role, content, metadata = {}) {
    const message = {
      role,
      content,
      timestamp: new Date().toISOString(),
      tokens: this.estimateTokens(content),
      ...metadata,
    };

    this.history.push(message);
    this.metadata.lastActivity = message.timestamp;
    this.metadata.messageCount++;

    // Trim history if too long
    if (this.history.length > MAX_HISTORY_LENGTH) {
      this.history = this.history.slice(-MAX_HISTORY_LENGTH);
    }

    return message;
  }

  getContext(maxTokens = MAX_CONTEXT_TOKENS) {
    let totalTokens = 0;
    const context = [];

    // Add messages from most recent, respecting token limit
    for (let i = this.history.length - 1; i >= 0; i--) {
      const msg = this.history[i];
      if (totalTokens + msg.tokens > maxTokens) break;
      context.unshift(msg);
      totalTokens += msg.tokens;
    }

    return {
      messages: context,
      totalTokens,
      metadata: this.metadata,
    };
  }

  getSummary() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      messageCount: this.metadata.messageCount,
      startedAt: this.metadata.startedAt,
      lastActivity: this.metadata.lastActivity,
      estimatedTokens: this.history.reduce((sum, m) => sum + m.tokens, 0),
    };
  }

  clear() {
    this.history = [];
    this.metadata.messageCount = 0;
  }

  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

// In-memory store (in production, use Redis or database)
const conversations = new Map();

export const getConversation = (userId, sessionId) => {
  const key = `${userId}:${sessionId}`;
  if (!conversations.has(key)) {
    conversations.set(key, new ConversationMemory(userId, sessionId));
  }
  return conversations.get(key);
};

export const deleteConversation = (userId, sessionId) => {
  const key = `${userId}:${sessionId}`;
  conversations.delete(key);
};

export const getUserConversations = (userId) => {
  const userConversations = [];
  for (const [key, memory] of conversations.entries()) {
    if (key.startsWith(`${userId}:`)) {
      userConversations.push(memory.getSummary());
    }
  }
  return userConversations;
};
