import { useEffect, useState } from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { ProductAnalyticsService } from '@/features/analytics';
import { Navbar } from './Navbar';
import HeroSection from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { DisciplineShowcase } from './DisciplineShowcase';
import { WorkflowSection } from './WorkflowSection';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';
import { Footer } from './Footer';

const LandingPage = () => {
    const [scrollShift, setScrollShift] = useState(0);

  useEffect(() => {
    try {
      ProductAnalyticsService.track('screen_viewed', 'landing');
    } catch { /* ignore */ }
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0a0f] text-white antialiased selection:bg-blue-500/30">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0f] to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <PageMetadata
        title="EngineerOS â€” Engineering English OS for Global Infrastructure & Tech Teams"
        description="AI-powered oral defense coaching, FIDIC contract writing, technical presentation practice, and 5,000+ domain-specific terms."
        canonical="/"
        />

      <Navbar />

      <HeroSection scrollShift={scrollShift} />

      <FeatureSection />

      <DisciplineShowcase />

      <WorkflowSection />

      <PricingSection />

      <FAQSection />

      <Footer />
    </main>
  );
};

export default LandingPage;
