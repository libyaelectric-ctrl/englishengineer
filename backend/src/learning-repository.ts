import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';

export type ProgressModule = 'vocabulary' | 'grammar' | 'reading' | 'listening';
export type ProgressResult = 'correct' | 'incorrect' | null;
export interface ProgressEvent { id: string; userId: string; module: ProgressModule; itemId: string; result: ProgressResult; score: number | null; category: string; metadata: Record<string, unknown>; occurredAt: string; }
export interface WritingSubmissionRecord { id: string; userId: string; promptId: string; content: string; score: number; grammarScore: number; vocabularyScore: number; coherenceScore: number; structureScore: number; feedback: Record<string, string>; status: 'graded'; submittedAt: string; }
export interface SpeakingSubmissionRecord { id: string; userId: string; promptId: string; audioUrl: string; transcript: string; pronunciationScore: number | null; fluencyScore: number | null; grammarScore: number | null; vocabularyScore: number | null; overallScore: number | null; feedback: Record<string, string>; status: 'not_graded' | 'graded'; reason: string | null; submittedAt: string; }
export interface SkillOverview { attempts: number; completed: number; correct: number; incorrect: number; averageScore: number | null; }
export interface LearningOverview { userId: string; totalActivities: number; completedActivities: number; averageScore: number | null; lastActivityAt: string | null; skills: Record<ProgressModule | 'writing' | 'speaking', SkillOverview>; }
export interface LearningDataExport { progressEvents: ProgressEvent[]; writingSubmissions: WritingSubmissionRecord[]; speakingSubmissions: SpeakingSubmissionRecord[]; exportedAt: string; }
export interface LearningRepository {
  readonly mode: 'supabase' | 'memory-test';
  recordProgress(input: Omit<ProgressEvent, 'id' | 'occurredAt'>): Promise<ProgressEvent>;
  listProgress(userId: string, module: ProgressModule): Promise<ProgressEvent[]>;
  createWritingSubmission(input: Omit<WritingSubmissionRecord, 'id' | 'submittedAt'>): Promise<WritingSubmissionRecord>;
  listWritingSubmissions(userId: string): Promise<WritingSubmissionRecord[]>;
  getWritingSubmission(userId: string, id: string): Promise<WritingSubmissionRecord | null>;
  createSpeakingSubmission(input: Omit<SpeakingSubmissionRecord, 'id' | 'submittedAt'>): Promise<SpeakingSubmissionRecord>;
  listSpeakingSubmissions(userId: string): Promise<SpeakingSubmissionRecord[]>;
  getSpeakingSubmission(userId: string, id: string): Promise<SpeakingSubmissionRecord | null>;
  getOverview(userId: string): Promise<LearningOverview>;
  exportUserData(userId: string): Promise<LearningDataExport>;
  deleteUserData(userId: string): Promise<void>;
}

type ProgressRow = Omit<ProgressEvent, 'userId' | 'itemId' | 'occurredAt'> & { user_id: string; item_id: string; occurred_at: string };
type WritingRow = Omit<WritingSubmissionRecord, 'userId' | 'promptId' | 'grammarScore' | 'vocabularyScore' | 'coherenceScore' | 'structureScore' | 'submittedAt'> & { user_id: string; prompt_id: string; grammar_score: number; vocabulary_score: number; coherence_score: number; structure_score: number; submitted_at: string };
type SpeakingRow = Omit<SpeakingSubmissionRecord, 'userId' | 'promptId' | 'audioUrl' | 'pronunciationScore' | 'fluencyScore' | 'grammarScore' | 'vocabularyScore' | 'overallScore' | 'submittedAt'> & { user_id: string; prompt_id: string; audio_url: string | null; pronunciation_score: number | null; fluency_score: number | null; grammar_score: number | null; vocabulary_score: number | null; overall_score: number | null; submitted_at: string };

