import { useReducer } from 'react';
import { useAuthStore } from '@/features/auth';
import {
  LearningProfileRepository,
  type ProfessionId,
  type UserLearningProfile,
} from '@/features/profile';
import { useLocalizationStore } from '@/features/localization';
import { editReducer, type ProfileEditState } from './ProfilePageReducer';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const splitDisplayName = (displayName = '') => {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
};

export const useProfileEdit = (
  profile: UserLearningProfile | null,
  setMessage: (v: string | null) => void,
  setError: (v: string | null) => void
) => {
  const { currentUser, updateProfile } = useAuthStore();
  const language = useLocalizationStore((s) => s.language);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);

  const [edit, dispatchEdit] = useReducer(editReducer, {
    isEditMode: false,
    firstName: '',
    lastName: '',
    profession: '',
    track: '',
    subdomain: '',
    industry: '',
    lang: 'en' as 'en' | 'tr',
    goals: [] as string[],
  } satisfies ProfileEditState);

  const {
    isEditMode,
    firstName: editFirstName,
    lastName: editLastName,
    profession: editProfession,
    track: editTrack,
    subdomain: editSubdomain,
    industry: editIndustry,
    lang: editLang,
    goals: editGoals,
  } = edit;

  const setIsEditMode = (v: boolean) =>
    dispatchEdit({ type: 'SET_EDIT_MODE', value: v });
  const setEditFirstName = (v: string) =>
    dispatchEdit({ type: 'SET_FIRST_NAME', value: v });
  const setEditLastName = (v: string) =>
    dispatchEdit({ type: 'SET_LAST_NAME', value: v });
  const setEditProfession = (v: string) =>
    dispatchEdit({ type: 'SET_PROFESSION', value: v });
  const setEditTrack = (v: string) =>
    dispatchEdit({ type: 'SET_TRACK', value: v });
  const setEditSubdomain = (v: string) =>
    dispatchEdit({ type: 'SET_SUBDOMAIN', value: v });
  const setEditIndustry = (v: string) =>
    dispatchEdit({ type: 'SET_INDUSTRY', value: v });
  const setEditLang = (v: 'en' | 'tr') =>
    dispatchEdit({ type: 'SET_LANG', value: v });
  const setEditGoals = (v: string[]) =>
    dispatchEdit({ type: 'SET_GOALS', value: v });

  const enterEditMode = () => {
    const name = splitDisplayName(currentUser?.displayName);
    setEditFirstName(name.firstName);
    setEditLastName(name.lastName);
    setEditProfession(profile?.professionId || '');
    setEditTrack(profile?.professionalTrack || 'electrical');
    setEditSubdomain(profile?.electricalSubdomain || 'low-voltage');
    setEditIndustry(profile?.industryId || '');
    setEditLang(profile?.interfaceLanguage || 'en');
    setEditGoals(profile?.communicationGoals || []);
    setIsEditMode(true);
    setError(null);
    setMessage(null);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const first = editFirstName.trim();
    const last = editLastName.trim();
    if (!first || !last) {
      setError('First and last name are required.');
      return;
    }
    try {
      setError(null);
      await updateProfile({ displayName: `${first} ${last}` });
      LearningProfileRepository.updatePreferences(
        currentUser?.id ?? 'local-user',
        {
          professionId: (editProfession as ProfessionId) || null,
          professionalTrack:
            (editTrack as UserLearningProfile['professionalTrack']) ||
            undefined,
          electricalSubdomain:
            (editSubdomain as UserLearningProfile['electricalSubdomain']) ||
            undefined,
          industryId:
            (editIndustry as UserLearningProfile['industryId']) || null,
          interfaceLanguage: editLang,
          communicationGoals:
            editGoals as UserLearningProfile['communicationGoals'],
        }
      );
      if (editLang !== language) setLanguage(editLang);
      setMessage('Profile overview updated successfully.');
      setIsEditMode(false);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to update profile overview.'));
    }
  };

  return {
    isEditMode,
    editFirstName,
    editLastName,
    editProfession,
    editTrack,
    editSubdomain,
    editIndustry,
    editLang,
    editGoals,
    setEditFirstName,
    setEditLastName,
    setEditProfession,
    setEditTrack,
    setEditSubdomain,
    setEditIndustry,
    setEditLang,
    setEditGoals,
    setIsEditMode,
    enterEditMode,
    handleSaveProfile,
  };
};
