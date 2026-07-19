const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface ProfileAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const;

export const ProfileAvatar = ({ name, size = 'md' }: ProfileAvatarProps) => {
  const colorClass = COLORS[hashName(name) % COLORS.length];
  return (
    <div
      className={`${SIZE_CLASSES[size]} ${colorClass} flex items-center justify-center rounded-[4px] border border-border-soft font-bold text-white select-none shrink-0 shadow-sm`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};
