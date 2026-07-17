import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface AdminLoginProps {
  username: string;
  password: string;
  loginError: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  username,
  password,
  loginError,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border-soft bg-surface p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-copy mt-1">
              Authorized personnel only
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="text-xs font-bold text-muted-copy"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-soft bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="text-xs font-bold text-muted-copy"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-soft bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            {loginError && (
              <p className="text-xs font-medium text-danger">{loginError}</p>
            )}
            <Button type="submit" className="w-full">
              <Shield className="h-4 w-4" /> Access Admin Panel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
