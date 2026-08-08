import React, { useEffect, useState } from 'react';

import { OnboardingWizard } from '../../features/onboarding/OnboardingWizard';
import { useAuth } from '../../shared/hooks/useAuth';

// ContentAggregator şimdilik yorumda, önce basit build alalım
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

  if (authLoading) return <div className="p-10">Yükleniyor...</div>;
  if (showOnboarding) return <OnboardingWizard onComplete={handleOnboardingComplete} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Hoşgeldin, {user?.name || 'Kullanıcı'}!</h1>
      <p className="text-gray-600">Sistem hazır. İçerikler çok yakında burada.</p>
    </div>
  );
};

export default DashboardPage;
