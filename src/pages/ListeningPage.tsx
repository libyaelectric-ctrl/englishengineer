import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Headphones,
  KeyRound,
  ListChecks,
  Activity,
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

const ListeningPage = () => {
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
  const currentMission =
    visibleMissions.find((mission) => mission.id === selectedMissionId) ??
    visibleMissions[0];

  useEffect(() => initializeStore(), [initializeStore]);

  if (!currentMission) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="sticky top-0 z-40 border-b border-border-soft bg-background -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 shadow-sm">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Listening</h1>
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
    <div className="animate-in fade-in duration-300">
      {/* Sticky header — clean, full-width */}
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Listening</h1>
        </div>
      </div>
      <div className="space-y-6 pt-4 pb-20">
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleMissions.map((mission) => (
              <article
                key={mission.id}
                className="rounded-xl border border-border-soft bg-background p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-1 text-xs font-bold ${
                      mission.cefrLevel.startsWith('A') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      mission.cefrLevel.startsWith('B') ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-violet-50 border-violet-200 text-violet-700'
                    }`}>
                      {mission.cefrLevel}
                    </span>
                    <LevelAccessBadge
                      label={getContentAccessLabel(
                        mission.cefrLevel,
                        currentLevel
                      )}
                    />
                  </div>
                  <span className="text-xs text-muted-copy">
                    {mission.estimatedMinutes} min
                  </span>
                </div>
                <h2 className="mt-3 font-medium text-foreground">
                  {mission.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-copy">
                  {mission.description}
                </p>
                <Button
                  className="mt-4 w-full"
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
            <Button variant="outline" onClick={() => setWorkspaceOpen(false)}>
              Back to tasks
            </Button>
            <span className="text-sm font-medium text-muted-copy">
              {currentMission.cefrLevel} · {currentMission.missionType}
            </span>
          </div>

          <AudioPlayer mission={currentMission} />

          <SectionCard
            title={currentMission.title}
            subtitle="Read the transcript, then complete all three response modes"
            icon={FileText}
          >
            <div className="whitespace-pre-line rounded-xl border border-border-soft bg-surface-hover p-5 text-sm leading-7 text-foreground">
              {currentMission.transcript}
            </div>
          </SectionCard>

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
                    className="rounded-xl border border-border-soft p-4"
                  >
                    <legend className="px-2 text-sm font-medium text-foreground">
                      {index + 1}. {question.questionText}
                    </legend>
                    {question.type === 'multiple_choice' ? (
                      <div className="mt-3 space-y-2">
                        {question.choices?.map((choice, choiceIndex) => {
                          const value = String.fromCharCode(65 + choiceIndex);
                          return (
                            <label
                              key={choice}
                              className="flex cursor-pointer gap-2 rounded-lg border border-border-soft p-3 text-sm text-foreground"
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
                      <select
                        value={answers[question.id] ?? ''}
                        onChange={(event) =>
                          setAnswer(question.id, event.target.value)
                        }
                        className="mt-3 w-full rounded-lg border border-border-soft p-3 text-sm"
                      >
                        <option value="">Select true or false</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        value={answers[question.id] ?? ''}
                        onChange={(event) =>
                          setAnswer(question.id, event.target.value)
                        }
                        placeholder="Complete the missing technical phrase"
                        className="mt-3 w-full rounded-lg border border-border-soft p-3 text-sm"
                      />
                    )}
                  </fieldset>
                ))}

                <label className="block text-sm font-medium text-foreground">
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" /> Key words you identified
                  </span>
                  <input
                    value={userKeywords}
                    onChange={(event) => setUserKeywords(event.target.value)}
                    placeholder="Separate key words with commas"
                    className="mt-2 w-full rounded-lg border border-border-soft p-3 font-normal"
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Short transcript summary
                  <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    className="mt-2 min-h-28 w-full rounded-lg border border-border-soft p-3 font-normal"
                  />
                </label>
                <Button
                  onClick={() => submitCurrentMission()}
                  disabled={!summary.trim()}
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
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
                  <p className="text-xs font-medium text-rose-600">
                    Final score
                  </p>
                  <p className="text-2xl font-black text-rose-700">
                    {evaluationResult.finalScore}%
                  </p>
                </div>
                <div className="rounded-xl bg-pink-50 border border-pink-200 p-4">
                  <p className="text-xs font-medium text-pink-600">
                    Comprehension
                  </p>
                  <p className="text-2xl font-black text-pink-700">
                    {evaluationResult.comprehensionScore}%
                  </p>
                </div>
                <div className="rounded-xl bg-surface-hover p-4">
                  <p className="text-xs font-medium text-muted-copy">
                    Key words
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {evaluationResult.keywordScore}%
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground">
                {evaluationResult.feedback}
              </p>
              <Button className="mt-4" onClick={resetCurrentMission}>
                Try another response
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
