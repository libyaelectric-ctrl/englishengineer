import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { checkCostLimits, createAIService } from './ai.js';
import { getOrSet } from './cache/redis-cache.service.js';
import { ApiError } from './errors.js';
import { CircuitBreaker } from './utils/circuit-breaker.js';
import { ReadingGenerateBodySchema, ReadingScoreBodySchema, validateBody } from './validation.js';

type AiService = ReturnType<typeof createAIService>;

interface ReadingItem {
  id: string;
  title: string;
  category: string;
  level: string;
  text: string;
  wordCount: number;
  questions?: Array<{ question: string; questionTranslation?: string; answer: string }>;
}

// Load reading passages from JSON file
const loadReadingPassages = (): ReadingItem[] => {
  const passagesPath = path.resolve(
    process.cwd(),
    '..',
    'data',
    'reading-passages',
    'passages.json'
  );
  try {
    const data = readFileSync(passagesPath, 'utf-8');
    const passages = JSON.parse(data) as ReadingItem[];
    return passages;
  } catch {
    // Fallback to hardcoded items if file cannot be read
    return [];
  }
};

// Combine hardcoded items with items from JSON file
const fileBasedItems = loadReadingPassages();

const READING_ITEMS: ReadingItem[] = [
  {
    id: 'eng-001',
    title: 'Thermodynamic Cycles in Power Generation',
    category: 'mechanical',
    level: 'B2',
    text: 'A thermodynamic cycle is a series of processes that return a system to its initial state. In power generation, the Rankine cycle is the most common thermodynamic cycle for steam power plants. The cycle consists of four main stages: compression of the liquid in a pump, heating and vaporization in a boiler, expansion in a turbine to produce work, and condensation back to liquid in a condenser. The efficiency of the Rankine cycle depends on the pressure and temperature limits of the cycle. Superheating the steam increases the average temperature at which heat is added, thereby improving thermal efficiency.',
    wordCount: 105,
  },
  {
    id: 'eng-002',
    title: 'Structural Analysis of Bridge Load Distribution',
    category: 'civil',
    level: 'B2',
    text: 'Bridge structures are designed to transfer loads from the deck to the foundations through a systematic distribution mechanism. In a simply supported beam bridge, the dead load of the structure and the live loads from traffic are carried primarily by bending moments and shear forces. The engineer must consider static loads including the weight of the bridge itself, dynamic loads from moving vehicles, and environmental loads such as wind and seismic activity. Modern computational methods like finite element analysis allow engineers to model complex load distributions with high precision.',
    wordCount: 102,
  },
  {
    id: 'eng-003',
    title: 'Semiconductor Manufacturing Processes',
    category: 'electrical',
    level: 'C1',
    text: 'The fabrication of integrated circuits involves a sequence of over 500 individual process steps, each requiring precise control of temperature, pressure, and chemical composition. Photolithography is the core patterning technique, where ultraviolet light is projected through a mask onto a silicon wafer coated with photoresist. The exposed areas undergo chemical changes that allow selective etching of underlying material layers. As feature sizes shrink below 5 nanometers, extreme ultraviolet lithography operating at 13.5 nanometers wavelength has become essential for advanced node manufacturing.',
    wordCount: 108,
  },
  {
    id: 'eng-004',
    title: 'Chemical Process Safety Management',
    category: 'chemical',
    level: 'B2',
    text: 'Process safety management in chemical engineering involves the systematic identification, evaluation, and mitigation of risks associated with the handling of hazardous chemicals. The base layer on which the hierarchy of controls relies is elimination, followed by substitution, engineering controls, administrative controls, and personal protective equipment. Hazard and operability studies, commonly known as HAZOP, are conducted during the design phase to identify potential deviations from normal operating conditions. These studies use guide words such as more, less, no, reverse, and other to systematically examine each process parameter.',
    wordCount: 106,
  },
  {
    id: 'eng-005',
    title: 'Fluid Mechanics in Hydraulic Systems',
    category: 'mechanical',
    level: 'B1',
    text: "Hydraulic systems transmit power through the controlled flow of pressurized fluid. The fundamental principle governing hydraulic systems is Pascal's law, which states that pressure applied to a confined fluid is transmitted equally in all directions throughout the fluid. A simple hydraulic system consists of a reservoir, pump, control valves, actuators, and connecting lines. The mechanical advantage of a hydraulic system is determined by the ratio of the piston areas in the master and slave cylinders. This allows a small force applied to a small piston to generate a much larger force at a larger piston.",
    wordCount: 104,
  },
  {
    id: 'eng-006',
    title: 'Environmental Impact Assessment',
    category: 'civil',
    level: 'B1',
    text: 'An environmental impact assessment is a systematic process used to evaluate the potential environmental consequences of a proposed engineering project before it begins. The assessment examines impacts on air quality, water resources, soil conditions, biodiversity, noise levels, and socioeconomic factors. Engineers must prepare an environmental impact statement that describes the project, identifies affected resources, and proposes mitigation measures to minimize adverse effects. Public participation is an integral part of the process, allowing stakeholders to provide input on the proposed project and its potential impacts.',
    wordCount: 101,
  },
  {
    id: 'eng-007',
    title: 'Control Systems in Automation',
    category: 'electrical',
    level: 'B2',
    text: 'Industrial automation relies on closed-loop control systems to maintain process variables at desired setpoints. A proportional-integral-derivative controller continuously calculates an error signal as the difference between the measured process variable and the target setpoint. The proportional term provides a response proportional to the current error, the integral term eliminates steady-state error by accumulating past errors, and the derivative term reduces overshoot by predicting future error trends. Tuning these three parameters is critical for achieving stable and responsive control performance.',
    wordCount: 103,
  },
  {
    id: 'eng-008',
    title: 'Renewable Energy Grid Integration',
    category: 'electrical',
    level: 'C1',
    text: 'The integration of renewable energy sources into the electrical grid presents significant technical challenges related to power quality, frequency regulation, and grid stability. Solar photovoltaic and wind generation produce variable output that depends on weather conditions and time of day. Grid operators must balance supply and demand in real time, requiring sophisticated forecasting algorithms and flexible generation capacity. Battery energy storage systems provide a buffer that can absorb excess generation during peak production and release stored energy during periods of high demand or low renewable output.',
    wordCount: 107,
  },
  {
    id: 'eng-009',
    title: 'Materials Science: Composite Structures',
    category: 'mechanical',
    level: 'C1',
    text: 'Composite materials combine two or more constituent materials to achieve properties that neither material can provide alone. Carbon fiber reinforced polymers offer exceptional strength-to-weight ratios that make them ideal for aerospace and automotive applications. The mechanical behavior of a composite depends on the fiber orientation, volume fraction, and the properties of the matrix material. Laminate theory allows engineers to predict the effective stiffness and strength of layered composites by analyzing each ply individually and then combining the results using transformation matrices that account for the orientation of each layer.',
    wordCount: 109,
  },
  {
    id: 'eng-010',
    title: 'Water Treatment and Purification',
    category: 'chemical',
    level: 'B1',
    text: 'Municipal water treatment involves a series of physical and chemical processes designed to remove contaminants and make water safe for human consumption. The treatment process typically begins with coagulation, where chemicals such as aluminum sulfate are added to destabilize suspended particles. The destabilized particles clump together in the flocculation stage and are then removed by sedimentation. Filtration through sand or activated carbon removes remaining particles and dissolved organic compounds. Finally, disinfection with chlorine or ultraviolet light eliminates pathogenic microorganisms before the treated water enters the distribution system.',
    wordCount: 110,
  },
  ...fileBasedItems,
];

