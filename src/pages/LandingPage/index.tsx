import { useEffect, useState } from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { ProductAnalyticsService } from '@/features/analytics';
import { STRUCTURED_DATA } from './constants';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { DisciplineShowcase } from './DisciplineShowcase';
import { WorkflowSection } from './WorkflowSection';
import { LandingVideoShowcase } from './LandingVideoShowcase';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';
import { Footer } from './Footer';

const LandingPage = () => {
  const [heroVisible] = useState(true);
  const [scrollShift, setScrollShift] = useState(0);

  useEffect(() => {
    try {
      ProductAnalyticsService.track('screen_viewed', 'landing');
    } catch {
      // Ignore analytics error
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
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* 🎬 Full-Screen Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/agentic-hero.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-background/80 dark:bg-background/70" />

        {/* Bottom gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
      </div>

      <PageMetadata
        title="EngineerOS — Engineering English OS for Global Infrastructure & Tech Teams"
        description="AI-powered oral defense coaching, FIDIC contract writing, technical presentation practice, and 5,000+ domain-specific terms."
        canonicalPath="/"
        structuredData={STRUCTURED_DATA}
      />

      <Navbar />

      <HeroSection heroVisible={heroVisible} scrollShift={scrollShift} />

      <FeatureSection />

      <DisciplineShowcase />

      <WorkflowSection />

      <LandingVideoShowcase />

      <PricingSection />

      <FAQSection />

      <Footer />
    </main>
  );
};

export default LandingPage;
