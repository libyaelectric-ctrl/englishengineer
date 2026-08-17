import { type ReactNode } from 'react';

import { useParams } from 'react-router-dom';

import { SubscriptionRouteGuard } from './SubscriptionRouteGuard';

interface CurriculumSectionGuardProps {
  children: ReactNode;
}

/**
 * Guards individual Learning Hub sections: 'today' is the free entry, while
 * 'full' and 'memory' require the paid Learning Hub feature.
 */
export const CurriculumSectionGuard = ({ children }: CurriculumSectionGuardProps) => {
  const { section } = useParams();
  const feature = section === 'today' ? null : 'learningHub';
  return feature ? (
    <SubscriptionRouteGuard feature={feature}>{children}</SubscriptionRouteGuard>
  ) : (
    <>{children}</>
  );
};
