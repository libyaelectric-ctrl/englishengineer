import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  HelpCircle,
  PenLine,
  Search,
  Target,
  TriangleAlert,
} from 'lucide-react';
import {
  getGrammarReviewReason,
  getMissingGrammarTransferEvidence,
} from '@/features/grammar';
import { CEFR_LEVELS } from '@/features/level-system';
import { Button } from '@/shared/components/Button';
import {
  getModuleLabel,
  getPracticeCount,
  getTransferCount,
  compact,
} from './GrammarPage/GrammarPageHelpers';
import { SectionHeading, StatusPill, LessonBlock, MasteryPill } from './GrammarPage/GrammarPageComponents';
import { useGrammarPage } from './GrammarPage/hooks/useGrammarPage';

const GrammarPage = () => {
  const {
    level, rules, grammarPoolIds, query, setQuery, lessonStripRef,
    quizOpen, setQuizOpen, hintOpen, setHintOpen, quizAnswers, setQuizAnswers,
    levelCounts, totalGrammarLessons, selectedRule, selectedProgress,
    pathGroups, linkedVocabulary, nextLesson, reviewTargets, masteredCount,
    selectRule, scrollLessonStrip, recordUsage, quizItems,
  } = useGrammarPage();

  const selectedStatus = selectedProgress ? (selectedProgress.reviewStatus === 'Strong' ? 'Mastered' as const : selectedProgress.correctUsages >= 3 && selectedProgress.strength >= 70 ? 'Needs Reading/Writing' as const : 'Practicing' as const) : 'New' as const;
  const selectedModule = selectedRule ? getModuleLabel(selectedRule.grammarCategory) : '';

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 -mx-4 border-b border-border-soft bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{level} Grammar Path</p>
            <h1 className="mt-0.5 truncate text-sm font-black tracking-tight sm:text-base">Learn grammar by building real engineering sentences</h1>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CEFR_LEVELS.map((cefrLevel) => (
              <button key={cefrLevel} type="button" className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${cefrLevel === level ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border-soft bg-surface text-muted-copy hover:text-foreground'}`}>
                <span>{cefrLevel}</span>
                <span className="text-[10px] opacity-60">{levelCounts[cefrLevel]}</span>
              </button>
            ))}
          </div>
          <label className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-10 w-full rounded-lg border border-border-soft bg-surface px-10 text-sm outline-none focus:border-primary/50" placeholder="Search..." />
          </label>
        </div>

        {/* Lesson strip */}
        <div className="mt-3 rounded-lg border border-border-soft bg-surface p-2">
          <div className="flex items-center">
            <button type="button" onClick={() => scrollLessonStrip('left')} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-copy hover:text-foreground" aria-label="Scroll lessons left"><ChevronLeft className="h-4 w-4" /></button>
            <div ref={lessonStripRef} className="flex flex-1 gap-1.5 overflow-x-auto scroll-smooth px-1 pb-1">
              {pathGroups.length === 0 ? (
                <p className="px-2 py-3 text-xs text-muted-copy">No lessons match this filter.</p>
              ) : (() => {
                let lessonNum = 0;
                return pathGroups.map((group) => {
                  const startNum = lessonNum + 1;
                  lessonNum += group.entries.length;
                  return (
                    <div key={group.module} className="flex shrink-0 items-stretch gap-1.5">
                      <div className="flex w-36 shrink-0 flex-col justify-center rounded-lg border border-border-soft bg-background px-2 py-1.5">
                        <span className="line-clamp-2 text-xs font-black leading-4">{group.module}</span>
                      </div>
                      {group.entries.map(({ rule, status }, idx) => {
                        const selected = rule.id === selectedRule?.id;
                        return (
                          <button key={rule.id} type="button" onClick={() => selectRule(rule.id)} className={`flex w-44 shrink-0 flex-col justify-between rounded-lg border px-2 py-1.5 text-left transition-colors ${selected ? 'border-foreground bg-foreground text-background' : 'border-border-soft bg-background hover:border-primary/40'}`}>
                            <span className="line-clamp-2 text-xs font-black leading-4">
                              <span className="mr-1 text-[10px] opacity-60">{startNum + idx}.</span>
                              {rule.title}
                            </span>
                            <span className="mt-1 flex items-center justify-between gap-1">
                              {status === 'Mastered' ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" /> : <Circle className="h-3.5 w-3.5 shrink-0 text-muted-copy" />}
                              <StatusPill status={status} compact />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
            <button type="button" onClick={() => scrollLessonStrip('right')} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-copy hover:text-foreground" aria-label="Scroll lessons right"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mt-6 space-y-5">
        <section className="min-w-0 space-y-4">
          {selectedRule && selectedProgress ? (
            <>
              <div className="min-w-0 rounded-lg border border-border-soft bg-surface p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary">{selectedModule}</p>
                    <h2 className="mt-0.5 break-words text-base font-black">{selectedRule.ruleTitle || selectedRule.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-copy">{compact(selectedRule.engineeringUseCase, selectedRule.languageFunction)}</p>
                  </div>
                  <StatusPill status={selectedStatus} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {([
                  ['This Level', rules.length],
                  ['Total Map', totalGrammarLessons],
                  ['Mastered', masteredCount],
                  ['Pool', grammarPoolIds.length],
                ] as const).map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-center">
                      <p className="text-base font-black">{value}</p>
                      <p className="text-[10px] font-bold uppercase text-muted-copy">{label}</p>
                    </div>
                  ))}
              </div>

              <div className="rounded-lg border border-border-soft bg-surface p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">Mastery</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <MasteryPill label="Practice" value={`${getPracticeCount(selectedProgress)}/3`} complete={getPracticeCount(selectedProgress) >= 3} />
                    <MasteryPill label="Reading" value={selectedProgress.skillEvidence.reading ? `${selectedProgress.skillEvidence.reading.score}%` : 'Missing'} complete={Boolean(selectedProgress.skillEvidence.reading)} />
                    <MasteryPill label="Writing" value={selectedProgress.skillEvidence.writing ? `${selectedProgress.skillEvidence.writing.score}%` : 'Missing'} complete={Boolean(selectedProgress.skillEvidence.writing)} />
                    <MasteryPill label="R/W" value={`${getTransferCount(selectedProgress)}/2`} complete={getTransferCount(selectedProgress) >= 2} />
                  </div>
                  {getMissingGrammarTransferEvidence(selectedProgress).length > 0 && (
                    <span className="rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 text-[10px] font-semibold text-warning">
                      Missing: {getMissingGrammarTransferEvidence(selectedProgress).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <LessonBlock icon={Target} title="Today's Objective" body={`Use "${selectedRule.structure}" to ${selectedRule.languageFunction.toLowerCase()} in a real engineering context.`} />
              <LessonBlock icon={BookOpen} title="Why This Matters" body="Grammar is the bridge between the words you know and the message you need to produce. This lesson helps you turn vocabulary into a clear site sentence, report sentence, or professional reply." />

              <div className="rounded-lg border border-border-soft bg-surface p-4">
                <SectionHeading title="Words You Will Use Today" subtitle="Grammar should reuse vocabulary before it introduces new language." />
                {linkedVocabulary.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {linkedVocabulary.map((item) => (
                      <span key={`${item.tag}-${item.term}`} className="rounded-full border border-success/30 bg-success/5 px-2.5 py-0.5 text-[11px] font-bold text-success">{item.term}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-copy">No confirmed Vocabulary match yet. This lesson stays in Grammar until matching vocabulary is available.</p>
                )}
              </div>

              <div className="rounded-lg border border-border-soft bg-surface p-4">
                <SectionHeading title="Teacher Explanation" subtitle="Learn the use, not only the grammar name." />
                <p className="mt-2 text-xs leading-5">{compact(selectedRule.explanation, selectedRule.definition)}</p>
                <p className="mt-2 rounded-lg border border-border-soft bg-background p-3 text-xs leading-5 text-muted-copy">Turkish speaker note: {selectedRule.turkishExplanation}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Structure</p>
                  <p className="mt-2 break-words font-mono text-sm font-black">{selectedRule.structure}</p>
                  <p className="mt-2 break-words text-xs text-muted-copy">Target output: {selectedRule.minimumUserOutput}</p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-warning">Guided Practice</p>
                  <p className="mt-2 break-words text-xs font-bold leading-5">{selectedRule.taskPromptTemplate}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border-soft bg-surface p-4">
                <SectionHeading title="Examples" subtitle="Read the pattern before you try to produce it." />
                <div className="mt-2 grid gap-2">
                  {selectedRule.examples.map((example, index) => (
                    <div key={`${example.english}-${index}`} className="rounded-lg border border-border-soft bg-background p-3">
                      <p className="break-words text-xs font-bold">{example.english}</p>
                      <p className="mt-0.5 break-words text-[11px] text-muted-copy">{example.turkish}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">Common Turkish Mistake</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="break-words text-xs font-bold text-rose-900">{selectedRule.badExampleEnglish}</p>
                    <p className="mt-1 break-words text-xs leading-5 text-rose-800">{selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes}</p>
                  </div>
                  <div className="rounded-lg border border-success/30 bg-white p-3">
                    <p className="text-[11px] font-bold uppercase text-success">Better</p>
                    <p className="mt-1 break-words text-xs font-bold">{selectedRule.correctedExampleEnglish}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border-soft bg-surface p-4">
                <SectionHeading title="Practice" subtitle="Save honest evidence. Mastery also needs Reading and Writing use." />
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Button onClick={() => recordUsage(true)}><CheckCircle2 className="h-3.5 w-3.5" /> Used Correctly</Button>
                  <Button variant="outline" onClick={() => recordUsage(false)}><TriangleAlert className="h-3.5 w-3.5" /> Needs Review</Button>
                  <Button variant="outline" onClick={() => { setQuizOpen((o) => !o); setQuizAnswers({}); }}><HelpCircle className="h-3.5 w-3.5" /> Mini Quiz</Button>
                  <Button variant="outline" onClick={() => setHintOpen((v) => !v)}><BookOpen className="h-3.5 w-3.5" /> Hint</Button>
                </div>
                {hintOpen && <p className="mt-3 rounded-lg border border-border-soft bg-background p-3 text-xs leading-5 text-muted-copy">{getGrammarReviewReason(selectedProgress)}</p>}
                {quizOpen && (
                  <div className="mt-3 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    {quizItems.map((item, qi) => (
                      <div key={item.question}>
                        <p className="text-xs font-bold">{qi + 1}. {item.question}</p>
                        <div className="mt-1.5 grid gap-1.5">
                          {item.choices.map((choice, ci) => {
                            const letter = String.fromCharCode(65 + ci);
                            const selected = quizAnswers[qi] === letter;
                            const revealed = Object.keys(quizAnswers).length === 3;
                            const correct = ci === item.correct;
                            return (
                              <button key={`${item.question}-${choice}`} type="button" disabled={revealed} onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: letter }))}
                                className={`break-words rounded-lg border p-2 text-left text-[11px] font-semibold transition-colors ${revealed ? (correct ? 'border-success bg-success/10' : selected ? 'border-rose-300 bg-rose-50' : 'border-border-soft bg-surface opacity-60') : (selected ? 'border-primary bg-primary/10' : 'border-border-soft bg-surface hover:border-primary/30')}`}>
                                <span className="mr-1.5 font-black">{letter}.</span>{choice}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {linkedVocabulary.length > 0 && (
                <div className="rounded-lg border border-border-soft bg-surface p-4">
                  <SectionHeading title="Use It in Skills" subtitle="Use this lesson in Reading and Writing to prove mastery." />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRule.skillUse.includes('reading') && <Link to="/reading" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border-soft bg-background px-3 text-xs font-bold hover:border-primary/40"><FileText className="h-3 w-3" /> Reading</Link>}
                    {selectedRule.skillUse.includes('writing') && <Link to="/writing" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border-soft bg-background px-3 text-xs font-bold hover:border-primary/40"><PenLine className="h-3 w-3" /> Writing</Link>}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-border-soft bg-surface p-6 text-center text-xs text-muted-copy">Select a grammar lesson to begin.</div>
          )}
        </section>

        {selectedRule && nextLesson && (
          <div className="rounded-lg border border-border-soft bg-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">Next Step</p>
            <button type="button" onClick={() => selectRule(nextLesson.id)} className="mt-2 flex w-full items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-left hover:bg-primary/10">
              <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{nextLesson.title}</span>
                <span className="text-[11px] text-muted-copy">{getModuleLabel(nextLesson.grammarCategory)}</span>
              </span>
            </button>
          </div>
        )}

        {reviewTargets.length > 0 && (
          <div className="rounded-lg border border-border-soft bg-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">Review Queue</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {reviewTargets.map(({ rule, status }) => (
                <button key={rule.id} type="button" onClick={() => selectRule(rule.id)} className="flex shrink-0 items-center gap-2 rounded-lg border border-border-soft bg-background px-3 py-2 text-left hover:border-warning/40">
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-warning" />
                  <span className="truncate text-xs font-bold">{rule.title}</span>
                  <StatusPill status={status} compact />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GrammarPage;
