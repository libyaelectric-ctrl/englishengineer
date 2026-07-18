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

const buildEditValues = (
  displayName: string | undefined,
  profile: UserLearningProfile | null
) => {
  const name = splitDisplayName(displayName);
  if (!profile) {
    return { ...name, profession: '', track: 'electrical', subdomain: 'low-voltage', industry: '', lang: 'en' as const, goals: [] };
  }
  return {
    firstName: name.firstName,
    lastName: name.lastName,
    profession: profile.professionId ?? '',
    track: profile.professionalTrack ?? 'electrical',
    subdomain: profile.electricalSubdomain ?? 'low-voltage',
    industry: profile.industryId ?? '',
    lang: (profile.interfaceLanguage ?? 'en') as 'en' | 'tr',
    goals: profile.communicationGoals ?? [],
  };
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
    const values = buildEditValues(currentUser?.displayName, profile);
    setEditFirstName(values.firstName);
    setEditLastName(values.lastName);
    setEditProfession(values.profession);
    setEditTrack(values.track);
    setEditSubdomain(values.subdomain);
    setEditIndustry(values.industry);
    setEditLang(values.lang);
    setEditGoals(values.goals);
    setIsEditMode(true);
    setError(null);
    setMessage(null);
  };

  const savePreferences = (userId: string) => {
    LearningProfileRepository.updatePreferences(userId, {
      professionId: (editProfession as ProfessionId) || null,
      professionalTrack:
        (editTrack as UserLearningProfile['professionalTrack']) || undefined,
      electricalSubdomain:
        (editSubdomain as UserLearningProfile['electricalSubdomain']) || undefined,
      industryId: (editIndustry as UserLearningProfile['industryId']) || null,
      interfaceLanguage: editLang,
      communicationGoals: editGoals as UserLearningProfile['communicationGoals'],
    });
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
      savePreferences(currentUser?.id ?? 'local-user');
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
