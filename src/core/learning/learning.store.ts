import { create } from 'zustand';
import { storage } from '@/shared/storage';
import { logger } from '@/shared/logger';
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';
import {
  LearningState,
  Mission,
  Achievement,
  StudySession,
  ScoreResult,
  MissionModule,
} from './learning.types';
import { ScoringService } from './scoring.service';
import { AchievementService } from './achievement.service';

const STORAGE_KEY = 'learning_state';

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'reading_idempotence',
    title: 'Read a Consultant Comment Sheet',
    description:
      'Practice identifying requirements, clarifications, and action items in a technical consultant response.',
    module: 'Reading',
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    xpReward: 50,
    coinReward: 15,
    eloReward: 12,
    status: 'active',
    completedAt: null,
  },
  {
    id: 'writing_cache_draft',
    title: 'Polish Site Progress Report',
    description:
      'Analyze and edit a daily site update so it reads like a professional engineering report.',
    module: 'Writing',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    xpReward: 75,
    coinReward: 20,
    eloReward: 18,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_site_meeting',
    title: 'Substation Site Layout Alignment',
    description:
      'Listen to the site engineer and civil supervisor aligning on substation trench coordinates and cable entry conduits.',
    module: 'Listening',
    difficulty: 'Intermediate',
    estimatedMinutes: 12,
    xpReward: 60,
    coinReward: 20,
    eloReward: 12,
    status: 'active',
    completedAt: null,
  },
  {
    id: 'list_consultant_review',
    title: 'Submittal Comment Reconciliation',
    description:
      'Listen to a senior design engineer reviewing structural comment deviations with the lead electrical consultant.',
    module: 'Listening',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    xpReward: 80,
    coinReward: 25,
    eloReward: 16,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_generator_testing',
    title: 'Diesel Generator Transient Load Testing',
    description:
      'Listen to the commissioning lead discussing transient voltage recovery during an emergency generator step-load test.',
    module: 'Listening',
    difficulty: 'Advanced',
    estimatedMinutes: 18,
    xpReward: 90,
    coinReward: 30,
    eloReward: 18,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_fat_meeting',
    title: 'Factory Acceptance Testing Alignment',
    description:
      'Listen to the procurement lead and QA auditor conducting a pre-FAT briefing for control and protection panels.',
    module: 'Listening',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    xpReward: 65,
    coinReward: 20,
    eloReward: 13,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_lv_panel_discussion',
    title: 'Low-Voltage Board Busbar Thermal Anomalies',
    description:
      'Listen to a maintenance supervisor discussing thermal hotspots detected during a periodic thermographic scan of an LV panel.',
    module: 'Listening',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    xpReward: 85,
    coinReward: 25,
    eloReward: 17,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_cable_routing',
    title: 'Galvanized Cable Ladder Containment Routing',
    description:
      'Listen to the site supervisor discussing segregation rules and load capacity constraints for heavy-duty galvanized cable ladders.',
    module: 'Listening',
    difficulty: 'Intermediate',
    estimatedMinutes: 11,
    xpReward: 70,
    coinReward: 22,
    eloReward: 14,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_electrical_inspection',
    title: 'Post-Installation Grounding & Insulation Testing',
    description:
      'Listen to an inspector conducting safety checks on secondary transformer terminals using high-voltage insulation megger tests.',
    module: 'Listening',
    difficulty: 'Advanced',
    estimatedMinutes: 16,
    xpReward: 95,
    coinReward: 30,
    eloReward: 19,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_safety_toolbox',
    title: 'Lockout-Tagout (LOTO) & Arc Flash Briefing',
    description:
      'Listen to the site safety officer conducting a safety toolbox talk on arc-flash boundaries and lockout procedures.',
    module: 'Listening',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    xpReward: 50,
    coinReward: 15,
    eloReward: 10,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_project_progress',
    title: 'Site Delivery Critical Path Progress Meeting',
    description:
      'Listen to the project manager and lead electrical planner debating critical path delays for key switchgear deliveries.',
    module: 'Listening',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    xpReward: 60,
    coinReward: 20,
    eloReward: 12,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'list_mechanical_coordination',
    title: 'HVAC Duct & Electrical Tray Space Coordination',
    description:
      'Listen to a mechanical coordinator and lead electrical engineer resolving site space conflicts between large HVAC ducts and main cable trays.',
    module: 'Listening',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    xpReward: 80,
    coinReward: 25,
    eloReward: 16,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_site_meeting',
    title: 'Site Meeting Alignment Brief',
    description:
      'Summarize site constraints, action owners, and installation blockers for a field coordination meeting.',
    module: 'Speaking',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    xpReward: 70,
    coinReward: 20,
    eloReward: 14,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_toolbox_talk',
    title: 'Daily Toolbox Talk',
    description:
      'Deliver a concise daily safety and work-front briefing for site technicians.',
    module: 'Speaking',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    xpReward: 55,
    coinReward: 15,
    eloReward: 10,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_consultant_discussion',
    title: 'Consultant Comment Discussion',
    description:
      'Respond professionally to a consultant comment about shop drawing deviation and compliance evidence.',
    module: 'Speaking',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    xpReward: 85,
    coinReward: 25,
    eloReward: 18,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_client_presentation',
    title: 'Client Presentation Summary',
    description:
      'Present a high-level technical solution to a non-specialist client without losing engineering precision.',
    module: 'Speaking',
    difficulty: 'Advanced',
    estimatedMinutes: 16,
    xpReward: 90,
    coinReward: 28,
    eloReward: 20,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_progress_meeting',
    title: 'Progress Meeting Update',
    description:
      'Report schedule movement, blockers, and mitigation actions in a weekly progress meeting.',
    module: 'Speaking',
    difficulty: 'Intermediate',
    estimatedMinutes: 11,
    xpReward: 70,
    coinReward: 20,
    eloReward: 14,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_commissioning_meeting',
    title: 'Commissioning Meeting Handover',
    description:
      'Explain test readiness, acceptance criteria, and open commissioning prerequisites.',
    module: 'Speaking',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    xpReward: 88,
    coinReward: 28,
    eloReward: 19,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_fat_meeting',
    title: 'Factory Acceptance Test Brief',
    description:
      'Brief the factory team on acceptance criteria, punch items, and witness test expectations.',
    module: 'Speaking',
    difficulty: 'Advanced',
    estimatedMinutes: 14,
    xpReward: 82,
    coinReward: 25,
    eloReward: 18,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_technical_explanation',
    title: 'Technical Explanation Drill',
    description:
      'Explain a complex engineering tradeoff using clear technical vocabulary and structured cause-effect language.',
    module: 'Speaking',
    difficulty: 'Advanced',
    estimatedMinutes: 16,
    xpReward: 95,
    coinReward: 30,
    eloReward: 22,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_safety_briefing',
    title: 'Safety Briefing Escalation',
    description:
      'Give a clear safety escalation briefing for live electrical diagnostic work.',
    module: 'Speaking',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    xpReward: 68,
    coinReward: 20,
    eloReward: 13,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'speaking_design_coordination',
    title: 'Design Coordination Resolution',
    description:
      'Resolve a design interface clash between mechanical and electrical systems.',
    module: 'Speaking',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    xpReward: 86,
    coinReward: 26,
    eloReward: 18,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'vocabulary_network',
    title: 'Master Site Coordination Vocabulary',
    description:
      'Learn and match project communication terms used in meetings, inspections, and submittals.',
    module: 'Vocabulary',
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    xpReward: 40,
    coinReward: 10,
    eloReward: 10,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'grammar_kernel',
    title: 'Audit Technical Grammar Issues',
    description:
      'Review formal grammar and clarity issues in engineering project communication.',
    module: 'Grammar',
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    xpReward: 120,
    coinReward: 40,
    eloReward: 30,
    status: 'available' as const,
    completedAt: null,
  },
  {
    id: 'elec_site_inspection',
    title: 'Electrical Site Inspection Report',
    description:
      'Analyze physical substation installation checks and safety grounding compliance reports.',
    module: 'Reading',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    xpReward: 60,
    coinReward: 20,
    eloReward: 15,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'lv_panel_issue',
    title: 'LV Panel Issue Report',
    description:
      'Diagnose overheating busbars, harmonics, and thermographic survey deviations in low-voltage distribution boards.',
    module: 'Reading',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    xpReward: 75,
    coinReward: 25,
    eloReward: 18,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'generator_load_test',
    title: 'Generator Load Test Report',
    description:
      'Evaluate transient voltage recovery, frequency stability, and fuel consumption curves of emergency diesel generators.',
    module: 'Reading',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    xpReward: 50,
    coinReward: 15,
    eloReward: 12,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'fire_alarm_comm',
    title: 'Fire Alarm Commissioning Note',
    description:
      'Verify SLC loop addressing, strobe synchronization, and interface relays with HVAC dampers and elevators.',
    module: 'Reading',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    xpReward: 55,
    coinReward: 18,
    eloReward: 13,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'cable_tray_install',
    title: 'Cable Tray Installation Update',
    description:
      'Verify routing, containment separation distances, load structural margins, and bonding of galvanized cable tray ladders.',
    module: 'Reading',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    xpReward: 40,
    coinReward: 10,
    eloReward: 10,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'consultant_comment_response',
    title: 'Consultant Comment Response',
    description:
      'Structure professional technical justifications and contract specification rebuttals.',
    module: 'Reading',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    xpReward: 65,
    coinReward: 20,
    eloReward: 14,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'shop_drawing_rev',
    title: 'Shop Drawing Revision Note',
    description:
      'Interpret drawing modifications, bill of materials adjustments, and architectural revisions.',
    module: 'Reading',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    xpReward: 50,
    coinReward: 15,
    eloReward: 12,
    status: 'available',
    completedAt: null,
  },
  {
    id: 'mech_elec_coordination',
    title: 'Mechanical-Electrical Coordination Issue',
    description:
      'Solve complex geometric space clashes, thermal load requirements, and power feed capacity overrides.',
    module: 'Reading',
    difficulty: 'Advanced',
    estimatedMinutes: 18,
    xpReward: 80,
    coinReward: 30,
    eloReward: 20,
    status: 'available',
    completedAt: null,
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    title: 'First Mission',
    description: 'Complete any training mission on EngVox',
    criteriaType: 'first_mission',
    criteriaValue: 1,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_2',
    title: 'Reading Beginner',
    description: 'Complete a Reading comprehension module',
    criteriaType: 'module_count',
    criteriaValue: 1,
    moduleFilter: 'Reading',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_3',
    title: 'Writing Beginner',
    description: 'Complete a Writing workspace module',
    criteriaType: 'module_count',
    criteriaValue: 1,
    moduleFilter: 'Writing',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_4',
    title: '7 Day Streak',
    description: 'Maintain a 7-day learning streak in EngVox',
    criteriaType: 'streak',
    criteriaValue: 7,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_5',
    title: 'XP 1000',
    description: 'Earn a total of 1000 Experience Points',
    criteriaType: 'xp_earned',
    criteriaValue: 1000,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_6',
    title: 'XP 5000',
    description: 'Earn a total of 5000 Experience Points',
    criteriaType: 'xp_earned',
    criteriaValue: 5000,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_7',
    title: 'Perfect Score',
    description: 'Achieve a score of 100 on any learning module',
    criteriaType: 'perfect_score',
    criteriaValue: 100,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_8',
    title: 'Fast Learner',
    description: 'Log at least 3 completed study sessions',
    criteriaType: 'fast_learner',
    criteriaValue: 3,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_reading_tech',
    title: 'Technical Reader',
    description: 'Complete 3 Reading comprehension modules with high precision',
    criteriaType: 'module_count',
    criteriaValue: 3,
    moduleFilter: 'Reading',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_reading_perfect',
    title: 'Perfect Reading Score',
    description: 'Achieve a score of 100 on a Reading comprehension module',
    criteriaType: 'perfect_score',
    criteriaValue: 100,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_listening_first',
    title: 'First Listening',
    description: 'Complete your first Listening briefing session',
    criteriaType: 'module_count',
    criteriaValue: 1,
    moduleFilter: 'Listening',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_listening_meeting',
    title: 'Meeting Listener',
    description: 'Log at least 3 completed engineering Listening meetings',
    criteriaType: 'module_count',
    criteriaValue: 3,
    moduleFilter: 'Listening',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_listening_perfect',
    title: 'Perfect Listener',
    description: 'Achieve a perfect score of 100% in a Listening module',
    criteriaType: 'perfect_score',
    criteriaValue: 100,
    moduleFilter: 'Listening',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_listening_tech',
    title: 'Technical Listener',
    description: 'Complete 5 Listening briefing sessions with high accuracy',
    criteriaType: 'module_count',
    criteriaValue: 5,
    moduleFilter: 'Listening',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_listening_master',
    title: 'Listening Master',
    description: 'Complete all 10 Listening briefing sessions',
    criteriaType: 'module_count',
    criteriaValue: 10,
    moduleFilter: 'Listening',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_speaking_first',
    title: 'First Speaking Brief',
    description: 'Complete your first Speaking Engine Pro mission',
    criteriaType: 'module_count',
    criteriaValue: 1,
    moduleFilter: 'Speaking',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_speaking_meetings',
    title: 'Meeting Speaker',
    description: 'Complete 3 engineering speaking meeting missions',
    criteriaType: 'module_count',
    criteriaValue: 3,
    moduleFilter: 'Speaking',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_speaking_perfect',
    title: 'Perfect Speaking Score',
    description: 'Achieve a perfect score in a Speaking mission',
    criteriaType: 'perfect_score',
    criteriaValue: 100,
    moduleFilter: 'Speaking',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_speaking_technical',
    title: 'Technical Speaker',
    description:
      'Complete 5 Speaking missions with technical vocabulary calibration',
    criteriaType: 'module_count',
    criteriaValue: 5,
    moduleFilter: 'Speaking',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_speaking_master',
    title: 'Speaking Master',
    description: 'Complete all 10 Speaking Engine Pro missions',
    criteriaType: 'module_count',
    criteriaValue: 10,
    moduleFilter: 'Speaking',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_vocab_first_word',
    title: 'First Word',
    description: 'Learn your first engineering vocabulary word',
    criteriaType: 'module_count',
    criteriaValue: 1,
    moduleFilter: 'Vocabulary',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_vocab_100_words',
    title: '100 Words',
    description: 'Learn 100 engineering vocabulary words',
    criteriaType: 'module_count',
    criteriaValue: 100,
    moduleFilter: 'Vocabulary',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_vocab_500_words',
    title: '500 Words',
    description: 'Learn 500 engineering vocabulary words',
    criteriaType: 'module_count',
    criteriaValue: 500,
    moduleFilter: 'Vocabulary',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_vocab_master',
    title: 'Vocabulary Master',
    description: 'Reach the advanced Vocabulary Engine Pro mastery threshold',
    criteriaType: 'module_count',
    criteriaValue: 750,
    moduleFilter: 'Vocabulary',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_vocab_perfect_review',
    title: 'Perfect Review',
    description: 'Score 100 in a Vocabulary review session',
    criteriaType: 'perfect_score',
    criteriaValue: 100,
    moduleFilter: 'Vocabulary',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_vocab_30_day_retention',
    title: '30 Day Retention',
    description: 'Maintain a 30 day Vocabulary review streak',
    criteriaType: 'streak',
    criteriaValue: 30,
    moduleFilter: 'Vocabulary',
    unlocked: false,
    unlockedAt: null,
  },
];

