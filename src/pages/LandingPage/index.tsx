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
      {/* 🎬 High-Visibility Full-Page Fixed Background Video Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-55 dark:opacity-65 filter saturate-125 contrast-110">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover scale-105"
          poster="/agentic/arc.webp"
        >
          <source src="/agentic-hero.mp4" type="video/mp4" />
        </video>
        {/* Subtle Gradient Overlays for High Typography Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/65 to-background/85 backdrop-blur-[2px]" />
      </div>

      <PageMetadata
        title="EngVox - Engineering English Training"
        description="AI-powered English training for engineers."
        canonical="https://englishengineer.vercel.app"
        jsonLd={STRUCTURED_DATA}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* Content Layer Floating Over Fixed Video Canvas */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection heroVisible={heroVisible} scrollShift={scrollShift} />
        <FeatureSection />
        <DisciplineShowcase />
        <WorkflowSection />
        <LandingVideoShowcase />
        <PricingSection />
        <FAQSection />
        <Footer />
      </div>
    </main>
  );
};

export default LandingPage;
