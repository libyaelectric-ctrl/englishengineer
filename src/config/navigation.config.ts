/**
 * Navigation Configuration
 *
 * Defines nav links and Lucide icons for the app sidebar layout:
 * - SKILL_NAV_ITEMS: Core language practicing categories (vocabulary, grammar, writing, etc.)
 * - LEARNING_HUB_NAV_ITEMS: Daily recommended curriculum and interactive knowledge graph
 * - TOOLS_NAV_ITEMS: Templates, AI copilot, and developer scenario builder
 * - PROFILE_NAV_ITEMS: Personal settings, preferences, billing, and data protection
 */
import {
  BarChart3,
  BookMarked,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Calendar,
  Compass,
  Headphones,
  Home,
  Languages,
  Layers3,
  Library,
  Map,
  Mic2,
  PenTool,
  Settings,
  Shield,
  Target,
  Trophy,
  User,
  Users,
  WandSparkles,
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

// 'today' has no requiredFeature — it is the free Learning Hub entry.
const LEARNING_HUB_NAV_ITEMS = [
  { label: 'Today', href: '/curriculum/today', icon: Calendar },
  { label: 'Curriculum', href: '/curriculum/full', icon: Library, feature: 'learningHub' },
  { label: 'Learning Memory', href: '/curriculum/memory', icon: BarChart3, feature: 'learningHub' },
  { label: 'Placement Test', href: '/placement', icon: Compass, feature: 'placementTest' },
] as const;

const TOOLS_NAV_ITEMS = [
  { label: 'Work Tools', href: '/tools/work', icon: BriefcaseBusiness, feature: 'tool' },
  { label: 'Quick Tools', href: '/tools/quick', icon: WandSparkles, feature: 'tool' },
  { label: 'AI Copilot', href: '/tools/ai', icon: BrainCircuit, feature: 'aiCoach' },
] as const;

const PROFILE_NAV_ITEMS = [
  { label: 'Overview', href: '/profile/overview', icon: User },
  { label: 'Preferences', href: '/profile/preferences', icon: Settings },
  { label: 'Security & Data', href: '/profile/security', icon: Shield },
] as const;

const PROGRESS_NAV_ITEMS = [
  { label: 'Overview', href: '/progress/overview', icon: Target },
  { label: 'Next Steps', href: '/progress/next-steps', icon: Trophy },
] as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Learning Path', href: '/learning-path', icon: Trophy },
  { label: 'Skills', href: null, icon: Layers3, children: SKILL_NAV_ITEMS },
  { label: 'Progress', href: null, icon: Trophy, children: PROGRESS_NAV_ITEMS },
  {
    label: 'Learning Hub',
    href: null,
    icon: Map,
    children: LEARNING_HUB_NAV_ITEMS,
  },
  {
    label: 'Tools',
    href: null,
    icon: BriefcaseBusiness,
    children: TOOLS_NAV_ITEMS,
  },
  { label: 'Translator', href: '/translator', icon: Languages, feature: 'translator' },
  { label: 'Team', href: '/team', icon: Users, comingSoon: true },
  { label: 'Profile', href: null, icon: User, children: PROFILE_NAV_ITEMS },
] as const;

// Exported for testing only - not used by production code
export const MAIN_NAVIGATION_LABELS = NAV_ITEMS.map((item) => item.label);