// Per-user progress store: userId -> Map<contentId, {score, category}>
const progressStore = new Map<string, Map<string, { score: number; category: string }>>();

const readingCircuitBreaker = new CircuitBreaker('ReadingAI', 5, 30000);

// 24h TTL for AI-generated passages so repeat requests reuse the cache instead
// of burning another AI call.
const READING_GENERATE_TTL_SECONDS = 24 * 60 * 60;

const enforceAiLimits = (userId: string): void => {
  checkCostLimits(userId);
};

// Maps the `reading` block produced by the content-structure.md schema onto
// the existing ReadingItem shape used by the static feed.
function mapGeneratedReading(
  structured: Record<string, unknown>,
  discipline: string,
  level: string
): ReadingItem | null {
  const reading = (structured.reading ?? {}) as Record<string, unknown>;
  const title = typeof reading.title === 'string' ? reading.title : '';
  const passage = typeof reading.passage === 'string' ? reading.passage : '';
  if (!title || !passage) return null;
  const rawQuestions = Array.isArray(reading.questions) ? reading.questions : [];
  const questions = rawQuestions
    .filter((q): q is Record<string, unknown> => typeof q === 'object' && q !== null)
    .map((q) => ({
      question: typeof q.question === 'string' ? q.question : '',
      questionTranslation:
        typeof q.questionTranslation === 'string' ? q.questionTranslation : undefined,
      answer: typeof q.answer === 'string' ? q.answer : '',
    }))
    .filter((q) => q.question && q.answer);
  return {
    id: `ai-${randomUUID()}`,
    title,
    category: discipline,
    level,
    text: passage,
    wordCount: passage.split(/\s+/).filter(Boolean).length,
    questions: questions.length > 0 ? questions : undefined,
  };
}

