import { useEffect, useState } from 'react';

import { PageMetadata } from '@/shared/components/PageMetadata';
import { logger } from '@/shared/logger';

import { ProductAnalyticsService } from '@/features/analytics';

import { DisciplineShowcase } from './DisciplineShowcase';
import { FAQSection } from './FAQSection';
import { FeatureSection } from './FeatureSection';
import { Footer } from './Footer';
import HeroSection from './HeroSection';
import { Navbar } from './Navbar';
import { PricingSection } from './PricingSection';
import { WorkflowSection } from './WorkflowSection';
import { STRUCTURED_DATA } from './constants';

const LandingPage = () => {
  const [scrollShift, setScrollShift] = useState(0);

  useEffect(() => {
    try {
      ProductAnalyticsService.track('screen_viewed', 'landing');
    } catch (e) {
      logger.w('[LANDING] Failed to track screen view', e);
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() =>
        setScrollShift(Math.min(window.scrollY * 0.08, 72))
      );
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#0047bb 1px,transparent 1px),linear-gradient(90deg,#0047bb 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      <PageMetadata
        title="EngVox — Engineering Communication Operating System"
        description="AI-powered oral defense coaching, FIDIC contract writing, technical presentation practice, and 5,000+ domain-specific terms."
        canonical="/"
        jsonLd={STRUCTURED_DATA}
      />
      <Navbar />
      <HeroSection scrollShift={scrollShift} />
      <DisciplineShowcase />
      <FeatureSection />
      <WorkflowSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
};
export default LandingPage;
