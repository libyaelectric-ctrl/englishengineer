// Backend TypeScript Interface Definitions
// These types prepare the backend for full TypeScript migration

// --- Environment & Configuration ---

export type RuntimeEnvironment = 'development' | 'test' | 'staging' | 'production';

export type AiProvider = 'mock' | 'openai' | 'anthropic' | 'gemini';

export type BillingRepositoryMode = 'memory' | 'supabase';

export type RateLimitStoreMode = 'memory' | 'upstash';

export interface AiConfig {
  provider: AiProvider;
  model: string;
  timeoutMs: number;
  configured: boolean;
  apiKey: string | null;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export interface AuthConfig {
  internalApiSecret: string | null;
  allowInsecureDevAuth: boolean;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseJwtSecret: string | null;
}

export interface StripeConfig {
  configured: boolean;
  secretKey: string | null;
  webhookSecret: string | null;
  priceProMonthly: string | null;
  priceProjectMonthly: string | null;
  priceMaxMonthly: string | null;
  priceExecMonthly: string | null;
  pricePrivateMonthly: string | null;
  priceTeamMonthly: string | null;
  environment: RuntimeEnvironment;
  allowMemoryRepository: boolean;
  eventCacheTtlMs: number;
  eventCacheMax: number;
  repositoryMode: BillingRepositoryMode;
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
}

export interface VocabularyConfig {
  timeoutMs: number;
  libreTranslateUrl: string | null;
  libreTranslateApiKey: string | null;
  myMemoryEnabled: boolean;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export interface WorkspaceConfig {
  configured: boolean;
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  storeMode: RateLimitStoreMode;
  allowInMemoryInProduction: boolean;
  upstashUrl: string | null;
  upstashToken: string | null;
  storeTimeoutMs: number;
}

export interface BackendConfig {
  port: number;
  appOrigin: string;
  environment: RuntimeEnvironment;
  version: string;
  ai: AiConfig;
  auth: AuthConfig;
  stripe: StripeConfig;
  supabase: { configured: boolean };
  vocabulary: VocabularyConfig;
  workspace: WorkspaceConfig;
  rateLimit: RateLimitConfig;
}

// --- Authentication ---

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  source: 'internal-secret' | 'supabase-jwt' | 'local-jwt' | 'dev-bypass';
}

// --- API Errors ---

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }> | unknown;
  };
}

export interface ApiResponse<T> {
  ok: true;
  data: T;
}

// --- AI ---

export type AiOperation =
  | 'analyzeProgress'
  | 'evaluateEngineeringEnglish'
  | 'analyzeText'
  | 'generatePractice';

export interface AiRequestBody {
  prompt: string;
  operation?: AiOperation;
  modeId?: string;
  metadata?: { requestId?: string };
}

export interface AiResult {
  contractVersion: string;
  requestId: string;
  operation: AiOperation;
  text: string;
  provider: string;
  mode: 'mock' | 'real';
  mockMode: boolean;
  durationMs: number;
}

// --- Vocabulary ---

export interface VocabularyLookupQuery {
  word: string;
  targetLang: string;
}

export interface VocabularyLookupResult {
  word: string;
  phonetic: string | null;
  definitions: string[];
  translation: string | null;
  source: string;
  translationSource: string | null;
  cached: boolean;
}

// --- Workspace ---

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  memory: Record<string, unknown>;
  documents: WorkspaceDocument[];
  created_at: string;
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  content: string;
  uploaded_at: string;
}

export interface WorkspaceCreateBody {
  name?: string;
  planId?: string;
}

export interface WorkspaceMemoryBody {
  key: string;
  value: unknown;
}

export interface WorkspaceDocumentBody {
  docName: string;
  docContent?: string;
}

// --- Billing & Subscriptions ---

export type PlanId = 'free' | 'lite' | 'pro' | 'project' | 'max' | 'exec' | 'private' | 'team';

export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'incomplete'
  | 'trialing'
  | 'unpaid';

export interface SubscriptionSnapshot {
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: string;
  source: 'backend' | 'repository';
}

export interface PlanMetadata {
  unitAmount: number;
  nickname: string;
  productName: string;
}

// --- Rate Limiting ---

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

// --- Health ---

export interface HealthResponse {
  ok: true;
  version: string;
  environment: RuntimeEnvironment;
  aiConfigured: boolean;
  stripeConfigured: boolean;
  supabaseConfigured: boolean;
  mockMode: boolean;
}

// --- AI Ledger ---

export interface AiLedgerEntry {
  userId: string;
  planId: string;
  modeId: string;
  provider: string;
  operation: string;
  durationMs: number;
  resultSummary: string;
  timestamp: string;
}
