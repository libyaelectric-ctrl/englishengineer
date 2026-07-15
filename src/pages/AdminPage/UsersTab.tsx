import React from 'react';
import { Users } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  discipline: string;
  level: string;
  elo: number;
  plan: string;
  joinedAt: string;
}

interface UsersTabProps {
  users: UserRecord[];
  onPromote: (id: string) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onPromote }) => {
  return (
    <SectionCard title="Active User Management" icon={Users}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-soft text-[10px] uppercase font-bold text-muted-copy">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Discipline</th>
              <th className="py-3 px-4">CEFR Level</th>
              <th className="py-3 px-4">ELO Score</th>
              <th className="py-3 px-4">Plan Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border-soft hover:bg-surface-hover/30 text-xs"
              >
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="text-[10px] text-muted-copy">{u.email}</p>
                </td>
                <td className="py-3.5 px-4 text-muted-copy">{u.discipline}</td>
                <td className="py-3.5 px-4">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
                    {u.level}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-foreground">
                  {u.elo}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold text-[10px] ${
                      u.plan.includes('Pro')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-surface-hover text-muted-copy'
                    }`}
                  >
                    {u.plan}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {u.id !== 'usr_001' && (
                    <Button
                      variant="ghost"
                      className="h-8 px-2.5 text-[11px]"
                      onClick={() => onPromote(u.id)}
                    >
                      Toggle Plan
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};
