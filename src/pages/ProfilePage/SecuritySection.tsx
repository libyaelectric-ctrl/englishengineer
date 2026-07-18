import {
  Download,
  ShieldCheck,
  Trash2,
  Lock,
  Shield,
  Key,
  History,
} from 'lucide-react';
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
    className="animate-in fade-in duration-200 space-y-6 font-sans relative"
  >
    {/* Subtle grid pattern background */}
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:16px_16px]" />

    {/* Section: Access Control Terminal */}
    <SectionCard
      title="Security, Privacy & Data"
      subtitle="Local storage data administration, privacy controls, and backup operations"
      icon={ShieldCheck}
    >
      <div className="space-y-6 relative z-10">
        {/* Cloud Sync section */}
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#d9d9e3] pb-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0047bb] flex items-center gap-1.5">
              <Shield className="h-4 w-4" /> Cloud Synced Records
            </span>
            <span className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 px-2 py-0.5 text-[8px] font-mono font-bold text-[#0047bb] uppercase tracking-wider">
              {providerMode === 'supabase'
                ? 'CLOUD-ACTIVE'
                : 'LOCAL-PERSISTENCE'}
            </span>
          </div>
          <CloudSyncStatusPanel providerMode={providerMode} />
        </div>

        {/* Change Password Configuration Card */}
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[#d9d9e3] pb-2">
            <Key className="h-4 w-4 text-[#0047bb]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
              Credential Management
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block">
                Current Password
              </span>
              <div className="relative">
                <input
                  type="password"
                  disabled
                  placeholder="••••••••••••"
                  className="w-full rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] pl-9 pr-3 py-2 text-xs text-foreground outline-none font-bold shadow-sm"
                />
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-copy" />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block">
                New Security Password
              </span>
              <div className="relative">
                <input
                  type="password"
                  disabled
                  placeholder="Configure new credential"
                  className="w-full rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] pl-9 pr-3 py-2 text-xs text-foreground outline-none font-bold shadow-sm"
                />
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-copy" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              disabled
              className="text-[10px] min-h-9 border border-[#d9d9e3] bg-white text-muted-copy font-bold uppercase tracking-wider rounded-[4px] cursor-not-allowed shadow-sm"
            >
              Update Password
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication (2FA) Module */}
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground block">
              Multi-Factor Authentication (MFA)
            </span>
            <span className="text-xs text-muted-copy font-medium block">
              Secure your account using hardware keys or authenticator apps
              (TOTP).
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="rounded-[4px] border border-rose-500/20 bg-rose-500/5 px-2 py-1 text-[8px] font-mono font-bold text-rose-600 uppercase tracking-wider">
              2FA-DISABLED
            </span>
            <Button
              variant="outline"
              disabled
              className="text-[10px] min-h-9 border border-[#d9d9e3] bg-white text-muted-copy font-bold uppercase tracking-wider rounded-[4px] cursor-not-allowed shadow-sm"
            >
              Configure 2FA
            </Button>
          </div>
        </div>

        {/* Active Session Audit Log */}
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#d9d9e3] pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <History className="h-4 w-4 text-[#0047bb]" /> Session Access
              History
            </span>
            <span className="rounded-[4px] bg-[#f3f3fd] border border-[#d9d9e3]/60 px-2 py-0.5 text-[8px] font-mono font-bold text-muted-copy uppercase tracking-wider">
              TOTAL: 1 ACTIVE
            </span>
          </div>

          <div className="space-y-3 font-mono text-[10px] leading-relaxed text-muted-copy divide-y divide-[#d9d9e3]/60">
            <div className="flex justify-between items-center py-2 first:pt-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    Windows Chrome OS (Desktop)
                  </span>
                  <span className="rounded-[4px] bg-success/10 border border-success/20 px-1 text-[8px] font-bold text-success uppercase tracking-wider">
                    SYS-ACTIVE
                  </span>
                </div>
                <span>Session ID: SES-4820a2e0e0129</span>
              </div>
              <div className="text-right">
                <span className="rounded-[4px] bg-[#faf8ff] border border-[#d9d9e3] px-1.5 py-0.5 text-[8px] font-bold text-foreground uppercase tracking-wider block">
                  IP-VERIFIED
                </span>
                <span className="block mt-0.5 text-[8px]">ACTIVE NOW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Local Data backup controls */}
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground block mb-2">
            Local Backups Archive
          </span>
          <p className="text-xs text-muted-copy leading-relaxed mb-4 font-medium">
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
        <div className="rounded-[4px] border border-rose-500/20 bg-rose-500/5 p-5 border-dashed shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-2">
            Destructive Administration Actions
          </span>
          <p className="text-xs text-rose-600/80 leading-relaxed mb-4 font-medium">
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
        <div className="rounded-[4px] border border-warning/30 bg-warning/5 p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-warning block mb-2">
            Reset Learning Progress state
          </span>
          <p className="text-xs text-muted-copy leading-relaxed mb-4 font-medium">
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
                Confirm reset progress
              </Button>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  </section>
);
