import {
  BookMarked,
  BookOpen,
  BriefcaseBusiness,
  Headphones,
  Home,
  Languages,
  Layers3,
  Map,
  Mic2,
  PenTool,
  User,
} from 'lucide-react';

export const SKILL_NAV_ITEMS = [
  { label: 'Reading', href: '/reading', icon: BookOpen },
  { label: 'Writing', href: '/writing', icon: PenTool },
  { label: 'Listening', href: '/listening', icon: Headphones },
  { label: 'Speaking', href: '/speaking', icon: Mic2 },
  { label: 'Vocabulary', href: '/vocabulary', icon: BookMarked },
  { label: 'Grammar', href: '/grammar', icon: Languages },
] as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Learning Hub', href: '/curriculum', icon: Map },
  { label: 'Skills', href: null, icon: Layers3, children: SKILL_NAV_ITEMS },
  { label: 'Tools', href: '/tools', icon: BriefcaseBusiness },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export const MAIN_NAVIGATION_LABELS = NAV_ITEMS.map((item) => item.label);
