import {
  ELECTRICAL_SUBDOMAINS,
  INDUSTRIES,
  PROFESSIONAL_TRACKS,
} from '@/features/profile/profile.preferences';
import type {
  ElectricalSubdomain,
  IndustryId,
  InterfaceLanguage,
  ProfessionalTrack,
} from '@/features/profile/profile.types';
import { LocalizationService } from '@/features/localization';

type RoleStepProps = {
  professionalTrack: ProfessionalTrack;
  setProfessionalTrack: (t: ProfessionalTrack) => void;
  electricalSubdomain: ElectricalSubdomain;
  setElectricalSubdomain: (e: ElectricalSubdomain) => void;
  industryId: IndustryId | '';
  setIndustryId: (id: IndustryId | '') => void;
  interfaceLanguage: InterfaceLanguage;
};

export const RoleStep = ({
  professionalTrack,
  setProfessionalTrack,
  electricalSubdomain,
  setElectricalSubdomain,
  industryId,
  setIndustryId,
  interfaceLanguage,
}: RoleStepProps) => (
  <section>
    <h2 className="text-xl font-medium">Tell us where you work</h2>
    <p className="mt-2 text-sm text-muted-copy">
      {LocalizationService.translate('onboarding.roleContext', interfaceLanguage)}
    </p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium sm:col-span-2">
        {LocalizationService.translate(
          'onboarding.professionalTrack',
          interfaceLanguage
        )}
        <select
          value={professionalTrack}
          onChange={(event) =>
            setProfessionalTrack(event.target.value as ProfessionalTrack)
          }
          className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
        >
          {PROFESSIONAL_TRACKS.map((item) => (
            <option key={item.id} value={item.id} disabled={!item.available}>
              {item.label}
              {item.available ? '' : ' · Coming Soon'}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {LocalizationService.translate(
          'onboarding.electricalFocus',
          interfaceLanguage
        )}
        <select
          value={electricalSubdomain}
          onChange={(event) =>
            setElectricalSubdomain(event.target.value as ElectricalSubdomain)
          }
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
        {LocalizationService.translate('onboarding.industry', interfaceLanguage)}
        <select
          value={industryId}
          onChange={(event) =>
            setIndustryId(event.target.value as IndustryId)
          }
          className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
        >
          <option value="">Select industry</option>
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
