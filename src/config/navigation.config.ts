/**
 * Navigation Configuration
 *
 * Defines nav links and Lucide icons for the app sidebar layout:
 * - SKILL_NAV_ITEMS: Core language practicing categories (vocabulary, grammar, writing, etc.)
 * - LEARNING_NAV_ITEMS: Learning path, curriculum, and placement test
 * - TOOLS_NAV_ITEMS: Templates, AI copilot, translator, and developer scenario builder
 * - PROFILE_NAV_ITEMS: Personal settings, preferences, and data protection
 */
import {
  BookMarked,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Calendar,
  Compass,
  FileText,
  Headphones,
  Home,
  Languages,
  Layers3,
  Map,
  Mic2,
  PenTool,
  Settings,
  Target,
  Trophy,
  User,
} from 'lucide-react';

// Internal - used by NAV_ITEMS and tested in navigation.config.test.ts
export const SKILL_NAV_ITEMS = [
  { label: 'Vocabulary', href: '/vocabulary', icon: BookMarked, feature: 'vocabulary' },
  { label: 'Grammar', href: '/grammar', icon: Languages, feature: 'grammar' },
  { label: 'Reading', href: '/reading', icon: BookOpen, feature: 'reading' },
  { label: 'Writing', href: '/writing', icon: PenTool, feature: 'writing' },
  { label: 'Listening', href: '/listening', icon: Headphones, feature: 'listening' },
  { label: 'Speaking', href: '/speaking', icon: Mic2, feature: 'speaking' },
] as const;

// Merged: Learning Path + Curriculum + Placement → single "Learning" group
const LEARNING_NAV_ITEMS = [
  { label: 'Learning Path', href: '/learning-path', icon: Trophy },
  { label: 'Curriculum', href: '/curriculum/today', icon: Calendar },
  { label: 'Placement Test', href: '/placement', icon: Compass, feature: 'placementTest' },
] as const;

// Consolidated: Work Tools + AI Copilot + Quick Tools + Translator → single "Tools" group
const TOOLS_NAV_ITEMS = [
  { label: 'Work Tools', href: '/tools/work', icon: BriefcaseBusiness, feature: 'tool' },
  { label: 'AI Copilot', href: '/tools/ai', icon: BrainCircuit, feature: 'aiCoach' },
  { label: 'Quick Tools', href: '/tools/quick', icon: FileText, feature: 'tool' },
  { label: 'Translator', href: '/translator', icon: Languages, feature: 'translator' },
] as const;

// Simplified: Overview + Progress + Preferences (Security moved to Profile page)
const PROFILE_NAV_ITEMS = [
  { label: 'Overview', href: '/profile/overview', icon: User },
  { label: 'Progress', href: '/progress/overview', icon: Target },
  { label: 'Preferences', href: '/profile/preferences', icon: Settings },
] as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  {
    label: 'Learning',
    href: null,
    icon: Map,
    children: LEARNING_NAV_ITEMS,
  },
  { label: 'Skills', href: null, icon: Layers3, children: SKILL_NAV_ITEMS },
  {
    label: 'Tools',
    href: null,
    icon: BriefcaseBusiness,
    children: TOOLS_NAV_ITEMS,
  },
  { label: 'Profile', href: null, icon: User, children: PROFILE_NAV_ITEMS },
  { label: 'Team', href: '/team', icon: User, comingSoon: false },
] as const;

// Exported for testing only - not used by production code
export const MAIN_NAVIGATION_LABELS = NAV_ITEMS.map((item) => item.label);