const mapProgress = (row: ProgressRow): ProgressEvent => ({ id: row.id, userId: row.user_id, module: row.module, itemId: row.item_id, result: row.result, score: row.score, category: row.category, metadata: row.metadata ?? {}, occurredAt: row.occurred_at });
const mapWriting = (row: WritingRow): WritingSubmissionRecord => ({ id: row.id, userId: row.user_id, promptId: row.prompt_id, content: row.content, score: row.score, grammarScore: row.grammar_score, vocabularyScore: row.vocabulary_score, coherenceScore: row.coherence_score, structureScore: row.structure_score, feedback: row.feedback ?? {}, status: row.status, submittedAt: row.submitted_at });
const mapSpeaking = (row: SpeakingRow): SpeakingSubmissionRecord => ({ id: row.id, userId: row.user_id, promptId: row.prompt_id, audioUrl: row.audio_url ?? '', transcript: row.transcript ?? '', pronunciationScore: row.pronunciation_score, fluencyScore: row.fluency_score, grammarScore: row.grammar_score, vocabularyScore: row.vocabulary_score, overallScore: row.overall_score, feedback: row.feedback ?? {}, status: row.status, reason: row.reason, submittedAt: row.submitted_at });
const dbError = () => new ApiError(502, 'learning_repository_error', 'Persistent learning data is temporarily unavailable.');
const summarizeEvents = (events: ProgressEvent[]): SkillOverview => { const scores = events.map((event) => event.score).filter((score): score is number => score !== null); return { attempts: events.length, completed: new Set(events.map((event) => event.itemId)).size, correct: events.filter((event) => event.result === 'correct').length, incorrect: events.filter((event) => event.result === 'incorrect').length, averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null }; };
const summarizeSubmissions = (rows: Array<{ score?: number | null; overallScore?: number | null }>): SkillOverview => { const scores = rows.map((row) => row.overallScore ?? row.score ?? null).filter((score): score is number => score !== null); return { attempts: rows.length, completed: rows.length, correct: 0, incorrect: 0, averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null }; };
const buildOverview = (userId: string, events: Record<ProgressModule, ProgressEvent[]>, writing: WritingSubmissionRecord[], speaking: SpeakingSubmissionRecord[]): LearningOverview => { const skills: LearningOverview['skills'] = { vocabulary: summarizeEvents(events.vocabulary), grammar: summarizeEvents(events.grammar), reading: summarizeEvents(events.reading), listening: summarizeEvents(events.listening), writing: summarizeSubmissions(writing), speaking: summarizeSubmissions(speaking) }; const dates = [...Object.values(events).flat().map((event) => event.occurredAt), ...writing.map((row) => row.submittedAt), ...speaking.map((row) => row.submittedAt)].sort(); const scores = Object.values(skills).map((skill) => skill.averageScore).filter((score): score is number => score !== null); return { userId, totalActivities: Object.values(skills).reduce((sum, skill) => sum + skill.attempts, 0), completedActivities: Object.values(skills).reduce((sum, skill) => sum + skill.completed, 0), averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null, lastActivityAt: dates.at(-1) ?? null, skills }; };

