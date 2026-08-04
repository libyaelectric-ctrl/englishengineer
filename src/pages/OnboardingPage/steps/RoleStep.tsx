import { useLocalizationStore } from '@/features/localization';
import {
  ELECTRICAL_SUBDOMAINS,
  INDUSTRIES,
  PROFESSIONAL_TRACKS,
} from '@/features/profile/profile.preferences';
import type {
  ElectricalSubdomain,
  IndustryId,
  ProfessionalTrack,
} from '@/features/profile/profile.types';

type RoleStepProps = {
  professionalTrack: ProfessionalTrack;
  setProfessionalTrack: (t: ProfessionalTrack) => void;
  electricalSubdomain: ElectricalSubdomain;
  setElectricalSubdomain: (e: ElectricalSubdomain) => void;
  industryId: IndustryId | '';
  setIndustryId: (id: IndustryId | '') => void;
};

export const RoleStep = ({
  professionalTrack,
  setProfessionalTrack,
  electricalSubdomain,
  setElectricalSubdomain,
  industryId,
  setIndustryId,
}: RoleStepProps) => {
  const { translate } = useLocalizationStore();

  return (
    <section>
      <h2 className="text-xl font-medium">{translate('onboarding.whereWork')}</h2>
      <p className="mt-2 text-sm text-muted-copy">{translate('onboarding.tailorDesc')}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">
          {translate('onboarding.professionalTrack')}
          <select
            value={professionalTrack}
            onChange={(event) => setProfessionalTrack(event.target.value as ProfessionalTrack)}
            className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
          >
            {PROFESSIONAL_TRACKS.map((item) => (
              <option key={item.id} value={item.id} disabled={!item.available}>
                {item.label}
                {item.available ? '' : ` · ${translate('onboarding.comingSoon')}`}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          {translate('onboarding.electricalFocus')}
          <select
            value={electricalSubdomain}
            onChange={(event) => setElectricalSubdomain(event.target.value as ElectricalSubdomain)}
            className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
          >
            {ELECTRICAL_SUBDOMAINS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          {translate('onboarding.industry')}
          <select
            value={industryId}
            onChange={(event) => setIndustryId(event.target.value as IndustryId)}
            className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
          >
            <option value="">{translate('onboarding.selectIndustry')}</option>
            {INDUSTRIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};
