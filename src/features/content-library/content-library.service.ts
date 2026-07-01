import {
  PROFESSIONAL_LISTENING_LESSONS,
  PROFESSIONAL_ROLEPLAY_SCENARIOS,
  PROFESSIONAL_WRITING_TASKS,
} from './content-library.data';
import type { CefrLevel } from '@/features/level-system';

export const ProfessionalContentLibrary = {
  listening: PROFESSIONAL_LISTENING_LESSONS,
  roleplay: PROFESSIONAL_ROLEPLAY_SCENARIOS,
  writing: PROFESSIONAL_WRITING_TASKS,
  getForLevel(level: CefrLevel) {
    return {
      listening: PROFESSIONAL_LISTENING_LESSONS.filter(
        (item) => item.cefrLevel === level
      ),
      roleplay: PROFESSIONAL_ROLEPLAY_SCENARIOS.filter(
        (item) => item.level === level
      ),
      writing: PROFESSIONAL_WRITING_TASKS.filter(
        (item) => item.level === level
      ),
    };
  },
};
