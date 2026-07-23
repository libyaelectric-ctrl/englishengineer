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

export const SKILL_NAV_ITEMS = [
  { label: 'Vocabulary', href: '/vocabulary', icon: BookMarked },
  { label: 'Grammar', href: '/grammar', icon: Languages },
  { label: 'Reading', href: '/reading', icon: BookOpen },
  { label: 'Writing', href: '/writing', icon: PenTool },
  { label: 'Listening', href: '/listening', icon: Headphones },
  { label: 'Speaking', href: '/speaking', icon: Mic2 },
] as const;

export const LEARNING_HUB_NAV_ITEMS = [
  { label: 'Today', href: '/curriculum/today', icon: Calendar },
  { label: 'Curriculum', href: '/curriculum/full', icon: Library },
  { label: 'Learning Memory', href: '/curriculum/memory', icon: BarChart3 },
  { label: 'Placement Test', href: '/placement', icon: Compass },
] as const;

export const TOOLS_NAV_ITEMS = [
  { label: 'Work Tools', href: '/tools/work', icon: BriefcaseBusiness },
  { label: 'Quick Tools', href: '/tools/quick', icon: WandSparkles },
  { label: 'AI Copilot', href: '/tools/ai', icon: BrainCircuit },
] as const;

export const PROFILE_NAV_ITEMS = [
  { label: 'Overview', href: '/profile/overview', icon: User },
  { label: 'Preferences', href: '/profile/preferences', icon: Settings },
  { label: 'Security & Data', href: '/profile/security', icon: Shield },
] as const;

export const PROGRESS_NAV_ITEMS = [
  { label: 'Overview', href: '/progress/overview', icon: Target },
  { label: 'Next Steps', href: '/progress/next-steps', icon: Trophy },
] as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
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
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Profile', href: null, icon: User, children: PROFILE_NAV_ITEMS },
] as const;

export const MAIN_NAVIGATION_LABELS = NAV_ITEMS.map((item) => item.label);
