import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { checkCostLimits, createAIService } from './ai.js';
import { ApiError } from './errors.js';
import { aggregateByPromptCategory, averageScore } from './utils/stats.js';
import { CircuitBreaker } from './utils/circuit-breaker.js';
import { WritingSubmitBodySchema, validateBody } from './validation.js';
type AiService = ReturnType<typeof createAIService>;
interface WritingPrompt { id: string; title: string; category: string; level: string; prompt: string; wordLimit: number; }
interface WritingSubmission { id: string; promptId: string; text: string; score: number; grammarScore: number; vocabularyScore: number; coherenceScore: number; structureScore: number; feedback: Record<string, string>; status: 'graded'; submittedAt: string; }
const WRITING_PROMPTS: WritingPrompt[] = [
  { id:'wp-001', title:'Advantages of CAD Software', category:'technical', level:'B1', prompt:'Describe three advantages of using computer-aided design (CAD) software in engineering. Provide specific examples for each advantage.', wordLimit:250 },
  { id:'wp-002', title:'Workplace Safety Report', category:'professional', level:'B2', prompt:'Write a workplace safety incident report for a hypothetical chemical spill in a laboratory. Include the cause, the response, and recommended preventive measures.', wordLimit:300 },
  { id:'wp-003', title:'Sustainable Engineering Solutions', category:'technical', level:'C1', prompt:'Discuss how modern engineers are incorporating sustainability principles into infrastructure design. Reference at least two real-world examples.', wordLimit:350 },
  { id:'wp-004', title:'Project Proposal Email', category:'professional', level:'B1', prompt:'Write a professional email proposing a new automation project to your department manager. Include the problem statement, proposed solution, estimated budget, and timeline.', wordLimit:200 },
  { id:'wp-005', title:'Technical Specification Document', category:'technical', level:'C1', prompt:'Write a brief technical specification for a solar-powered water pump intended for rural irrigation. Include performance requirements, environmental constraints, and material considerations.', wordLimit:400 },
  { id:'wp-006', title:'Failure Analysis Essay', category:'technical', level:'B2', prompt:'Describe the common causes of structural failure in buildings and explain how proper material selection and quality control can prevent such failures.', wordLimit:300 },
  { id:'wp-007', title:'Meeting Minutes Summary', category:'professional', level:'B1', prompt:'Write meeting minutes from a project review meeting. Include attendees, agenda items discussed, decisions made, and action items with responsible persons.', wordLimit:250 },
  { id:'wp-008', title:'Process Improvement Proposal', category:'professional', level:'B2', prompt:'Propose a process improvement for a manufacturing workflow using Lean or Six Sigma principles. Describe the current state, the proposed changes, and expected outcomes.', wordLimit:300 },
];
const submissionStore = new Map<string, WritingSubmission[]>();
const writingCircuitBreaker = new CircuitBreaker('WritingAI', 5, 30000);
const getUserSubmissions = (userId: string): WritingSubmission[] => { if (!submissionStore.has(userId)) submissionStore.set(userId, []); return submissionStore.get(userId)!; };
const requiredScore = (value: unknown, name: string): number => { const n = typeof value === 'number' ? value : Number(value); if (!Number.isFinite(n)) throw new ApiError(502, 'invalid_writing_assessment', `AI assessment omitted ${name}.`); return Math.max(0, Math.min(100, Math.round(n))); };
const mapAiScores = (structured: Record<string, unknown>): Omit<WritingSubmission,'id'|'promptId'|'text'|'submittedAt'|'status'> => {
  if (!structured.overallScore || typeof structured.overallScore !== 'object' || Array.isArray(structured.overallScore)) throw new ApiError(502, 'invalid_writing_assessment', 'AI assessment returned no score object.');
  const raw = structured.overallScore as Record<string, unknown>;
  const grammarScore = requiredScore(raw.grammar, 'grammar');
  const vocabularyScore = requiredScore(raw.vocabulary, 'vocabulary');
  const coherenceScore = requiredScore(raw.clarity, 'clarity');
  const tone = requiredScore(raw.tone, 'tone');
  const score = requiredScore(raw.overall, 'overall');
  const weaknesses = Array.isArray(structured.weaknesses) ? structured.weaknesses.filter((v): v is string => typeof v === 'string') : [];
  const feedback: Record<string,string> = {};
  if (weaknesses.length) feedback.grammar = weaknesses.slice(0,2).join(' ');
  if (score >= 85) feedback.overall = 'Excellent work. Keep practicing at this level.';
  return { score, grammarScore, vocabularyScore, coherenceScore, structureScore: Math.round((tone + score) / 2), feedback };
};
export const registerWritingRoutes = (app: Express, requireBackendAuth: RequestHandler, writingLimiter: RequestHandler, aiService: AiService): void => {
  app.get('/api/writing/prompts', requireBackendAuth, async (req: Request, res: Response, next: NextFunction) => { try { if (!req.auth?.userId) throw new ApiError(401,'authentication_required','Auth required'); const limit=Math.min(Number(req.query.limit)||10,100); const offset=Math.max(Number(req.query.offset)||0,0); res.json({items:WRITING_PROMPTS.slice(offset,offset+limit),total:WRITING_PROMPTS.length,limit,offset}); } catch(e){next(e);} });
  app.post('/api/writing/submit', requireBackendAuth, writingLimiter, validateBody(WritingSubmitBodySchema), async (req: Request, res: Response, next: NextFunction) => { try {
    const userId=req.auth?.userId; if(!userId) throw new ApiError(401,'authentication_required','Auth required'); checkCostLimits(userId);
    const {promptId,content}=req.validatedBody as {promptId?:string;content?:string}; const text=content??''; const prompt=WRITING_PROMPTS.find(p=>p.id===promptId);
    let evaluation: ReturnType<typeof mapAiScores>;
    try { const result=await writingCircuitBreaker.execute(()=>aiService.complete('evaluateEngineeringEnglish',{prompt:`Evaluate this engineering student's written response.\n${prompt?`Task: ${prompt.prompt}\n`:''}Submission:\n${text}`,context:{}})); if(result.mockMode) throw new ApiError(503,'writing_assessment_unavailable','Writing assessment requires a configured AI provider.'); if(!result.structuredResult) throw new ApiError(502,'invalid_writing_assessment','AI provider returned no structured assessment.'); evaluation=mapAiScores(result.structuredResult); } catch(e){ if(e instanceof ApiError) throw e; throw new ApiError(503,'writing_assessment_unavailable','Writing assessment is temporarily unavailable.'); }
    const submission:WritingSubmission={id:randomUUID(),promptId:promptId??'unknown',text,...evaluation,status:'graded',submittedAt:new Date().toISOString()}; getUserSubmissions(userId).push(submission); res.json({success:true,id:submission.id,...evaluation,status:submission.status,submittedAt:submission.submittedAt});
  } catch(e){next(e);} });
  app.get('/api/writing/stats', requireBackendAuth, async (req:Request,res:Response,next:NextFunction)=>{try{const userId=req.auth?.userId;if(!userId)throw new ApiError(401,'authentication_required','Auth required');const s=getUserSubmissions(userId);res.json({totalSubmissions:s.length,averageScore:averageScore(s.map(x=>x.score)),byCategory:aggregateByPromptCategory(s as unknown as Array<{promptId:string;[key:string]:unknown}>,WRITING_PROMPTS,'score')});}catch(e){next(e);}});
  app.get('/api/writing/:id', requireBackendAuth, async(req:Request,res:Response,next:NextFunction)=>{try{const userId=req.auth?.userId;if(!userId)throw new ApiError(401,'authentication_required','Auth required');res.json(getUserSubmissions(userId).find(x=>x.id===req.params.id)??{notFound:true});}catch(e){next(e);}});
};
