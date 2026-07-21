import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AIRequest, MockExample } from '../ai.types';

const mockExamples: MockExample[] = [
  { input: 'hello', output: 'AI REFINEMENT:\nHello world' },
];

const mockContext = {
  userName: 'Test User',
  role: 'Engineer',
  discipline: 'Civil',
  targetLevel: 'B2',
  xp: 100,
  level: 3,
  elo: 1100,
  streak: 5,
  averageScore: 75,
  completedMissions: 10,
  totalMissions: 20,
  weakSkills: ['Writing'],
  strongSkills: ['Vocabulary'],
  recentActivities: [],
  weakVocabulary: ['submittal'],
  wordsLearned: 50,
  vocabularyRetention: 0.7,
  recommendedFocus: 'Writing',
};

const mockRequest: AIRequest = {
  operation: 'rewriteText',
  modeId: 'writing_reviewer',
  modeName: 'Writing Reviewer',
  prompt: 'Please review this sentence.',
  context: mockContext,
};

const mockBackendResponse = {
  text: 'Backend response',
  providerStatus: {
    mode: 'backend' as const,
    state: 'backend-configured' as const,
    label: 'Connected',
    detail: '',
    isConnected: true,
  },
  metadata: {
    contractVersion: '2026-06-26.v1' as const,
    requestId: 'req-1',
    operation: 'rewriteText' as const,
    durationMs: 100,
    success: true,
    retryCount: 0,
  },
};

describe('AIService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('mock provider mode', () => {
    beforeEach(() => {
      vi.doMock('../ai.config', () => ({
        AI_BACKEND_PROXY_CONFIG: {
          providerMode: 'mock',
          proxyUrl: null,
          isBackendConfigured: false,
        },
      }));
    });

    it('returns mock response when provider is mock', async () => {
      const { AIService } = await import('../ai.service');
      const result = await AIService.run(
        mockExamples,
        'rewriteText',
        mockRequest
      );

      expect(result.text).toBeTruthy();
      expect(result.providerStatus.mode).toBe('mock');
      expect(result.metadata?.success).toBe(true);
    });

    it('getStatus returns mock status when no backend configured', async () => {
      const { AIService } = await import('../ai.service');
      const status = AIService.getStatus(mockExamples);
      expect(status.mode).toBe('mock');
      expect(status.isConnected).toBe(false);
    });

    it('complete delegates to run with correct operation', async () => {
      const { AIService } = await import('../ai.service');
      const result = await AIService.complete(mockExamples, mockRequest);
      expect(result.text).toBeTruthy();
      expect(result.metadata?.operation).toBe('rewriteText');
    });

    it('complete defaults to rewriteText when no operation provided', async () => {
      const { AIService } = await import('../ai.service');
      const result = await AIService.complete(mockExamples, {
        modeId: 'test',
        modeName: 'Test',
        prompt: 'Hello',
      });
      expect(result.metadata?.operation).toBe('rewriteText');
    });
  });

  describe('backend provider mode', () => {
    beforeEach(() => {
      vi.doMock('../ai.config', () => ({
        AI_BACKEND_PROXY_CONFIG: {
          providerMode: 'backend',
          proxyUrl: 'https://api.example.com',
          isBackendConfigured: true,
        },
      }));

      vi.doMock('../backend-proxy.provider', () => ({
        createBackendProxyProvider: vi.fn(() => ({
          getStatus: vi.fn(() => mockBackendResponse.providerStatus),
          rewriteText: vi.fn().mockResolvedValue(mockBackendResponse),
          analyzeText: vi.fn().mockResolvedValue(mockBackendResponse),
          generatePractice: vi.fn().mockResolvedValue(mockBackendResponse),
          evaluateEngineeringEnglish: vi.fn().mockResolvedValue(mockBackendResponse),
          generateStudyPlan: vi.fn().mockResolvedValue(mockBackendResponse),
          analyzeProgress: vi.fn().mockResolvedValue(mockBackendResponse),
        })),
      }));
    });

    it('uses backend proxy when configured', async () => {
      const { AIService } = await import('../ai.service');
      const result = await AIService.run(
        mockExamples,
        'rewriteText',
        mockRequest
      );

      expect(result.text).toBe('Backend response');
      expect(result.metadata?.success).toBe(true);
    });

    it('getStatus returns backend status when configured', async () => {
      const { AIService } = await import('../ai.service');
      const status = AIService.getStatus(mockExamples);
      expect(status.mode).toBe('backend');
      expect(status.isConnected).toBe(true);
    });
  });

  describe('fallback behavior', () => {
    it('falls back to mock when backend throws', async () => {
      vi.doMock('../ai.config', () => ({
        AI_BACKEND_PROXY_CONFIG: {
          providerMode: 'backend',
          proxyUrl: 'https://api.example.com',
          isBackendConfigured: true,
        },
      }));

      vi.doMock('../backend-proxy.provider', () => ({
        createBackendProxyProvider: vi.fn(() => ({
          getStatus: vi.fn(),
          rewriteText: vi.fn().mockRejectedValue(new Error('Network error')),
          analyzeText: vi.fn(),
          generatePractice: vi.fn(),
          evaluateEngineeringEnglish: vi.fn(),
          generateStudyPlan: vi.fn(),
          analyzeProgress: vi.fn(),
        })),
      }));

      const { AIService } = await import('../ai.service');
      const result = await AIService.run(
        mockExamples,
        'rewriteText',
        mockRequest
      );

      expect(result.text).toBeTruthy();
      expect(result.metadata?.errorCode).toBe('backend_proxy_error');
      expect(result.metadata?.success).toBe(false);
      expect(result.providerStatus.state).toBe('backend-error');
    });
  });
});
