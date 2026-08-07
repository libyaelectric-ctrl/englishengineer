import React, { useEffect, useState } from 'react';

import { OnboardingWizard } from '../../features/onboarding/OnboardingWizard';
import { useAuth } from '../../shared/hooks/useAuth';

// ContentAggregator ï¿½imdilik yorumda, ï¿½nce basit build alalï¿½m
// import { ContentAggregatorService } from '../../shared/services/content-aggregator.service';

export const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!authLoading && user && (!user.onboardingCompleted || !user.discipline)) {
      setShowOnboarding(true);
    }
  }, [user, authLoading]);

  const handleOnboardingComplete = () => setShowOnboarding(false);

  if (authLoading) return <div className="p-10">Yï¿½kleniyor...</div>;
  if (showOnboarding) return <OnboardingWizard onComplete={handleOnboardingComplete} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Hoï¿½geldin, {user?.name || 'Kullanï¿½cï¿½'}!</h1>
      <p className="text-gray-600">Sistem hazï¿½r. ï¿½ï¿½erikler ï¿½ok yakï¿½nda burada.</p>
    </div>
  );
};

export default DashboardPage;
