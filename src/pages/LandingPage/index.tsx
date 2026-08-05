import { useEffect } from 'react';

import { PageMetadata } from '@/shared/components/PageMetadata';
import { logger } from '@/shared/logger';
import { ProductAnalyticsService } from '@/features/analytics';

import { Navbar } from './Navbar';
import { WowHeroSection } from './WowHeroSection';
import { SocialProofMarquee } from './SocialProofMarquee';
import { DisciplinesGrid } from './DisciplinesGrid';
import { DuolingoWorkflowSection } from './DuolingoWorkflowSection';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { STRUCTURED_DATA } from './constants';

const LandingPage = () => {
  useEffect(() => {
    try {
      ProductAnalyticsService.track('screen_viewed', 'landing');
    } catch (e) {
      logger.w('[LANDING] Failed to track screen view', e);
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white antialiased transition-colors duration-300">
      <PageMetadata
        title="EngineerOS — Professional Engineering Communication Platform"
        description="Select your engineering discipline, access 15 interface languages, and master professional English communication with AI-powered coaching."
        canonical="/"
        jsonLd={STRUCTURED_DATA}
      />

      <Navbar />
      <WowHeroSection />
      <SocialProofMarquee />
      <DisciplinesGrid />
      <DuolingoWorkflowSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default LandingPage;