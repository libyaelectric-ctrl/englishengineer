import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import { CloudSyncStatusPanel } from '@/features/auth';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';

interface SecuritySectionProps {
  providerMode: 'local' | 'supabase';
  showClearConfirmation: boolean;
  setShowClearConfirmation: (
    show: boolean | ((prev: boolean) => boolean)
  ) => void;
  clearConfirmation: string;
  setClearConfirmation: (val: string) => void;
  exportLocalData: () => void;
  clearLocalData: () => void;
  resetLearningProgress: () => void;
}

export const SecuritySection = ({
  providerMode,
  showClearConfirmation,
  setShowClearConfirmation,
  clearConfirmation,
  setClearConfirmation,
  exportLocalData,
  clearLocalData,
  resetLearningProgress,
}: SecuritySectionProps) => (
  <section
    id="security"
    className="animate-in fade-in duration-200 max-h-[calc(100vh-12rem)] overflow-y-auto"
  >
    <SectionCard
      title="Security, Privacy & Data"
      subtitle="Local storage data administration, privacy controls, and backup operations"
      icon={ShieldCheck}
    >
      <div className="space-y-6">
        {/* Cloud Sync section */}
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy block mb-2">
            Cloud Synced Records
          </span>
          <CloudSyncStatusPanel providerMode={providerMode} />
        </div>

        {/* Local Data backup controls */}
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy block mb-1">
            Local Backups
          </span>
          <p className="text-xs text-muted-copy leading-5 mb-4">
            Export all stored local progress, CEFR stats, and memory logs into a
            portable JSON backup file.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={exportLocalData}
            className="text-xs min-h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Export local data
          </Button>
        </div>

        {/* Destructive Controls */}
        <div className="rounded-xl border border-error/20 bg-error/5 p-4 border-dashed">
          <span className="text-[9px] font-medium uppercase tracking-wider text-error block mb-1">
            Destructive actions
          </span>
          <p className="text-xs text-error/80 leading-5 mb-4">
            Completely erase all study sessions, mistake history, and vocabulary
            data from this local device. This action is irreversible.
          </p>

          {providerMode === 'local' ? (
            <>
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowClearConfirmation((val) => !val)}
                className="text-xs min-h-9"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear this device
              </Button>

              {showClearConfirmation && (
                <div className="mt-4 rounded-xl border border-error/25 bg-surface p-4">
                  <label className="text-xs font-medium text-error">
                    Type CLEAR to remove local progress from this browser.
                    <input
                      value={clearConfirmation}
                      onChange={(event) =>
                        setClearConfirmation(event.target.value.toUpperCase())
                      }
                      className="mt-2 min-h-10 w-full rounded-lg border border-error/25 bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-error"
                    />
                  </label>
                  <Button
                    type="button"
                    variant="danger"
                    className="mt-3 text-xs"
                    disabled={clearConfirmation !== 'CLEAR'}
                    onClick={() => void clearLocalData()}
                  >
                    Confirm local data removal
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-copy">
              Cloud account administration is managed via Supabase. Local data
              clearing is only available in Guest/Local profile modes.
            </p>
          )}
        </div>

        {/* Learning Progress Reset - Available for all users */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <span className="text-[9px] font-medium uppercase tracking-wider text-warning block mb-1">
            Reset Learning Progress
          </span>
          <p className="text-xs text-muted-copy leading-5 mb-4">
            Reset all learning progress, vocabulary mastery, grammar practice,
            study sessions, and achievements to zero. Your account stays intact.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowClearConfirmation((val) => !val)}
            className="text-xs min-h-9 border-warning/40 text-warning hover:bg-warning/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Reset Progress
          </Button>

          {showClearConfirmation && (
            <div className="mt-4 rounded-xl border border-warning/30 bg-surface p-4">
              <label className="text-xs font-medium text-warning">
                Type CLEAR to reset all learning progress.
                <input
                  value={clearConfirmation}
                  onChange={(event) =>
                    setClearConfirmation(event.target.value.toUpperCase())
                  }
                  className="mt-2 min-h-10 w-full rounded-lg border border-warning/30 bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-warning"
                />
              </label>
              <Button
                type="button"
                variant="danger"
                className="mt-3 text-xs"
                disabled={clearConfirmation !== 'CLEAR'}
                onClick={() => void resetLearningProgress()}
              >
                Confirm Reset
              </Button>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  </section>
);
