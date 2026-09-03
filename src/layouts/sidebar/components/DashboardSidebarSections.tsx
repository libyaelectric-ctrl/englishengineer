import { BookOpen, Briefcase, Shield, Sparkles, Zap } from 'lucide-react';

import React from 'react';

import { useNavigate } from 'react-router-dom';

interface PlanSectionProps {
  copy: {
    upgrade: string;
    freePlan: string;
    proPlan: string;
    enterprisePlan: string;
    betaNotice: string;
  };
  isFree: boolean;
  navigate: ReturnType<typeof useNavigate>;
}

export const PlanSection: React.FC<PlanSectionProps> = ({ copy, isFree, navigate }) => {
  if (!isFree) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20 rounded-xl mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-foreground">Upgrade to Pro</h4>
          <p className="text-[11px] text-muted-copy mt-0.5">
            Unlock unlimited lessons, AI coaching, and advanced analytics.
          </p>
        </div>
        <button
          onClick={() => navigate('/billing')}
          className="flex-shrink-0 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          {copy.upgrade}
        </button>
      </div>
    </div>
  );
};

interface WorkspaceSectionProps {
  userInitials: string;
  displayName: string;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  userInitials,
  displayName,
}) => {
  return (
    <div className="p-4 bg-surface border border-border-soft rounded-xl mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-[11px] text-muted-copy">Engineer</p>
        </div>
      </div>
    </div>
  );
};

interface ActionsSectionProps {
  navigate: (path: string) => void;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({ navigate }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-copy px-2">
        Quick Actions
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="flex items-center gap-2 p-3 rounded-xl border border-border-soft bg-surface hover:bg-surface-hover transition-colors text-left"
          onClick={() => navigate('/vocabulary')}
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Continue Learning</span>
        </button>
        <button
          className="flex items-center gap-2 p-3 rounded-xl border border-border-soft bg-surface hover:bg-surface-hover transition-colors text-left"
          onClick={() => navigate('/ai')}
        >
          <Sparkles className="h-5 w-5 text-cyan-500" />
          <span className="text-sm font-medium text-foreground">AI Coach</span>
        </button>
        <button
          className="flex items-center gap-2 p-3 rounded-xl border border-border-soft bg-surface hover:bg-surface-hover transition-colors text-left"
          onClick={() => navigate('/tools')}
        >
          <Briefcase className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-foreground">Work Tools</span>
        </button>
        <button
          className="flex items-center gap-2 p-3 rounded-xl border border-border-soft bg-surface hover:bg-surface-hover transition-colors text-left"
          onClick={() => navigate('/placement')}
        >
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-foreground">Placement Test</span>
        </button>
      </div>
    </div>
  );
};
