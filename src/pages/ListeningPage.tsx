import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Headphones,
  KeyRound,
  ListChecks,
} from 'lucide-react';
import { useListeningStore } from '@/features/listening';
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
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import { Button } from '@/shared/components/Button';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';

const ListeningPage = () => {
  const {
    missions,
    selectedMissionId,
    answers,
    summary,
    userKeywords,
    evaluationResult,
    initializeStore,
    selectMission,
    setAnswer,
    setSummary,
    setUserKeywords,
    submitCurrentMission,
    resetCurrentMission,
  } = useListeningStore();
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
      <div className="space-y-6 p-6">
        <PageHeader
          title="Listening Transcript Practice"
          description="Practice engineering comprehension with level-matched transcripts."
          badgeText={`${currentLevel} · TRANSCRIPT PRACTICE`}
          badgeColor="primary"
        />
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />
        <EmptyLevelState skill="listening" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Listening Transcript Practice"
        description="Practice engineering comprehension with level-matched transcripts while recorded audio remains outside this workspace."
        badgeText={`${currentLevel} · TRANSCRIPT PRACTICE`}
        badgeColor="primary"
      />
      <SkillEntryBrief skill="listening" />
      <LevelContentFilter
        value={levelFilter}
        currentLevel={currentLevel}
        onChange={setLevelFilter}
      />

      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
        <strong>Transcript practice is active.</strong> Recorded audio is not
        included in this workspace yet, and no microphone access is required.
      </div>

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
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-black text-sky-700">
                      {mission.cefrLevel}
                    </span>
                    <LevelAccessBadge
                      label={getContentAccessLabel(
                        mission.cefrLevel,
                        currentLevel
                      )}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {mission.estimatedMinutes} min
                  </span>
                </div>
                <h2 className="mt-3 font-black text-slate-950">
                  {mission.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
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
            <span className="text-sm font-bold text-slate-600">
              {currentMission.cefrLevel} · {currentMission.missionType}
            </span>
          </div>

          <SectionCard
            title={currentMission.title}
            subtitle="Read the transcript, then complete all three response modes"
            icon={FileText}
          >
            <div className="whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800">
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
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <legend className="px-2 text-sm font-black text-slate-900">
                      {index + 1}. {question.questionText}
                    </legend>
                    {question.type === 'multiple_choice' ? (
                      <div className="mt-3 space-y-2">
                        {question.choices?.map((choice, choiceIndex) => {
                          const value = String.fromCharCode(65 + choiceIndex);
                          return (
                            <label
                              key={choice}
                              className="flex cursor-pointer gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
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
                        className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm"
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
                        className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm"
                      />
                    )}
                  </fieldset>
                ))}

                <label className="block text-sm font-black text-slate-900">
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" /> Key words you identified
                  </span>
                  <input
                    value={userKeywords}
                    onChange={(event) => setUserKeywords(event.target.value)}
                    placeholder="Separate key words with commas"
                    className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"
                  />
                </label>
                <label className="block text-sm font-black text-slate-900">
                  Short transcript summary
                  <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 p-3 font-normal"
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
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">
                    Final score
                  </p>
                  <p className="text-2xl font-black">
                    {evaluationResult.finalScore}%
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">
                    Comprehension
                  </p>
                  <p className="text-2xl font-black">
                    {evaluationResult.comprehensionScore}%
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Key words</p>
                  <p className="text-2xl font-black">
                    {evaluationResult.keywordScore}%
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">
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
  );
};

export default ListeningPage;
