/**
 * Package & module system for discipline-based vocabulary access.
 *
 * Flow:
 *   1. User selects a discipline + interface language during onboarding
 *   2. Base modules (Vocabulary, Grammar) are included for free
 *   3. Add-on modules (Speaking, Listening, Reading, Writing) can be purchased
 *   4. Each module's content is filtered by the selected discipline
 */
import type { SkillName } from '../types/domain.types';
import type { EngineeringDiscipline } from './engineering-disciplines';

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

/** Skill modules that map to the 6 core learning areas. */
export const BASE_MODULES: SkillName[] = ['vocabulary', 'grammar'];
export const ADDON_MODULES: SkillName[] = ['reading', 'writing', 'listening', 'speaking'];

export type ModuleType = 'base' | 'addon';
export type ModuleId = SkillName;

export interface ModuleDefinition {
  id: ModuleId;
  type: ModuleType;
  /** Price multiplier (0 = free/included). */
  priceMultiplier: number;
  /** Whether this module is available for the given discipline. */
  available: boolean;
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export type PackageTier = 'free' | 'pro' | 'project';

export interface PackageDefinition {
  tier: PackageTier;
  /** Included base module IDs (always available). */
  baseModules: ModuleId[];
  /** Add-on modules available for purchase. */
  availableAddons: ModuleId[];
  /** Monthly price in USD (0 for free). */
  monthlyPriceUsd: number;
  /** Annual price in USD (0 for free). */
  annualPriceUsd: number;
  /** Maximum team members (1 = individual). */
  maxMembers: number;
}

export const PACKAGES: Record<PackageTier, PackageDefinition> = {
  free: {
    tier: 'free',
    baseModules: ['vocabulary', 'grammar'],
    availableAddons: [],
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    maxMembers: 1,
  },
  pro: {
    tier: 'pro',
    baseModules: ['vocabulary', 'grammar'],
    availableAddons: ['reading', 'writing', 'listening', 'speaking'],
    monthlyPriceUsd: 29,
    annualPriceUsd: 290,
    maxMembers: 1,
  },
  project: {
    tier: 'project',
    baseModules: ['vocabulary', 'grammar', 'reading', 'writing', 'listening', 'speaking'],
    availableAddons: [],
    monthlyPriceUsd: 59,
    annualPriceUsd: 590,
    maxMembers: 10,
  },
};

// ---------------------------------------------------------------------------
// User subscription state
// ---------------------------------------------------------------------------

export interface UserSubscription {
  tier: PackageTier;
  /** Modules the user has access to (base + purchased addons). */
  activeModules: ModuleId[];
  /** Add-on modules purchased individually. */
  purchasedAddons: ModuleId[];
  /** The discipline this subscription is for. */
  discipline: EngineeringDiscipline;
  /** The interface language at time of purchase. */
  language: string;
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

// ---------------------------------------------------------------------------
// Onboarding selection
// ---------------------------------------------------------------------------

export interface OnboardingSelection {
  discipline: EngineeringDiscipline;
  language: string;
  packageTier: PackageTier;
  selectedAddons: ModuleId[];
}
