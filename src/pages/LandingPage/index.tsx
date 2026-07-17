import { useEffect, useState } from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { ProductAnalyticsService } from '@/features/analytics';
import { STRUCTURED_DATA } from './constants';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { WorkflowSection } from './WorkflowSection';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';
import { Footer } from './Footer';

const LandingPage = () => {
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrollShift, setScrollShift] = useState(0);

  useEffect(() => {
    ProductAnalyticsService.track('screen_viewed', 'landing');
    const timer = window.setTimeout(() => setHeroVisible(true), 120);
    return () => window.clearTimeout(timer);
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
    <main className="min-h-screen overflow-hidden bg-[#f6f4ee] text-[#111] antialiased">
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

      <Navbar />
      <HeroSection heroVisible={heroVisible} scrollShift={scrollShift} />
      <WorkflowSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
};

export default LandingPage;