const getInitialState = (): LearningState => {
  const persisted = storage.get<LearningState>(STORAGE_KEY);
  if (persisted) {
    // Dynamic merge of new missions
    const existingMissionIds = new Set(persisted.missions.map((m) => m.id));
    const newMissions = DEFAULT_MISSIONS.filter(
      (m) => !existingMissionIds.has(m.id)
    );
    if (newMissions.length > 0) {
      persisted.missions = [...persisted.missions, ...newMissions];
    }

    // Dynamic merge of new achievements
    const existingAchIds = new Set(
      persisted.achievements?.map((a) => a.id) || []
    );
    const newAchievements = DEFAULT_ACHIEVEMENTS.filter(
      (a) => !existingAchIds.has(a.id)
    );
    if (newAchievements.length > 0) {
      persisted.achievements = [
        ...(persisted.achievements || []),
        ...newAchievements,
      ];
    }
    return persisted;
  }
  return {
    missions: DEFAULT_MISSIONS,
    achievements: DEFAULT_ACHIEVEMENTS,
    xp: 0,
    level: 1,
    coins: 0,
    elo: 1000,
    streak: 0,
    lastActivityDate: null,
    studySessions: [],
    scoreHistory: [],
    xpHistory: [],
    eloHistory: [],
  };
};

