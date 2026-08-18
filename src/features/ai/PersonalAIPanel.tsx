import { BookOpen, Brain, Headphones, MessageSquare, PenTool, Sparkles } from 'lucide-react';

import { useState } from 'react';

import { SectionCard } from '@/shared/components/SectionCard';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useLocalizationStore } from '@/features/localization';

import {
  type GenerateLessonParams,
  PersonalAIService,
  type PersonalLessonContent,
} from './personal-ai.service';

interface PersonalAIPanelProps {
  discipline: EngineeringDiscipline | null;
  cefrLevel?: string;
  userName?: string;
}

type SkillTab = 'all' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening';

const SKILL_TABS: { id: SkillTab; icon: React.ElementType }[] = [
  { id: 'all', icon: Sparkles },
  { id: 'vocabulary', icon: BookOpen },
  { id: 'reading', icon: BookOpen },
  { id: 'writing', icon: PenTool },
  { id: 'speaking', icon: MessageSquare },
  { id: 'listening', icon: Headphones },
];

interface LessonSectionProps {
  title: string;
  icon: React.ElementType;
  visible: boolean;
  children: React.ReactNode;
}

const LessonSection = ({ title, icon: Icon, visible, children }: LessonSectionProps) => {
  if (!visible) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h4>
      <div className="rounded-[var(--radius-card)] bg-surface-hover p-3 space-y-2">{children}</div>
    </div>
  );
};

const showSkillSection = (activeTab: SkillTab, skill: SkillTab, present: boolean): boolean =>
  (activeTab === 'all' || activeTab === skill) && present;

interface LessonContentProps {
  lesson: PersonalLessonContent;
  activeTab: SkillTab;
}

const LessonContent = ({ lesson, activeTab }: LessonContentProps) => {
  return (
    <div className="space-y-4 pt-2">
      {(activeTab === 'all' || activeTab === 'vocabulary') && lesson.vocabulary?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            Kelime
          </h4>
          <div className="grid gap-2">
            {lesson.vocabulary.map((v, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-card)] bg-surface-hover p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{v.term}</span>
                  <span className="text-muted-copy">{v.cefrLevel}</span>
                </div>
                <p className="font-medium">{v.translation}</p>
                <p className="text-muted-copy">{v.definition}</p>
                <p className="italic text-muted-copy">{v.example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <LessonSection
        title="Okuma"
        icon={BookOpen}
        visible={showSkillSection(activeTab, 'reading', lesson.reading !== undefined)}
      >
        <p className="font-bold text-sm">{lesson.reading?.title}</p>
        <p className="text-xs">{lesson.reading?.titleTranslation}</p>
        <p className="text-sm leading-relaxed">{lesson.reading?.passage}</p>
        <p className="text-xs text-muted-copy italic">{lesson.reading?.passageTranslation}</p>
      </LessonSection>
      <LessonSection
        title="Yazma"
        icon={PenTool}
        visible={showSkillSection(activeTab, 'writing', lesson.writing !== undefined)}
      >
        <p className="text-sm font-medium">{lesson.writing?.prompt}</p>
        <p className="text-xs text-muted-copy italic">{lesson.writing?.promptTranslation}</p>
      </LessonSection>
      <LessonSection
        title="Konuşma"
        icon={MessageSquare}
        visible={showSkillSection(activeTab, 'speaking', lesson.speaking !== undefined)}
      >
        <p className="text-xs font-medium">{lesson.speaking?.scenario}</p>
        <p className="text-xs text-muted-copy italic">{lesson.speaking?.scenarioTranslation}</p>
      </LessonSection>
      <LessonSection
        title="Dinleme"
        icon={Headphones}
        visible={showSkillSection(activeTab, 'listening', lesson.listening !== undefined)}
      >
        <p className="text-sm leading-relaxed">{lesson.listening?.script}</p>
        <p className="text-xs text-muted-copy italic">{lesson.listening?.scriptTranslation}</p>
      </LessonSection>
    </div>
  );
};

export const PersonalAIPanel = ({
  discipline,
  cefrLevel = 'B1',
  userName,
}: PersonalAIPanelProps) => {
  const language = useLocalizationStore((s) => s.language);

  const [activeTab, setActiveTab] = useState<SkillTab>('all');
  const [lesson, setLesson] = useState<PersonalLessonContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLesson = async () => {
    if (!discipline) return;
    setIsGenerating(true);
    setError(null);
    try {
      const params: GenerateLessonParams = {
        discipline,
        targetLanguage: language,
        cefrLevel,
        skill: activeTab === 'all' ? undefined : activeTab,
        userName,
      };
      const result = await PersonalAIService.generateLesson(params);
      setLesson(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SectionCard
      title="Kişisel AI Ders Üretici"
      subtitle="Mesleğiniz ve diliniz için özelleştirilmiş İngilizce ders içeriği üretin"
      icon={Brain}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SKILL_TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 rounded-[var(--radius-card)] px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-hover text-foreground hover:bg-primary/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {id}
            </button>
          ))}
        </div>

        <button
          onClick={generateLesson}
          disabled={isGenerating || !discipline}
          className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-card)] bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? 'Üretiliyor...' : 'Ders Üret'}
        </button>

        {error && (
          <div className="rounded-[var(--radius-card)] bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {lesson && <LessonContent lesson={lesson} activeTab={activeTab} />}
      </div>
    </SectionCard>
  );
};
