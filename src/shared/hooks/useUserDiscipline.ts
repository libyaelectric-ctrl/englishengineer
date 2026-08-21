import { useMemo } from 'react';

import { useAuthStore } from '@/features/auth';
import { resolveDefaultDiscipline } from '@/features/learning-path';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import type { CefrLevel } from '@/shared/types/domain.types';
import { getBaseCefrLevel } from '@/shared/utils/profile.utils';

export function useUserDiscipline() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const profile = useMemo(
    () => LearningProfileRepository.getProfile(currentUser?.id || 'local-user'),
    [currentUser?.id]
  );

  const discipline: EngineeringDiscipline = resolveDefaultDiscipline(
    (currentUser?.engineeringDiscipline as EngineeringDiscipline) || profile?.discipline
  );

  const disciplineMeta = DISCIPLINE_META[discipline];

  const userName = currentUser?.displayName ?? '';

  const cefrLevel: CefrLevel = useMemo(() => {
    const band = profile?.skills?.reading?.cefrBand;
    return band ? getBaseCefrLevel(band) : 'A1';
  }, [profile?.skills?.reading?.cefrBand]);

  return {
    currentUser,
    discipline,
    disciplineMeta,
    profile,
    userName,
    cefrLevel,
  } as const;
}