export const createSupabaseLearningRepository = (config: { supabaseUrl: string; supabaseServiceRoleKey: string }, fetchImpl: typeof fetch = fetch): LearningRepository => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) throw new Error('Supabase learning repository requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  const db = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: fetchImpl } });
  const listProgress = async (userId: string, module: ProgressModule): Promise<ProgressEvent[]> => { const { data, error } = await db.from('learning_progress_events').select('*').eq('user_id', userId).eq('module', module).order('occurred_at', { ascending: true }); if (error) throw dbError(); return ((data ?? []) as ProgressRow[]).map(mapProgress); };
  const listWriting = async (userId: string): Promise<WritingSubmissionRecord[]> => { const { data, error } = await db.from('learning_writing_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: true }); if (error) throw dbError(); return ((data ?? []) as WritingRow[]).map(mapWriting); };
  const listSpeaking = async (userId: string): Promise<SpeakingSubmissionRecord[]> => { const { data, error } = await db.from('learning_speaking_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: true }); if (error) throw dbError(); return ((data ?? []) as SpeakingRow[]).map(mapSpeaking); };
  const repository: LearningRepository = {
    mode: 'supabase',
    async recordProgress(input) { const { data, error } = await db.from('learning_progress_events').insert({ user_id: input.userId, module: input.module, item_id: input.itemId, result: input.result, score: input.score, category: input.category, metadata: input.metadata }).select().single(); if (error || !data) throw dbError(); return mapProgress(data as ProgressRow); },
    listProgress,
    async createWritingSubmission(input) { const { data, error } = await db.from('learning_writing_submissions').insert({ user_id: input.userId, prompt_id: input.promptId, content: input.content, score: input.score, grammar_score: input.grammarScore, vocabulary_score: input.vocabularyScore, coherence_score: input.coherenceScore, structure_score: input.structureScore, feedback: input.feedback, status: input.status }).select().single(); if (error || !data) throw dbError(); return mapWriting(data as WritingRow); },
    listWritingSubmissions: listWriting,
    async getWritingSubmission(userId, id) { const { data, error } = await db.from('learning_writing_submissions').select('*').eq('user_id', userId).eq('id', id).maybeSingle(); if (error) throw dbError(); return data ? mapWriting(data as WritingRow) : null; },
    async createSpeakingSubmission(input) { const { data, error } = await db.from('learning_speaking_submissions').insert({ user_id: input.userId, prompt_id: input.promptId, audio_url: input.audioUrl || null, transcript: input.transcript || null, pronunciation_score: input.pronunciationScore, fluency_score: input.fluencyScore, grammar_score: input.grammarScore, vocabulary_score: input.vocabularyScore, overall_score: input.overallScore, feedback: input.feedback, status: input.status, reason: input.reason }).select().single(); if (error || !data) throw dbError(); return mapSpeaking(data as SpeakingRow); },
    listSpeakingSubmissions: listSpeaking,
    async getSpeakingSubmission(userId, id) { const { data, error } = await db.from('learning_speaking_submissions').select('*').eq('user_id', userId).eq('id', id).maybeSingle(); if (error) throw dbError(); return data ? mapSpeaking(data as SpeakingRow) : null; },
    async getOverview(userId) { const [vocabulary, grammar, reading, listening, writing, speaking] = await Promise.all([listProgress(userId, 'vocabulary'), listProgress(userId, 'grammar'), listProgress(userId, 'reading'), listProgress(userId, 'listening'), listWriting(userId), listSpeaking(userId)]); return buildOverview(userId, { vocabulary, grammar, reading, listening }, writing, speaking); },
    async exportUserData(userId) { const [vocabulary, grammar, reading, listening, writingSubmissions, speakingSubmissions] = await Promise.all([listProgress(userId, 'vocabulary'), listProgress(userId, 'grammar'), listProgress(userId, 'reading'), listProgress(userId, 'listening'), listWriting(userId), listSpeaking(userId)]); return { progressEvents: [...vocabulary, ...grammar, ...reading, ...listening], writingSubmissions, speakingSubmissions, exportedAt: new Date().toISOString() }; },
    async deleteUserData(userId) { for (const table of ['learning_progress_events', 'learning_writing_submissions', 'learning_speaking_submissions']) { const { error } = await db.from(table).delete().eq('user_id', userId); if (error) throw dbError(); } },
  };
  return repository;
};

export interface MemoryLearningState { progressEvents: ProgressEvent[]; writingSubmissions: WritingSubmissionRecord[]; speakingSubmissions: SpeakingSubmissionRecord[]; }
export const createMemoryLearningState = (): MemoryLearningState => ({ progressEvents: [], writingSubmissions: [], speakingSubmissions: [] });
export const createMemoryLearningRepository = (state: MemoryLearningState = createMemoryLearningState()): LearningRepository => {
  const now = () => new Date().toISOString();
  const listProgress = async (userId: string, module: ProgressModule) => state.progressEvents.filter((row) => row.userId === userId && row.module === module);
  const listWriting = async (userId: string) => state.writingSubmissions.filter((row) => row.userId === userId);
  const listSpeaking = async (userId: string) => state.speakingSubmissions.filter((row) => row.userId === userId);
  const repository: LearningRepository = {
    mode: 'memory-test',
    async recordProgress(input) { const row = { ...input, id: randomUUID(), occurredAt: now() }; state.progressEvents.push(row); return row; },
    listProgress,
    async createWritingSubmission(input) { const row = { ...input, id: randomUUID(), submittedAt: now() }; state.writingSubmissions.push(row); return row; },
    listWritingSubmissions: listWriting,
    async getWritingSubmission(userId, id) { return state.writingSubmissions.find((row) => row.userId === userId && row.id === id) ?? null; },
    async createSpeakingSubmission(input) { const row = { ...input, id: randomUUID(), submittedAt: now() }; state.speakingSubmissions.push(row); return row; },
    listSpeakingSubmissions: listSpeaking,
    async getSpeakingSubmission(userId, id) { return state.speakingSubmissions.find((row) => row.userId === userId && row.id === id) ?? null; },
    async getOverview(userId) { const [vocabulary, grammar, reading, listening, writing, speaking] = await Promise.all([listProgress(userId, 'vocabulary'), listProgress(userId, 'grammar'), listProgress(userId, 'reading'), listProgress(userId, 'listening'), listWriting(userId), listSpeaking(userId)]); return buildOverview(userId, { vocabulary, grammar, reading, listening }, writing, speaking); },
    async exportUserData(userId) { return { progressEvents: state.progressEvents.filter((row) => row.userId === userId), writingSubmissions: await listWriting(userId), speakingSubmissions: await listSpeaking(userId), exportedAt: now() }; },
    async deleteUserData(userId) { state.progressEvents = state.progressEvents.filter((row) => row.userId !== userId); state.writingSubmissions = state.writingSubmissions.filter((row) => row.userId !== userId); state.speakingSubmissions = state.speakingSubmissions.filter((row) => row.userId !== userId); },
  };
  return repository;
};

let override: LearningRepository | null = null;
let singleton: LearningRepository | null = null;
let testState: MemoryLearningState | null = null;
export const setLearningRepositoryForTests = (repository: LearningRepository | null): void => { if (process.env.NODE_ENV !== 'test') throw new Error('Learning repository overrides are allowed only in tests.'); override = repository; };
export const resetLearningRepositoryForTests = (): void => { override = null; singleton = null; testState = null; };
export const getLearningRepository = (): LearningRepository => {
  if (override) return override;
  if (singleton) return singleton;
  if (process.env.NODE_ENV === 'test') { testState ??= createMemoryLearningState(); return (singleton = createMemoryLearningRepository(testState)); }
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s+/g, '');
  if (supabaseUrl && supabaseServiceRoleKey) return (singleton = createSupabaseLearningRepository({ supabaseUrl, supabaseServiceRoleKey }));
  throw new ApiError(503, 'learning_repository_unavailable', 'Persistent learning storage is not configured.');
};
