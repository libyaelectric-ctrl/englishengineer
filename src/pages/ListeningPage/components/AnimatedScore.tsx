import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';

export function AnimatedScore({ value }: { value: number }) {
  const display = useAnimatedNumber(value, 1.0);
  return <span>{display}%</span>;
}
