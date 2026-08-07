import React, { useEffect, useState } from 'react';

// ContentAggregator ge�ici olarak yorumdan ��kar�ld�, build hatas� vermemesi i�in
// import { ContentAggregatorService } from '../../shared/services/content-aggregator.service';
import { OnboardingWizard } from '../../features/onboarding/OnboardingWizard';
import { useAuth } from '../../shared/hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!authLoading && user && (!user.onboardingCompleted || !user.discipline)) {
      setShowOnboarding(true);
    }
  }, [user, authLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Burada normalde i�erik y�klenir, �imdilik basit tutuyoruz
  };

  if (authLoading) return <div className="p-10">Y�kleniyor...</div>;
  if (showOnboarding) return <OnboardingWizard onComplete={handleOnboardingComplete} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Ho�geldin, {user?.name || 'Kullan�c�'}!</h1>
      <div className="p-4 bg-blue-50 rounded text-blue-800">
        Sistem g�ncelleniyor... T�m i�erikler �ok yak�nda burada olacak. (Build hatas� nedeniyle
        ge�ici g�r�nt�)
      </div>
      {/* Di�er bile�enler build d�zelene kadar devre d��� */}
    </div>
  );
};
