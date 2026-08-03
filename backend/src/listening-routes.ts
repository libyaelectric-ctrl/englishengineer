import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { ApiError } from './errors.js';
import { ListeningScoreBodySchema, validateBody } from './validation.js';

interface ListeningItem {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  durationSeconds: number;
  source: string;
}

const LISTENING_ITEMS: ListeningItem[] = [
  {
    id: 'lst-001',
    title: 'Safety Briefing: Confined Space Entry',
    category: 'professional',
    level: 'B1',
    description:
      'A safety officer explains the procedures for entering confined spaces in industrial settings.',
    durationSeconds: 180,
    source: 'Safety Training Department',
  },
  {
    id: 'lst-002',
    title: 'Technical Discussion: Bridge Inspection Results',
    category: 'civil',
    level: 'B2',
    description:
      'Engineers review the findings of a structural inspection on a reinforced concrete highway bridge.',
    durationSeconds: 240,
    source: 'Inspection Team Alpha',
  },
  {
    id: 'lst-003',
    title: 'Lecture: Introduction to Machine Learning',
    category: 'electrical',
    level: 'C1',
    description:
      'A professor discusses supervised vs unsupervised learning algorithms and their engineering applications.',
    durationSeconds: 360,
    source: 'Engineering Faculty',
  },
  {
    id: 'lst-004',
    title: 'Equipment Calibration Discussion',
    category: 'mechanical',
    level: 'B1',
    description:
      'A technician explains the calibration process for pressure transmitters in a process control environment.',
    durationSeconds: 150,
    source: 'Instrumentation Lab',
  },
  {
    id: 'lst-005',
    title: 'Environmental Compliance Meeting',
    category: 'chemical',
    level: 'B2',
    description:
      'A project manager outlines new environmental regulations affecting chemical processing plants.',
    durationSeconds: 300,
    source: 'Compliance Division',
  },
  {
    id: 'lst-006',
    title: 'Construction Site Communication',
    category: 'civil',
    level: 'A2',
    description:
      'A foreman gives instructions to the work crew regarding concrete pouring schedules and safety measures.',
    durationSeconds: 120,
    source: 'Site Operations',
  },
  {
    id: 'lst-007',
    title: 'Renewable Energy Webinar',
    category: 'electrical',
    level: 'B2',
    description:
      'An expert discusses the current state of offshore wind turbine technology and maintenance challenges.',
    durationSeconds: 420,
    source: 'Energy Conference 2025',
  },
  {
    id: 'lst-008',
    title: 'Quality Assurance Audit Discussion',
    category: 'professional',
    level: 'B1',
    description:
      'An auditor walks through ISO 9001 non-conformance findings and corrective action requirements.',
    durationSeconds: 270,
    source: 'QA Department',
  },
  {
    id: 'lst-009',
    title: 'Materials Testing Lab Report',
    category: 'mechanical',
    level: 'C1',
    description:
      'A research scientist explains fatigue testing results for a new titanium alloy used in aerospace components.',
    durationSeconds: 300,
    source: 'Materials Lab',
  },
  {
    id: 'lst-010',
    title: 'Water Treatment Plant Operations',
    category: 'chemical',
    level: 'B1',
    description:
      'An operator describes the daily monitoring routine for a municipal water treatment facility.',
    durationSeconds: 210,
    source: 'Utility Operations',
  },
];

// Per-user progress store: userId -> Map<itemId, {score, category}>
const progressStore = new Map<string, Map<string, { score: number; category: string }>>();

function getUserProgress(userId: string): Map<string, { score: number; category: string }> {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, new Map());
  }
  return progressStore.get(userId)!;
}

export const registerListeningRoutes = (app: Express, requireBackendAuth: RequestHandler): void => {
  app.get(
    '/api/listening/feed',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const limit = Number(request.query.limit) || 10;
        const offset = Number(request.query.offset) || 0;

        const paginated = LISTENING_ITEMS.slice(offset, offset + limit);

        response.json({ items: paginated, total: LISTENING_ITEMS.length, limit, offset });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/listening/:id/progress',
    requireBackendAuth,
    validateBody(ListeningScoreBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const contentId = request.params.id as string;
        const { score } = request.validatedBody as { score?: number };

        const userProgress = getUserProgress(userId);
        const item = LISTENING_ITEMS.find((i) => i.id === contentId);
        const category = item?.category ?? 'general';
        userProgress.set(contentId, { score: score ?? 0, category });

        response.json({
          success: true,
          contentId,
          score: score ?? 0,
          status: 'completed',
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/listening/stats',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const userProgress = getUserProgress(userId);
        const entries = Array.from(userProgress.values());
        const totalListened = entries.length;
        const averageScore =
          totalListened > 0
            ? Math.round((entries.reduce((sum, e) => sum + e.score, 0) / totalListened) * 10) / 10
            : 0;

        const byCategory: Record<string, { count: number; avgScore: number }> = {};
        const catMap = new Map<string, number[]>();
        for (const e of entries) {
          if (!catMap.has(e.category)) catMap.set(e.category, []);
          catMap.get(e.category)!.push(e.score);
        }
        for (const [cat, scores] of catMap) {
          byCategory[cat] = {
            count: scores.length,
            avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
          };
        }

        response.json({ totalListened, averageScore, byCategory });
      } catch (error) {
        next(error);
      }
    }
  );
};
