const MAX_HISTORY_LENGTH = 20;
const MAX_CONTEXT_TOKENS = 4000;

interface MessageMetadata {
  [key: string]: unknown;
}

interface MemoryMessage {
  role: string;
  content: string;
  timestamp: string;
  tokens: number;
  [key: string]: unknown;
}

interface MemoryMetadata {
  startedAt: string;
  lastActivity: string;
  messageCount: number;
}

interface ContextResult {
  messages: MemoryMessage[];
  totalTokens: number;
  metadata: MemoryMetadata;
}

interface SummaryResult {
  userId: string;
  sessionId: string;
  messageCount: number;
  startedAt: string;
  lastActivity: string;
  estimatedTokens: number;
}

export class ConversationMemory {
  userId: string;
  sessionId: string;
  history: MemoryMessage[];
  metadata: MemoryMetadata;

  constructor(userId: string, sessionId: string) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.history = [];
    this.metadata = {
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
    };
  }

  addMessage(
    role: string,
    content: string,
    metadata: MessageMetadata = {}
  ): MemoryMessage {
    const message: MemoryMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      tokens: this.estimateTokens(content),
      ...metadata,
    };

    this.history.push(message);
    this.metadata.lastActivity = message.timestamp;
    this.metadata.messageCount++;

    if (this.history.length > MAX_HISTORY_LENGTH) {
      this.history = this.history.slice(-MAX_HISTORY_LENGTH);
    }

    return message;
  }

  getContext(maxTokens: number = MAX_CONTEXT_TOKENS): ContextResult {
    let totalTokens = 0;
    const context: MemoryMessage[] = [];

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

  getSummary(): SummaryResult {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      messageCount: this.metadata.messageCount,
      startedAt: this.metadata.startedAt,
      lastActivity: this.metadata.lastActivity,
      estimatedTokens: this.history.reduce((sum, m) => sum + m.tokens, 0),
    };
  }

  clear(): void {
    this.history = [];
    this.metadata.messageCount = 0;
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

const conversations = new Map<string, ConversationMemory>();

export const getConversation = (
  userId: string,
  sessionId: string
): ConversationMemory => {
  const key = `${userId}:${sessionId}`;
  if (!conversations.has(key)) {
    conversations.set(key, new ConversationMemory(userId, sessionId));
  }
  return conversations.get(key)!;
};

export const deleteConversation = (userId: string, sessionId: string): void => {
  const key = `${userId}:${sessionId}`;
  conversations.delete(key);
};

export const getUserConversations = (userId: string): SummaryResult[] => {
  const userConversations: SummaryResult[] = [];
  for (const [key, memory] of conversations.entries()) {
    if (key.startsWith(`${userId}:`)) {
      userConversations.push(memory.getSummary());
    }
  }
  return userConversations;
};
