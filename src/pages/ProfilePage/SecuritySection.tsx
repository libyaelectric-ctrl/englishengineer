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
  <section id="security" className="animate-in fade-in duration-200 space-y-6">
    <SectionCard
      title="Security, Privacy & Data"
      subtitle="Local storage data administration, privacy controls, and backup operations"
      icon={ShieldCheck}
    >
      <div className="space-y-6">
        {/* Cloud Sync section */}
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block mb-2">
            Cloud Synced Records
          </span>
          <CloudSyncStatusPanel providerMode={providerMode} />
        </div>

        {/* Local Data backup controls */}
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block mb-1">
            Local Backups
          </span>
          <p className="text-xs text-muted-copy leading-5 mb-4 font-medium">
            Export all stored local progress, CEFR stats, and memory logs into a
            portable JSON backup file.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={exportLocalData}
            className="text-xs min-h-9 border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-xs font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Export local data
          </Button>
        </div>

        {/* Destructive Controls */}
        <div className="rounded-[4px] border border-rose-500/20 bg-rose-500/5 p-4 border-dashed shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
            Destructive actions
          </span>
          <p className="text-xs text-rose-600/80 leading-5 mb-4 font-medium">
            Completely erase all study sessions, mistake history, and vocabulary
            data from this local device. This action is irreversible.
          </p>

          {providerMode === 'local' ? (
            <>
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowClearConfirmation((val) => !val)}
                className="text-xs min-h-9 bg-rose-600 hover:bg-rose-500 border border-rose-600 text-white font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear this device
              </Button>

              {showClearConfirmation && (
                <div className="mt-4 rounded-[4px] border border-rose-500/25 bg-white p-4 shadow-sm animate-in fade-in duration-300">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                    Type CLEAR to remove local progress from this browser.
                    <input
                      value={clearConfirmation}
                      onChange={(event) =>
                        setClearConfirmation(event.target.value.toUpperCase())
                      }
                      className="mt-2 min-h-10 w-full rounded-[4px] border border-rose-500/25 bg-white px-3 text-xs text-foreground outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/10 font-bold shadow-sm"
                    />
                  </label>
                  <Button
                    type="button"
                    variant="danger"
                    className="mt-3 text-xs bg-rose-600 hover:bg-rose-500 border border-rose-600 text-white font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm min-h-9 px-4 flex items-center justify-center"
                    disabled={clearConfirmation !== 'CLEAR'}
                    onClick={() => void clearLocalData()}
                  >
                    Confirm local data removal
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-copy font-medium">
              Cloud account administration is managed via Supabase. Local data
              clearing is only available in Guest/Local profile modes.
            </p>
          )}
        </div>

        {/* Learning Progress Reset - Available for all users */}
        <div className="rounded-[4px] border border-warning/30 bg-warning/5 p-4 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-warning block mb-1">
            Reset Learning Progress
          </span>
          <p className="text-xs text-muted-copy leading-5 mb-4 font-medium">
            Reset all learning progress, vocabulary mastery, grammar practice,
            study sessions, and achievements to zero. Your account stays intact.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowClearConfirmation((val) => !val)}
            className="text-xs min-h-9 border border-warning/40 bg-white text-warning hover:bg-warning/5 font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Reset Progress
          </Button>

          {showClearConfirmation && (
            <div className="mt-4 rounded-[4px] border border-warning/30 bg-white p-4 shadow-sm animate-in fade-in duration-300">
              <label className="text-[10px] font-bold uppercase tracking-wider text-warning block">
                Type CLEAR to reset all learning progress.
                <input
                  value={clearConfirmation}
                  onChange={(event) =>
                    setClearConfirmation(event.target.value.toUpperCase())
                  }
                  className="mt-2 min-h-10 w-full rounded-[4px] border border-warning/30 bg-white px-3 text-xs text-foreground outline-none focus:border-warning focus:ring-1 focus:ring-warning/10 font-bold shadow-sm"
                />
              </label>
              <Button
                type="button"
                variant="danger"
                className="mt-3 text-xs bg-rose-600 hover:bg-rose-500 border border-rose-600 text-white font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm min-h-9 px-4 flex items-center justify-center"
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