export interface LearningStoreActions {
  startMission: (missionId: string) => void;
  submitMissionResult: (
    missionId: string,
    performanceRatio: number,
    durationMinutes: number
  ) => ScoreResult;
  completeGenericPractice: (
    module: MissionModule,
    score: number,
    durationMinutes: number
  ) => ScoreResult;
  resetAll: () => void;
}

export const useLearningStore = create<LearningState & LearningStoreActions>(
  (set, get) => ({
    ...getInitialState(),

    startMission: (missionId: string) => {
      const currentMissions = get().missions;
      const updated = currentMissions.map((m) =>
        m.id === missionId ? { ...m, status: 'active' as const } : m
      );

      set({ missions: updated });
      storage.set(STORAGE_KEY, { ...get() });

      // Emit event
      const active = updated.find((m) => m.id === missionId);
      if (active) {
        eventBus.publish({
          id: IdService.createId('evt'),
          type: 'learning.started',
          timestamp: new Date().toISOString(),
          payload: {
            module: active.module,
            topicId: active.id,
          },
        });
      }
    },

    submitMissionResult: (
      missionId: string,
      performanceRatio: number,
      durationMinutes: number
    ) => {
      const mission = get().missions.find((m) => m.id === missionId);
      if (!mission) {
        throw new Error(`Mission ${missionId} not found`);
      }

      // Call dynamic Scoring Engine
      const result = ScoringService.calculateScore({
        module: mission.module,
        difficulty: mission.difficulty,
        performanceRatio,
        timeSpentMinutes: durationMinutes,
      });

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Handle Streak math
      let currentStreak = get().streak;
      const lastDate = get().lastActivityDate;
      if (lastDate) {
        const last = new Date(lastDate);
        const diffMs = now.getTime() - last.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      // Set level up threshold math
      const totalXP = get().xp + result.xp;
      const computedLevel = Math.floor(totalXP / 500) + 1;
      const newElo = get().elo + result.eloChange;

      const updatedMissions = get().missions.map((m) =>
        m.id === missionId
          ? {
              ...m,
              status: 'completed' as const,
              completedAt: now.toISOString(),
              score: result.score,
            }
          : m
      );

      const newSession: StudySession = {
        timestamp: now.toISOString(),
        durationMinutes,
        score: result.score,
        module: mission.module,
      };

      const updatedSessions = [...get().studySessions, newSession];

      const todayDateStr = now.toLocaleDateString();
      const updatedScoreHistory = [
        ...get().scoreHistory,
        { date: todayDateStr, score: result.score, module: mission.module },
      ];
      const updatedXpHistory = [
        ...get().xpHistory,
        {
          date: todayDateStr,
          amount: result.xp,
          reason: `Completed ${mission.title}`,
        },
      ];
      const updatedEloHistory = [
        ...get().eloHistory,
        { date: todayDateStr, value: newElo },
      ];

      // Prepare temp state to pass to Achievement Scanner
      const tempState: LearningState = {
        ...get(),
        missions: updatedMissions,
        studySessions: updatedSessions,
        xp: totalXP,
        streak: currentStreak,
        coins: get().coins + result.coins,
        elo: newElo,
      };

      // Auto check Achievements
      const { updatedAchievements, newlyUnlocked } =
        AchievementService.checkAndUnlockAchievements(tempState);

      // Apply complete updates to the Store
      set({
        missions: updatedMissions,
        studySessions: updatedSessions,
        scoreHistory: updatedScoreHistory,
        xpHistory: updatedXpHistory,
        eloHistory: updatedEloHistory,
        xp: totalXP,
        level: computedLevel,
        coins: get().coins + result.coins,
        elo: newElo,
        streak: currentStreak,
        lastActivityDate: todayStr,
        achievements: updatedAchievements,
      });

      storage.set(STORAGE_KEY, { ...get() });

      // Publish event telemetry to system core Event Bus
      eventBus.publish({
        id: IdService.createId('evt'),
        type: 'learning.completed',
        timestamp: now.toISOString(),
        payload: {
          module: mission.module,
          topicId: mission.id,
          score: result.score,
          durationSeconds: durationMinutes * 60,
        },
      });

      eventBus.publish({
        id: IdService.createId('evt'),
        type: 'xp.earned',
        timestamp: now.toISOString(),
        payload: {
          amount: result.xp,
          reason: `Mission: ${mission.title}`,
        },
      });

      newlyUnlocked.forEach((ach) => {
        eventBus.publish({
          id: IdService.createId('evt'),
          type: 'badge.unlocked',
          timestamp: now.toISOString(),
          payload: {
            badgeId: ach.id,
            badgeName: ach.title,
          },
        });
        logger.i(`Achievement unlocked! Name: "${ach.title}"`);
      });

      return result;
    },

    completeGenericPractice: (
      module: MissionModule,
      score: number,
      durationMinutes: number
    ) => {
      // Dynamic scoring for generic or custom training loops
      const result = ScoringService.calculateScore({
        module,
        difficulty: 'Intermediate',
        performanceRatio: score / 100,
        timeSpentMinutes: durationMinutes,
      });

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Handle Streak math
      let currentStreak = get().streak;
      const lastDate = get().lastActivityDate;
      if (lastDate) {
        const last = new Date(lastDate);
        const diffMs = now.getTime() - last.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      const totalXP = get().xp + result.xp;
      const computedLevel = Math.floor(totalXP / 500) + 1;
      const newElo = get().elo + result.eloChange;

      const newSession: StudySession = {
        timestamp: now.toISOString(),
        durationMinutes,
        score: result.score,
        module,
      };

      const updatedSessions = [...get().studySessions, newSession];

      const todayDateStr = now.toLocaleDateString();
      const updatedScoreHistory = [
        ...get().scoreHistory,
        { date: todayDateStr, score: result.score, module },
      ];
      const updatedXpHistory = [
        ...get().xpHistory,
        {
          date: todayDateStr,
          amount: result.xp,
          reason: `Practiced ${module}`,
        },
      ];
      const updatedEloHistory = [
        ...get().eloHistory,
        { date: todayDateStr, value: newElo },
      ];

      const tempState: LearningState = {
        ...get(),
        studySessions: updatedSessions,
        xp: totalXP,
        streak: currentStreak,
        coins: get().coins + result.coins,
        elo: newElo,
      };

      const { updatedAchievements, newlyUnlocked } =
        AchievementService.checkAndUnlockAchievements(tempState);

      set({
        studySessions: updatedSessions,
        scoreHistory: updatedScoreHistory,
        xpHistory: updatedXpHistory,
        eloHistory: updatedEloHistory,
        xp: totalXP,
        level: computedLevel,
        coins: get().coins + result.coins,
        elo: newElo,
        streak: currentStreak,
        lastActivityDate: todayStr,
        achievements: updatedAchievements,
      });

      storage.set(STORAGE_KEY, { ...get() });

      eventBus.publish({
        id: IdService.createId('evt'),
        type: 'learning.completed',
        timestamp: now.toISOString(),
        payload: {
          module,
          topicId: `generic_${module.toLowerCase()}`,
          score: result.score,
          durationSeconds: durationMinutes * 60,
        },
      });

      eventBus.publish({
        id: IdService.createId('evt'),
        type: 'xp.earned',
        timestamp: now.toISOString(),
        payload: {
          amount: result.xp,
          reason: `Practice: ${module}`,
        },
      });

      newlyUnlocked.forEach((ach) => {
        eventBus.publish({
          id: IdService.createId('evt'),
          type: 'badge.unlocked',
          timestamp: now.toISOString(),
          payload: {
            badgeId: ach.id,
            badgeName: ach.title,
          },
        });
        logger.i(`Achievement unlocked! Name: "${ach.title}"`);
      });

      return result;
    },

    resetAll: () => {
      set({
        missions: DEFAULT_MISSIONS,
        achievements: DEFAULT_ACHIEVEMENTS,
        xp: 0,
        level: 1,
        coins: 0,
        elo: 1000,
        streak: 0,
        lastActivityDate: null,
        studySessions: [],
        scoreHistory: [],
        xpHistory: [],
        eloHistory: [],
      });
      storage.set(STORAGE_KEY, { ...get() });
    },
  })
);
