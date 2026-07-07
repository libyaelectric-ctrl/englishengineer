import {
  BarChart3,
  BookMarked,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Calendar,
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
  User,
  Wallet,
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
] as const;

export const TOOLS_NAV_ITEMS = [
  { label: 'Work Tools', href: '/tools/work', icon: BriefcaseBusiness },
  { label: 'Quick Tools', href: '/tools/quick', icon: WandSparkles },
  { label: 'AI Copilot', href: '/tools/ai', icon: BrainCircuit },
] as const;

export const PROFILE_NAV_ITEMS = [
  { label: 'Overview', href: '/profile/overview', icon: User },
  { label: 'Skills & Progress', href: '/profile/skills', icon: BarChart3 },
  { label: 'Preferences', href: '/profile/preferences', icon: Settings },
  { label: 'Billing', href: '/profile/billing', icon: Wallet },
  { label: 'Security & Data', href: '/profile/security', icon: Shield },
] as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Skills', href: null, icon: Layers3, children: SKILL_NAV_ITEMS },
  { label: 'Tools', href: null, icon: BriefcaseBusiness, children: TOOLS_NAV_ITEMS },
  { label: 'Learning Hub', href: null, icon: Map, children: LEARNING_HUB_NAV_ITEMS },
  { label: 'Profile', href: null, icon: User, children: PROFILE_NAV_ITEMS },
] as const;

export const MAIN_NAVIGATION_LABELS = NAV_ITEMS.map((item) => item.label);
