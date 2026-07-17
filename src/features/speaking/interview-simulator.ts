import { AIService } from '@/features/ai';
import type { MockExample } from '@/features/ai';

export type InterviewType = 'system-design' | 'coding';

export interface InterviewQuestion {
  id: string;
  type: InterviewType;
  question: string;
  timeLimitSeconds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
}

export interface InterviewAnswer {
  questionId: string;
  transcript: string;
  timeSpentSeconds: number;
  recordingSeconds: number;
}

export interface InterviewScore {
  technicalAccuracy: number;
  clarity: number;
  depth: number;
  communication: number;
  overall: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewSession {
  id: string;
  type: InterviewType;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores: InterviewScore[];
  startedAt: string;
  completedAt: string | null;
}

const SYSTEM_DESIGN_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'sd-1',
    type: 'system-design',
    question:
      'Design a real-time notification system for a mobile app with millions of users. Cover the architecture, message delivery, and scaling considerations.',
    timeLimitSeconds: 600,
    difficulty: 'medium',
    topics: ['messaging', 'scalability', 'push notifications'],
  },
  {
    id: 'sd-2',
    type: 'system-design',
    question:
      'Design a URL shortener like bit.ly. Discuss storage, caching, analytics, and how to handle billions of URLs.',
    timeLimitSeconds: 600,
    difficulty: 'medium',
    topics: ['storage', 'caching', 'hashing'],
  },
  {
    id: 'sd-3',
    type: 'system-design',
    question:
      'Design a distributed file storage system similar to Google Drive. Cover sync, conflict resolution, and access control.',
    timeLimitSeconds: 900,
    difficulty: 'hard',
    topics: ['distributed systems', 'CRDT', 'file sync'],
  },
  {
    id: 'sd-4',
    type: 'system-design',
    question:
      'Design a ride-sharing service like Uber. Discuss matching, geospatial indexing, pricing, and surge handling.',
    timeLimitSeconds: 600,
    difficulty: 'hard',
    topics: ['geospatial', 'matching', 'real-time'],
  },
  {
    id: 'sd-5',
    type: 'system-design',
    question:
      'Design a chat application like Slack. Cover message delivery, channels, search, and offline support.',
    timeLimitSeconds: 600,
    difficulty: 'medium',
    topics: ['WebSocket', 'message queues', 'search'],
  },
  {
    id: 'sd-6',
    type: 'system-design',
    question:
      'Design a news feed system like Twitter. Discuss fanout, timeline generation, and handling viral content.',
    timeLimitSeconds: 600,
    difficulty: 'hard',
    topics: ['fanout', 'feed generation', 'caching'],
  },
];

const CODING_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'code-1',
    type: 'coding',
    question:
      'Write a function that finds the longest palindromic substring in a given string. Explain your approach and time complexity.',
    timeLimitSeconds: 1200,
    difficulty: 'medium',
    topics: ['strings', 'dynamic programming', 'algorithms'],
  },
  {
    id: 'code-2',
    type: 'coding',
    question:
      'Implement a LRU Cache with O(1) get and put operations. Discuss the data structures used.',
    timeLimitSeconds: 1200,
    difficulty: 'medium',
    topics: ['data structures', 'hash map', 'linked list'],
  },
  {
    id: 'code-3',
    type: 'coding',
    question:
      'Given a binary tree, return the level order traversal of its nodes values. Explain your approach.',
    timeLimitSeconds: 900,
    difficulty: 'easy',
    topics: ['trees', 'BFS', 'recursion'],
  },
  {
    id: 'code-4',
    type: 'coding',
    question:
      'Design and implement a thread-safe producer-consumer queue. Discuss synchronization mechanisms.',
    timeLimitSeconds: 1200,
    difficulty: 'hard',
    topics: ['concurrency', 'thread safety', 'design patterns'],
  },
  {
    id: 'code-5',
    type: 'coding',
    question:
      'Write a function to detect a cycle in a linked list. Optimize for space complexity.',
    timeLimitSeconds: 900,
    difficulty: 'easy',
    topics: ['linked lists', 'two pointers', 'cycle detection'],
  },
  {
    id: 'code-6',
    type: 'coding',
    question:
      'Implement a function to serialize and deserialize a binary tree. Explain your encoding strategy.',
    timeLimitSeconds: 1200,
    difficulty: 'hard',
    topics: ['trees', 'serialization', 'design'],
  },
];

const getQuestionsByType = (type: InterviewType): InterviewQuestion[] =>
  type === 'system-design' ? SYSTEM_DESIGN_QUESTIONS : CODING_QUESTIONS;

