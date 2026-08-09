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
          className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-card)] bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer transition-all hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? 'Üretiliyor...' : 'Ders Üret'}
        </button>

        {error && (
          <div className="rounded-[var(--radius-card)] bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {lesson && (
          <div className="space-y-4 pt-2">
            {(activeTab === 'all' || activeTab === 'vocabulary') &&
              lesson.vocabulary?.length > 0 && (
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

            {(activeTab === 'all' || activeTab === 'reading') && lesson.reading && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Okuma
                </h4>
                <div className="rounded-[var(--radius-card)] bg-surface-hover p-3 space-y-2">
                  <p className="font-bold text-sm">{lesson.reading.title}</p>
                  <p className="text-xs">{lesson.reading.titleTranslation}</p>
                  <p className="text-sm leading-relaxed">{lesson.reading.passage}</p>
                  <p className="text-xs text-muted-copy italic">
                    {lesson.reading.passageTranslation}
                  </p>
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'writing') && lesson.writing && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <PenTool className="h-4 w-4 text-primary" />
                  Yazma
                </h4>
                <div className="rounded-[var(--radius-card)] bg-surface-hover p-3 space-y-2">
                  <p className="text-sm font-medium">{lesson.writing.prompt}</p>
                  <p className="text-xs text-muted-copy">{lesson.writing.promptTranslation}</p>
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'speaking') && lesson.speaking && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Konuşma
                </h4>
                <div className="rounded-[var(--radius-card)] bg-surface-hover p-3 space-y-1">
                  <p className="text-xs font-medium">{lesson.speaking.scenario}</p>
                  <p className="text-xs text-muted-copy italic">
                    {lesson.speaking.scenarioTranslation}
                  </p>
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'listening') && lesson.listening && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <Headphones className="h-4 w-4 text-primary" />
                  Dinleme
                </h4>
                <div className="rounded-[var(--radius-card)] bg-surface-hover p-3 space-y-2">
                  <p className="text-sm leading-relaxed">{lesson.listening.script}</p>
                  <p className="text-xs text-muted-copy italic">
                    {lesson.listening.scriptTranslation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
