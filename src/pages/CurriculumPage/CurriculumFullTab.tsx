import type { SkillName, UserLearningProfile } from '@/features/profile';
import type { LearningTaskRecommendation } from '@/features/learning-orchestrator';
import { CurriculumSkillSelector } from './CurriculumSkillSelector';
import { CurriculumRecommendationBrief } from './CurriculumRecommendationBrief';
import { CurriculumSidebar } from './CurriculumSidebar';
import { CheckCircle2, PlayCircle, Circle, Map } from 'lucide-react';

interface SkillMeta {
  label: string;
  route: string | null;
  icon: string;
}

interface Props {
  profile: UserLearningProfile;
  selectedSkill: SkillName;
  weakestSkill: string;
  domain: string;
  setDomain: (domain: string) => void;
  setSelectedSkill: (skill: SkillName) => void;
  recommendation: LearningTaskRecommendation | null;
  recommendationLoading: boolean;
  selectedMeta: SkillMeta;
}

const MODULES = [
  {
    id: 'MOD-01',
    title: 'Site Communication Fundamentals',
    description:
      'Basic vocabulary, tool names, routines, and simple instructions.',
    lessons: [
      {
        num: 1,
        title: 'Introductions',
        goal: 'Introduce yourself, your role and your immediate responsibility.',
      },
      {
        num: 2,
        title: 'Daily routine',
        goal: 'Describe routine work with clear time and sequence language.',
      },
      {
        num: 3,
        title: 'Locations and access',
        goal: 'Explain where equipment, people and work areas are located.',
      },
      {
        num: 4,
        title: 'Tools and materials',
        goal: 'Identify tools, materials and their basic purpose.',
      },
      {
        num: 5,
        title: 'Instructions',
        goal: 'Understand and give one clear action at a time.',
      },
    ],
  },
  {
    id: 'MOD-02',
    title: 'Technical Operations & Safety',
    description:
      'Progress reports, safety protocols, inspection readiness, and coordination.',
    lessons: [
      {
        num: 6,
        title: 'Progress updates',
        goal: 'Report completed work, current work and the next action.',
      },
      {
        num: 7,
        title: 'Safety conditions',
        goal: 'State a hazard, control and responsible person.',
      },
      {
        num: 8,
        title: 'Inspection readiness',
        goal: 'Confirm scope, evidence and outstanding checks.',
      },
      {
        num: 9,
        title: 'Technical clarification',
        goal: 'Ask for and provide precise technical clarification.',
      },
      {
        num: 10,
        title: 'Coordination',
        goal: 'Describe an interface, constraint and agreed owner.',
      },
    ],
  },
  {
    id: 'MOD-03',
    title: 'Quality, Handover & Handshaking',
    description: 'Quality controls, testing, scheduling delays, and handovers.',
    lessons: [
      {
        num: 11,
        title: 'Quality observations',
        goal: 'Record a factual observation and corrective action.',
      },
      {
        num: 12,
        title: 'Delay and impact',
        goal: 'Explain cause, schedule impact and mitigation.',
      },
      {
        num: 13,
        title: 'Testing',
        goal: 'Describe a test method, result and acceptance condition.',
      },
      {
        num: 14,
        title: 'Client communication',
        goal: 'Present status and request a clear decision.',
      },
      {
        num: 15,
        title: 'Handover',
        goal: 'Summarize readiness, open items and next responsibility.',
      },
    ],
  },
];

export const CurriculumFullTab = ({
  profile,
  selectedSkill,
  weakestSkill,
  domain,
  setDomain,
  setSelectedSkill,
  recommendation,
  recommendationLoading,
  selectedMeta,
}: Props) => {
  const currentLessonNumber = recommendation?.lessonNumber ?? 1;

  return (
    <>
      <CurriculumSkillSelector
        selectedSkill={selectedSkill}
        weakestSkill={weakestSkill}
        profile={profile}
        setSelectedSkill={setSelectedSkill}
        setDomain={setDomain}
      />

      <div
        id="gate-progress"
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] font-sans"
      >
        <div className="space-y-6">
          <CurriculumRecommendationBrief
            selectedMeta={selectedMeta}
            recommendation={recommendation}
            recommendationLoading={recommendationLoading}
          />

          {/* Precision Engineering Roadmap List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#d9d9e3] pb-3">
              <Map className="h-5 w-5 text-[#0047bb]" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Precision Engineering Roadmap
                </h2>
                <p className="text-xs text-muted-copy font-medium mt-0.5">
                  Complete roadmap modules mapped to your current CEFR learning
                  sequence
                </p>
              </div>
            </div>

            <div className="space-y-6 relative">
              {MODULES.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm relative overflow-hidden"
                >
                  {/* Technical background Grid for OS feel */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />

                  {/* Header */}
                  <div className="relative z-10 flex items-start justify-between gap-3 border-b border-[#d9d9e3] pb-4">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#0047bb] uppercase tracking-wider bg-[#0047bb]/5 px-2 py-0.5 rounded-[4px] border border-[#0047bb]/10">
                        {mod.id} // LEVEL MODULE
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-2 tracking-tight">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-muted-copy mt-1 font-medium leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Lessons list with connector line */}
                  <div className="relative mt-5 pl-7 space-y-4">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-2 top-3 bottom-3 w-[1px] bg-[#d9d9e3]" />

                    {mod.lessons.map((lesson) => {
                      const isCompleted = lesson.num < currentLessonNumber;
                      const isActive = lesson.num === currentLessonNumber;
                      const isLocked = lesson.num > currentLessonNumber;
                      const lessonIdStr = `MOD-01.${lesson.num < 10 ? '0' : ''}${lesson.num}`;

                      return (
                        <div
                          key={lesson.num}
                          className={`relative flex items-start gap-4 p-3.5 rounded-[4px] border transition-colors ${
                            isActive
                              ? 'border-[#0047bb]/40 bg-[#0047bb]/5'
                              : 'border-[#d9d9e3]/60 bg-[#f3f3fd]'
                          }`}
                        >
                          {/* Dot / Icon Connector */}
                          <div className="absolute -left-[27px] top-[14px] flex items-center justify-center">
                            {isCompleted && (
                              <CheckCircle2 className="h-[14px] w-[14px] text-success bg-white rounded-full" />
                            )}
                            {isActive && (
                              <PlayCircle className="h-[14px] w-[14px] text-[#0047bb] bg-white rounded-full animate-pulse" />
                            )}
                            {isLocked && (
                              <Circle className="h-[14px] w-[14px] text-muted-copy bg-white rounded-full" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[9px] font-bold text-muted-copy uppercase tracking-widest">
                                {lessonIdStr}
                              </span>
                              {isActive && (
                                <span className="rounded-[4px] bg-[#0047bb]/10 border border-[#0047bb]/25 px-1.5 py-0.5 text-[8px] font-bold text-[#0047bb] uppercase tracking-wider">
                                  ACTIVE TARGET
                                </span>
                              )}
                              {isCompleted && (
                                <span className="rounded-[4px] bg-success/10 border border-success/25 px-1.5 py-0.5 text-[8px] font-bold text-success uppercase tracking-wider">
                                  SYNCED
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-muted-copy leading-relaxed mt-1 font-medium">
                              {lesson.goal}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CurriculumSidebar
          domain={domain}
          setDomain={setDomain}
          profile={profile}
        />
      </div>
    </>
  );
};