const MOCK_EXAMPLES: MockExample[] = [
  {
    input: 'system design answer about notification system',
    output:
      "AI SCORING:\nTechnical Accuracy: 78/100\nClarity: 82/100\nDepth: 70/100\nCommunication: 85/100\nOverall: 79/100\n\nFeedback: Good understanding of basic notification architecture. Consider mentioning message queues, retry mechanisms, and delivery guarantees.\n\nStrengths: Clear structure, mentioned key components\nImprovements: Add more depth on scalability, discuss trade-offs",
  },
  {
    input: 'coding answer about LRU cache',
    output:
      "AI SCORING:\nTechnical Accuracy: 85/100\nClarity: 80/100\nDepth: 75/100\nCommunication: 78/100\nOverall: 80/100\n\nFeedback: Correct approach using HashMap and Doubly Linked List. Good time complexity analysis.\n\nStrengths: Correct data structure choice, O(1) operations\nImprovements: Discuss edge cases, mention thread safety considerations",
  },
];

const ruleBasedScoring = (answer: InterviewAnswer, question: InterviewQuestion): InterviewScore => {
  const wordCount = answer.transcript.trim().split(/\s+/).filter(Boolean).length;
  const timeRatio = answer.timeSpentSeconds / question.timeLimitSeconds;

  const technicalAccuracy = Math.min(85, 40 + wordCount * 0.8 + (timeRatio < 1 ? 10 : 0));
  const clarity = Math.min(90, 45 + wordCount * 0.6);
  const depth = Math.min(80, 30 + wordCount * 0.7);
  const communication = Math.min(88, 50 + wordCount * 0.5);
  const overall = Math.round(
    technicalAccuracy * 0.35 + clarity * 0.25 + depth * 0.25 + communication * 0.15
  );

  return {
    technicalAccuracy: Math.round(technicalAccuracy),
    clarity: Math.round(clarity),
    depth: Math.round(depth),
    communication: Math.round(communication),
    overall,
    feedback:
      'Rule-based scoring active. Connect AI for more detailed technical feedback.',
    strengths: [
      wordCount >= 50 ? 'Provided detailed response' : 'Clear and concise answer',
      'Addressed the core question',
    ],
    improvements: [
      wordCount < 30 ? 'Consider adding more technical detail' : 'Good depth of response',
      'Discuss trade-offs and alternatives',
    ],
  };
};

export const InterviewSimulatorService = {
  createSession(type: InterviewType): InterviewSession {
    const questions = getQuestionsByType(type).slice(0, 3);
    return {
      id: `interview-${Date.now()}`,
      type,
      currentQuestionIndex: 0,
      questions,
      answers: [],
      scores: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
  },

  getCurrentQuestion(session: InterviewSession): InterviewQuestion | null {
    return session.questions[session.currentQuestionIndex] ?? null;
  },

  async scoreAnswer(
    answer: InterviewAnswer,
    question: InterviewQuestion
  ): Promise<InterviewScore> {
    try {
      const response = await AIService.run(MOCK_EXAMPLES, 'evaluateEngineeringEnglish', {
        modeId: 'roleplay_simulator',
        modeName: 'Interview Simulator',
        prompt: `Score this technical interview answer. Question: "${question.question}" Answer: "${answer.transcript}". Provide scores for technical accuracy, clarity, depth, and communication (0-100 each), plus overall score, feedback, strengths, and improvements.`,
      });

      const text = response.text;
      const scoreMatch = text.match(/Overall:\s*(\d+)/i);
      const overall = scoreMatch ? parseInt(scoreMatch[1], 10) : 75;

      const strengthsMatch = text.match(/Strengths:\s*(.+?)(?=Improvements|$)/is);
      const improvementsMatch = text.match(/Improvements:\s*(.+?)$/is);

      return {
        technicalAccuracy: Math.round(overall * 1.05),
        clarity: Math.round(overall * 1.0),
        depth: Math.round(overall * 0.95),
        communication: Math.round(overall * 1.02),
        overall,
        feedback: text.split('\n').slice(0, 3).join(' '),
        strengths: strengthsMatch
          ? strengthsMatch[1].split(/[,.]/).map((s: string) => s.trim()).filter(Boolean)
          : ['Answered the question'],
        improvements: improvementsMatch
          ? improvementsMatch[1].split(/[,.]/).map((s: string) => s.trim()).filter(Boolean)
          : ['Add more technical depth'],
      };
    } catch {
      return ruleBasedScoring(answer, question);
    }
  },

  getQuestions(type: InterviewType): InterviewQuestion[] {
    return getQuestionsByType(type);
  },

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },
};
