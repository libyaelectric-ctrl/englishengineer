import React, { useEffect, useState } from 'react';

import { DisciplineCard } from '../../components/DisciplineCard';
import { VirtualizedVocabularyList } from '../../components/VocabularyList/VirtualizedVocabularyList';
import { OnboardingWizard } from '../../features/onboarding/OnboardingWizard';
import { useAuth } from '../../shared/hooks/useAuth';
import { ContentAggregatorService } from '../../shared/services/content-aggregator.service';

export const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [contentPool, setContentPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (!user.onboardingCompleted || !user.discipline) {
        setShowOnboarding(true);
      } else {
        loadContent();
      }
    }
  }, [user, authLoading]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const pool = await ContentAggregatorService.getUserContentPool(
        user.id,
        user.discipline,
        user.language
      );
      setContentPool(pool.vocabulary || []);
    } catch (error) {
      console.error('��erik y�klenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadContent();
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-screen">Y�kleniyor...</div>;
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ho�geldin, {user.name}! ??</h1>
        <p className="text-gray-600 mt-2">
          {user.discipline} �ngilizcesi i�in{' '}
          <span className="font-bold text-blue-600">{contentPool.length}+</span> ��e haz�r.
          �stedi�in yerden ba�lamaya �zg�rs�n!
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DisciplineCard title="Kelime Havuzu" count={contentPool.length} type="vocabulary" />
        <DisciplineCard title="Okuma Par�alar�" count={50} type="reading" />
        <DisciplineCard title="Dinleme Egzersizleri" count={40} type="listening" />
        <DisciplineCard title="Konu�ma Senaryolar�" count={30} type="speaking" />
        <DisciplineCard title="Yazma G�revleri" count={25} type="writing" />
        <DisciplineCard title="Dilbilgisi Konular�" count={20} type="grammar" />
      </div>

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">T�m Kelimeler</h2>
        <VirtualizedVocabularyList items={contentPool} />
      </section>
    </div>
  );
};
