import type { SkillName, CefrBand } from '@/features/profile/profile.types';

export interface LearningPathGoal {
  skill: SkillName;
  targetLevel: CefrBand;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface DailyPlan {
  day: number;
  date: string;
  focusSkill: SkillName;
  tasks: PlanTask[];
  estimatedMinutes: number;
  rationale: string;
}

export interface PlanTask {
  id: string;
  skill: SkillName;
  type:
    | 'vocabulary'
    | 'grammar'
    | 'reading'
    | 'writing'
    | 'listening'
    | 'speaking';
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningPathPlan {
  userId: string;
  generatedAt: string;
  goals: LearningPathGoal[];
  dailyPlan: DailyPlan[];
  totalEstimatedMinutes: number;
  skillDistribution: Record<SkillName, number>;
  weakAreasIdentified: string[];
  recommendations: string[];
}

const SKILL_ORDER: SkillName[] = [
  'vocabulary',
  'grammar',
  'reading',
  'writing',
  'listening',
  'speaking',
];

const CEFR_ORDER: CefrBand[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function getLevelIndex(band: CefrBand): number {
  return CEFR_ORDER.indexOf(band);
}

function analyzeSkillGaps(
  skillLevels: Record<SkillName, CefrBand>,
  targetLevel: CefrBand
): LearningPathGoal[] {
  const targetIdx = getLevelIndex(targetLevel);
  const goals: LearningPathGoal[] = [];

  for (const skill of SKILL_ORDER) {
    const currentLevel = skillLevels[skill] || 'A1';
    const currentIdx = getLevelIndex(currentLevel);
    const gap = targetIdx - currentIdx;

    if (gap > 0) {
      goals.push({
        skill,
        targetLevel,
        priority: gap >= 2 ? 'high' : gap >= 1 ? 'medium' : 'low',
        reason: `${skill} is at ${currentLevel}, needs to reach ${targetLevel} (${gap} level${gap > 1 ? 's' : ''} gap)`,
      });
    }
  }

  return goals.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function generateDailyTasks(
  skill: SkillName,
  level: CefrBand,
  dayNumber: number
): PlanTask[] {
  const tasks: PlanTask[] = [];

  // Each day focuses on one primary skill with variety
  const primaryTask: PlanTask = {
    id: `day${dayNumber}-primary`,
    skill,
    type: skill as PlanTask['type'],
    title: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Practice - ${level}`,
    description: `Complete a ${level}-level ${skill} exercise focusing on core concepts`,
    estimatedMinutes: 15,
    difficulty: 'medium',
  };
  tasks.push(primaryTask);

  // Add a complementary vocabulary task
  tasks.push({
    id: `day${dayNumber}-vocab`,
    skill: 'vocabulary',
    type: 'vocabulary',
    title: `Vocabulary Review - ${level}`,
    description: `Review and practice ${level} vocabulary related to ${skill}`,
    estimatedMinutes: 10,
    difficulty: 'easy',
  });

  return tasks;
}

function buildWeeklyPlan(
  goals: LearningPathGoal[],
  startDate: Date
): DailyPlan[] {
  const plan: DailyPlan[] = [];
  const skillsToCover = goals.map((g) => g.skill);

  // Ensure all 6 skills are covered in a week
  const weeklySkills: SkillName[] = [...skillsToCover];
  while (weeklySkills.length < 7) {
    // Fill remaining days with balanced practice
    const underrepresented = SKILL_ORDER.filter(
      (s) => weeklySkills.filter((ws) => ws === s).length < 2
    );
    if (underrepresented.length > 0) {
      weeklySkills.push(underrepresented[0]);
    } else {
      weeklySkills.push(SKILL_ORDER[weeklySkills.length % SKILL_ORDER.length]);
    }
  }

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);

    const skill = weeklySkills[day];
    const goal = goals.find((g) => g.skill === skill);
    const level = goal?.targetLevel || 'A1';
    const tasks = generateDailyTasks(skill, level, day + 1);

    plan.push({
      day: day + 1,
      date: date.toISOString().split('T')[0],
      focusSkill: skill,
      tasks,
      estimatedMinutes: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      rationale: goal?.reason || `Balanced practice for ${skill}`,
    });
  }

  return plan;
}

function calculateSkillDistribution(
  plan: DailyPlan[]
): Record<SkillName, number> {
  const dist: Record<SkillName, number> = {
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    writing: 0,
    listening: 0,
    speaking: 0,
  };

  for (const day of plan) {
    dist[day.focusSkill] += day.estimatedMinutes;
  }

  return dist;
}

export const LearningPathAdvisor = {
  generatePlan(
    userId: string,
    skillLevels: Record<SkillName, CefrBand>,
    targetLevel: CefrBand = 'B2',
    profession?: string
  ): LearningPathPlan {
    const goals = analyzeSkillGaps(skillLevels, targetLevel);
    const startDate = new Date();
    const dailyPlan = buildWeeklyPlan(goals, startDate);

    const totalEstimatedMinutes = dailyPlan.reduce(
      (sum, day) => sum + day.estimatedMinutes,
      0
    );

    const skillDistribution = calculateSkillDistribution(dailyPlan);

    const weakAreas = goals
      .filter((g) => g.priority === 'high')
      .map((g) => g.reason);

    const recommendations: string[] = [];
    if (weakAreas.length > 0) {
      recommendations.push(
        `Focus on high-priority gaps: ${weakAreas.join('; ')}`
      );
    }
    if (profession) {
      recommendations.push(`Tailored for ${profession} context`);
    }
    recommendations.push(`Target level: ${targetLevel}`);
    recommendations.push(
      `${totalEstimatedMinutes} minutes of practice per week`
    );

    return {
      userId,
      generatedAt: new Date().toISOString(),
      goals,
      dailyPlan,
      totalEstimatedMinutes,
      skillDistribution,
      weakAreasIdentified: weakAreas,
      recommendations,
    };
  },

  getWeeklySummary(plan: LearningPathPlan): string {
    const days = plan.dailyPlan.length;
    const skills = Object.entries(plan.skillDistribution)
      .filter(([, min]) => min > 0)
      .map(([skill, min]) => `${skill}: ${min}min`)
      .join(', ');

    return `${days}-day plan | ${plan.totalEstimatedMinutes}min total | ${skills}`;
  },
};