function getUserProgress(userId: string): Map<string, { score: number; category: string }> {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, new Map());
  }
  return progressStore.get(userId)!;
}

export const registerReadingRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  readingLimiter: RequestHandler,
  aiService: AiService
): void => {
  app.post(
    '/api/reading/generate',
    requireBackendAuth,
    readingLimiter,
    validateBody(ReadingGenerateBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        enforceAiLimits(userId);

        const { discipline, level, targetLanguage } = request.validatedBody as {
          discipline?: string;
          level?: string;
          targetLanguage?: string;
        };

        // Discipline is required to scope the generated passage. When omitted
        // we cannot know the user's field, so the client must provide it.
        const resolvedDiscipline = discipline?.trim() || 'general';
        const resolvedLevel = level?.trim() || 'B2';
        const resolvedTargetLanguage = targetLanguage?.trim() || 'en';

        // Unknown disciplines cannot be matched to a static fallback, so they
        // are rejected instead of silently returning unrelated content.
        if (
          resolvedDiscipline !== 'general' &&
          !READING_ITEMS.some((i) => i.category === resolvedDiscipline)
        ) {
          throw new ApiError(
            400,
            'invalid_discipline',
            `Unsupported engineering discipline: ${resolvedDiscipline}`
          );
        }

        const cacheKey = `reading:ai:${resolvedDiscipline}:${resolvedLevel}:${resolvedTargetLanguage}`;

        const { value: item } = await getOrSet<ReadingItem>(
          cacheKey,
          READING_GENERATE_TTL_SECONDS,
          async () => {
            const prompt = [
              'Generate a complete, personalized engineering English lesson.',
              `Discipline: ${resolvedDiscipline}`,
              `Target language for translations/explanations: ${resolvedTargetLanguage}`,
              `CEFR level: ${resolvedLevel}`,
              'Focus skill: reading',
              'Engineering context: realistic site, project, and office scenarios.',
              'Return ONLY a valid JSON object matching the content structure.',
            ].join('\n');

            const aiResult = await readingCircuitBreaker.execute(() =>
              aiService.complete('generateContent', {
                prompt,
                context: {
                  discipline: resolvedDiscipline,
                  targetLevel: resolvedLevel,
                },
              })
            );

            // AI in mock mode or unparseable result -> fall back to a static
            // reading item filtered by discipline so the user still gets content.
            if (aiResult.mockMode || !aiResult.structuredResult) {
              const fallback = READING_ITEMS.find((i) => i.category === resolvedDiscipline);
              if (fallback) return fallback;
              return READING_ITEMS[0];
            }

            return (
              mapGeneratedReading(aiResult.structuredResult, resolvedDiscipline, resolvedLevel) ??
              READING_ITEMS[0]
            );
          }
        );

        response.json({
          success: true,
          item,
          source: item.id.startsWith('ai-') ? 'ai-generated' : 'static',
          discipline: resolvedDiscipline,
          level: resolvedLevel,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/reading/feed',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const limit = Number(request.query.limit) || 10;
        const offset = Number(request.query.offset) || 0;

        const paginated = READING_ITEMS.slice(offset, offset + limit);

        response.json({
          items: paginated,
          total: READING_ITEMS.length,
          limit,
          offset,
          message: 'Reading feed — 75% current level, 25% next level',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/reading/:id/progress',
    requireBackendAuth,
    validateBody(ReadingScoreBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const contentId = request.params.id as string;
        const { score } = request.validatedBody as { score?: number };

        const userProgress = getUserProgress(userId);
        const item = READING_ITEMS.find((i) => i.id === contentId);
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
    '/api/reading/stats',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const userProgress = getUserProgress(userId);
        const entries = Array.from(userProgress.values());
        const totalRead = entries.length;
        const averageScore =
          totalRead > 0
            ? Math.round((entries.reduce((sum, e) => sum + e.score, 0) / totalRead) * 10) / 10
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

        response.json({ totalRead, averageScore, byCategory });
      } catch (error) {
        next(error);
      }
    }
  );
};
