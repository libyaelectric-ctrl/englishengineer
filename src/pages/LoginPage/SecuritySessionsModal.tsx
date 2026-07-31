import { CheckCircle2, KeyRound, Laptop, LogOut, ShieldCheck, Smartphone, X } from 'lucide-react';

import { useState } from 'react';

interface SecuritySessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeviceSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile';
}

const INITIAL_SESSIONS: DeviceSession[] = [
  {
    id: 's1',
    device: 'Chrome 124 (Windows 11)',
    location: 'Istanbul, Turkey',
    ip: '176.234.12.98',
    lastActive: 'Active now',
    isCurrent: true,
    type: 'desktop',
  },
  {
    id: 's2',
    device: 'Safari (iPhone 15 Pro)',
    location: 'Dubai, UAE',
    ip: '92.98.140.21',
    lastActive: '2 hours ago',
    isCurrent: false,
    type: 'mobile',
  },
  {
    id: 's3',
    device: 'Edge (MacBook Pro M3)',
    location: 'Riyadh, KSA',
    ip: '185.12.89.44',
    lastActive: 'Yesterday',
    isCurrent: false,
    type: 'desktop',
  },
];

export const SecuritySessionsModal = ({ isOpen, onClose }: SecuritySessionsModalProps) => {
  const [sessions, setSessions] = useState<DeviceSession[]>(INITIAL_SESSIONS);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [revokedNotice, setRevokedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRevokeOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setRevokedNotice('All other active sessions have been successfully logged out.');
    setTimeout(() => setRevokedNotice(null), 3000);
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      setShowQrModal(true);
    } else {
      setTwoFactorEnabled(false);
      setRevokedNotice('2FA protection disabled.');
      setTimeout(() => setRevokedNotice(null), 3000);
    }
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      setTwoFactorEnabled(true);
      setShowQrModal(false);
      setTotpCode('');
      setRevokedNotice('2FA Authenticator protection enabled successfully!');
      setTimeout(() => setRevokedNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-5 relative light-sweep-container overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Security & Active Sessions (SOC-2)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notice Alert */}
        {revokedNotice && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{revokedNotice}</span>
          </div>
        )}

        {/* ITEM 27: 2FA TOTP Toggle */}
        <div className="rounded-xl border border-border-soft bg-background/80 p-3.5 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
              <KeyRound className="h-3.5 w-3.5 text-primary" /> 2FA Authenticator Protection (TOTP)
            </div>
            <p className="text-[10px] text-muted-copy">
              Require 6-digit TOTP code from Google Authenticator / 1Password on sign-in.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle2FA}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 border ${
              twoFactorEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600'
                : 'bg-primary border-primary text-primary-foreground hover:bg-primary-hover'
            }`}
          >
            {twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
          </button>
        </div>

        {/* 2FA Setup QR Modal Overlay */}
        {showQrModal && (
          <form
            onSubmit={handleConfirm2FA}
            className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3 animate-in fade-in"
          >
            <div className="text-xs font-bold text-primary flex items-center justify-between">
              <span>Scan QR Code with Authenticator App</span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-muted-copy hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-center p-3 bg-white rounded-lg border w-36 h-36 mx-auto">
              <div className="text-[10px] font-mono font-bold text-black text-center leading-tight">
                [QR CODE PLACEHOLDER]
                <br />
                <span className="text-[8px] text-gray-500">ENGVOX-SEC-KEY</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-copy uppercase">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full h-10 rounded-lg border border-border-soft bg-background text-center font-mono text-base font-bold text-foreground focus:border-primary outline-none"
                placeholder="123456"
              />
            </div>
            <button
              type="submit"
              disabled={totpCode.length !== 6}
              className="w-full h-10 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer"
            >
              Verify & Activate 2FA
            </button>
          </form>
        )}

        {/* ITEM 26: Active Devices List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Active Session Devices ({sessions.length})</span>
            {sessions.length > 1 && (
              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-3 w-3" /> Revoke Other Sessions
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition ${
                  s.isCurrent
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border-soft bg-background/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {s.type === 'desktop' ? (
                    <Laptop className="h-4 w-4 text-primary" />
                  ) : (
                    <Smartphone className="h-4 w-4 text-primary" />
                  )}
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <span>{s.device}</span>
                      {s.isCurrent && (
                        <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[8px] font-bold text-emerald-600 font-mono">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-copy">
                      {s.location} • <span className="font-mono">{s.ip}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-copy font-mono">
                  {s.lastActive}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Close Security Settings
          </button>
        </div>
      </div>
    </div>
  );
};
