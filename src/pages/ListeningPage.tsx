import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  Gauge,
  Headphones,
  KeyRound,
  ListChecks,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useListeningMissionsStore } from '@/features/listening';
import { AudioPlayer } from '@/features/listening/AudioPlayer';
import {
  type ContentLevelFilter,
  DEFAULT_CONTENT_LEVEL_FILTER,
  EmptyLevelState,
  filterContentByLevel,
  getContentAccessLabel,
  LevelAccessBadge,
  LevelContentFilter,
  useSkillLevel,
} from '@/features/level-system';

import { Button } from '@/shared/components/Button';

import { SectionCard } from '@/shared/components/SectionCard';
import { useReadingStore } from '@/features/reading';
import { useWritingStore } from '@/features/writing/writing.store';

const READING_THRESHOLD = 5;
const WRITING_THRESHOLD = 5;

const AnimatedScore = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value]);

  return <span>{display}%</span>;
};

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5] as const;

const ListeningPage = () => {
  const readingStore = useReadingStore();
  const writingStore = useWritingStore();
  const readingDone = Object.keys(readingStore.completedMissions || {}).length;
  const writingDone = Object.keys(writingStore.completedMissions || {}).length;
  const canAccess = readingDone >= READING_THRESHOLD && writingDone >= WRITING_THRESHOLD;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[4px] border-2 border-[#0047bb] bg-surface p-8 text-center space-y-4">
          <Lock className="mx-auto h-10 w-10 text-[#0047bb]" />
          <h2 className="text-lg font-bold text-foreground">Listening Locked</h2>
          <p className="text-xs text-muted-copy leading-relaxed">Complete 50 readings and 50 writings to unlock Listening.</p>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between text-muted-copy"><span>Reading</span><span className="font-bold text-foreground">{readingDone}/50</span></div>
            <div className="h-1.5 rounded-full bg-border-soft overflow-hidden"><div className="h-full bg-[#0047bb]" style={{ width: `${Math.min((readingDone / READING_THRESHOLD) * 100, 100)}%` }} /></div>
            <div className="flex justify-between text-muted-copy"><span>Writing</span><span className="font-bold text-foreground">{writingDone}/50</span></div>
            <div className="h-1.5 rounded-full bg-border-soft overflow-hidden"><div className="h-full bg-[#0047bb]" style={{ width: `${Math.min((writingDone / WRITING_THRESHOLD) * 100, 100)}%` }} /></div>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <Link to="/reading" className="rounded-[4px] border-2 border-[#0047bb] px-4 py-2 text-[10px] font-bold uppercase text-foreground hover:bg-surface-hover">Go to Reading</Link>
            <Link to="/writing" className="rounded-[4px] border-2 border-[#0047bb] px-4 py-2 text-[10px] font-bold uppercase text-foreground hover:bg-surface-hover">Go to Writing</Link>
          </div>
        </div>
      </div>
    );
  }

  const missions = useListeningMissionsStore((s) => s.missions);
  const selectedMissionId = useListeningMissionsStore(
    (s) => s.selectedMissionId
  );
  const answers = useListeningMissionsStore((s) => s.answers);
  const summary = useListeningMissionsStore((s) => s.summary);
  const userKeywords = useListeningMissionsStore((s) => s.userKeywords);
  const evaluationResult = useListeningMissionsStore((s) => s.evaluationResult);
  const initializeStore = useListeningMissionsStore(
    (s) => s.initializeMissions
  );
  const selectMission = useListeningMissionsStore((s) => s.selectMission);
  const setAnswer = useListeningMissionsStore((s) => s.setAnswer);
  const setSummary = useListeningMissionsStore((s) => s.setSummary);
  const setUserKeywords = useListeningMissionsStore((s) => s.setUserKeywords);
  const submitCurrentMission = useListeningMissionsStore(
    (s) => s.submitCurrentMission
  );
  const resetCurrentMission = useListeningMissionsStore(
    (s) => s.resetCurrentMission
  );
  const currentLevel = useSkillLevel('listening').currentLevel;
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const visibleMissions = useMemo(
    () => filterContentByLevel(missions, currentLevel, levelFilter),
    [currentLevel, levelFilter, missions]
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const CATEGORIES = [
    'All',
    'Site Meetings',
    'Technical',
    'Safety',
    'Commissioning',
  ] as const;
  const filteredMissions = useMemo(
    () =>
      categoryFilter === 'All'
        ? visibleMissions
        : visibleMissions.filter((m) =>
            m.missionType?.toLowerCase().includes(categoryFilter.toLowerCase())
          ),
    [visibleMissions, categoryFilter]
  );
  const [showTranscript, setShowTranscript] = useState(true);
  const currentMission =
    visibleMissions.find((mission) => mission.id === selectedMissionId) ??
    visibleMissions[0];

  useEffect(() => initializeStore(), [initializeStore]);

  if (!currentMission) {
    return (
      <div className="min-h-screen bg-background pb-16 text-foreground space-y-4 animate-in fade-in duration-300">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Listening
          </h1>
        </div>
        <div className="space-y-6 pt-4">
          <LevelContentFilter
            value={levelFilter}
            currentLevel={currentLevel}
            onChange={setLevelFilter}
          />
          <EmptyLevelState skill="listening" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground space-y-6 animate-in fade-in duration-300">
      {/* Sticky header — clean, full-width */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h1 className="text-base font-bold tracking-tight text-foreground">
          Listening
        </h1>
        <span className="text-[11px] font-medium text-muted-copy leading-tight">
          Mission{' '}
          {visibleMissions.findIndex((m) => m.id === currentMission.id) + 1}/
          {visibleMissions.length}
        </span>
      </div>
      <div className="space-y-6 pt-4">
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />

        {!workspaceOpen ? (
          <SectionCard
            title="Transcript Tasks"
            subtitle="Choose a level-safe task; the system recommendation remains changeable"
            icon={Headphones}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`min-h-9 rounded-[4px] px-3.5 text-xs font-bold transition-all cursor-pointer border ${
                    categoryFilter === cat
                      ? 'bg-[#0047bb] border-[#0047bb] text-white shadow-sm'
                      : 'text-muted-copy border-border-soft bg-surface hover:bg-[#0047bb]/5 hover:text-[#0047bb]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMissions.map((mission) => (
                <article
                  key={mission.id}
                  className="group rounded-[4px] border border-border-soft bg-surface p-5 hover:border-[#0047bb]/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
                        {mission.cefrLevel}
                      </span>
                      <LevelAccessBadge
                        label={getContentAccessLabel(
                          mission.cefrLevel,
                          currentLevel
                        )}
                      />
                    </div>
                    <span className="text-xs text-muted-copy font-bold">
                      {mission.estimatedMinutes} M
                    </span>
                  </div>
                  <h2 className="mt-3 font-bold text-foreground group-hover:text-[#0047bb] transition-colors tracking-tight">
                    {mission.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-copy font-normal">
                    {mission.description}
                  </p>
                  <Button
                    className="mt-4 w-full rounded-[4px] font-bold uppercase tracking-wider text-[10px] cursor-pointer bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] h-10"
                    onClick={() => {
                      selectMission(mission.id);
                      setWorkspaceOpen(true);
                    }}
                  >
                    Open transcript task
                  </Button>
                </article>
              ))}
            </div>
          </SectionCard>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-[4px] cursor-pointer text-xs h-9 border-border-soft hover:bg-[#0047bb]/5 hover:text-[#0047bb]"
                onClick={() => setWorkspaceOpen(false)}
              >
                Back to tasks
              </Button>
              <span className="text-sm font-bold text-muted-copy uppercase tracking-wider">
                {currentMission.cefrLevel} · {currentMission.missionType}
              </span>
            </div>

            <AudioPlayer mission={currentMission} />

            <div className="flex items-center gap-3 rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm">
              <Gauge className="h-4 w-4 text-[#0047bb] shrink-0" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Playback Speed:
              </span>
              <div className="flex gap-1.5">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`rounded-[4px] px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                      playbackSpeed === speed
                        ? 'bg-[#0047bb] text-white border-[#0047bb]'
                        : 'bg-[#f3f3fd] border-border-soft text-muted-copy hover:bg-[#0047bb]/5 hover:text-[#0047bb]'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="rounded-[4px] cursor-pointer text-xs h-9 border-border-soft hover:bg-[#0047bb]/5 hover:text-[#0047bb]"
              onClick={() => setShowTranscript((prev) => !prev)}
            >
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </Button>

            {showTranscript && (
              <SectionCard
                title={currentMission.title}
                subtitle="Read the transcript, then complete all three response modes"
                icon={FileText}
              >
                <div className="whitespace-pre-line rounded-[4px] border border-border-soft bg-surface p-5 text-sm leading-[1.7] text-foreground font-normal shadow-sm">
                  {currentMission.transcript}
                </div>
              </SectionCard>
            )}

            {!evaluationResult ? (
              <SectionCard
                title="Comprehension Check"
                subtitle="Multiple choice, fill-gap/short response, and key words"
                icon={ListChecks}
              >
                <div className="space-y-5">
                  {currentMission.questions.map((question, index) => (
                    <fieldset
                      key={question.id}
                      className="rounded-[4px] border border-border-soft bg-[#f3f3fd] p-4 shadow-sm"
                    >
                      <legend className="px-2 text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                        {index + 1}. {question.questionText}
                      </legend>
                      {question.type === 'multiple_choice' ? (
                        <div className="mt-3 space-y-2">
                          {question.choices?.map((choice, choiceIndex) => {
                            const value = String.fromCharCode(65 + choiceIndex);
                            return (
                              <label
                                key={choice}
                                className="flex cursor-pointer gap-2.5 rounded-[4px] border border-border-soft bg-surface p-3 text-sm text-foreground hover:bg-[#0047bb]/5 hover:border-[#0047bb]/30 transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={value}
                                  checked={answers[question.id] === value}
                                  onChange={() => setAnswer(question.id, value)}
                                />
                                {choice}
                              </label>
                            );
                          })}
                        </div>
                      ) : question.type === 'true_false' ? (
                        <label className="block mt-3">
                          <span className="sr-only">True or false answer</span>
                          <select
                            value={answers[question.id] ?? ''}
                            onChange={(event) =>
                              setAnswer(question.id, event.target.value)
                            }
                            className="w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-[#0047bb] focus:outline-none"
                          >
                            <option value="">Select true or false</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </label>
                      ) : (
                        <label className="block mt-3">
                          <span className="sr-only">Short answer</span>
                          <input
                            value={answers[question.id] ?? ''}
                            onChange={(event) =>
                              setAnswer(question.id, event.target.value)
                            }
                            placeholder="Complete the missing technical phrase"
                            className="w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-[#0047bb] focus:outline-none font-bold"
                          />
                        </label>
                      )}
                    </fieldset>
                  ))}

                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-[#0047bb]" /> Key words
                      you identified
                    </span>
                    <input
                      value={userKeywords}
                      onChange={(event) => setUserKeywords(event.target.value)}
                      placeholder="Separate key words with commas"
                      className="mt-2 w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-[#0047bb] focus:outline-none font-bold placeholder-muted-copy"
                    />
                  </label>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                    Short transcript summary
                    <textarea
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      className="mt-2 min-h-[160px] w-full resize-y rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-[#0047bb] focus:outline-none font-bold placeholder-muted-copy leading-relaxed"
                    />
                  </label>
                  <Button
                    onClick={() => submitCurrentMission()}
                    disabled={!summary.trim()}
                    className="bg-[#0047bb] hover:bg-[#0047bb]/90 text-white font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-[4px] cursor-pointer border border-[#0047bb] shadow-sm"
                  >
                    Submit transcript task
                  </Button>
                </div>
              </SectionCard>
            ) : (
              <SectionCard
                title="Deterministic Result"
                subtitle="Local scoring only; no AI or speech evaluation"
                icon={CheckCircle2}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
                    <p className="text-xs font-bold text-muted-copy uppercase tracking-wider">
                      Final score
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedScore value={evaluationResult.finalScore} />
                    </p>
                  </div>
                  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
                    <p className="text-xs font-bold text-muted-copy uppercase tracking-wider">
                      Comprehension
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedScore
                        value={evaluationResult.comprehensionScore}
                      />
                    </p>
                  </div>
                  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
                    <p className="text-xs font-bold text-muted-copy uppercase tracking-wider">
                      Key words
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedScore value={evaluationResult.keywordScore} />
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-foreground font-normal">
                  {evaluationResult.feedback}
                </p>
                <Button
                  className="mt-4 bg-[#0047bb] hover:bg-[#0047bb]/90 text-white font-bold uppercase tracking-wider text-[10px] h-10 px-5 rounded-[4px] cursor-pointer border border-[#0047bb] shadow-sm animate-in fade-in"
                  onClick={resetCurrentMission}
                >
                  Try another response
                </Button>
                <Button
                  variant="outline"
                  className="mt-4 ml-2 rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-border-soft hover:bg-[#0047bb]/5 hover:text-[#0047bb] shadow-sm"
                  onClick={resetCurrentMission}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Replay Audio
                </Button>
              </SectionCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningPage;
