import { useEffect, useState } from 'react';

import { PageMetadata } from '@/shared/components/PageMetadata';
import { logger } from '@/shared/logger';

import { ProductAnalyticsService } from '@/features/analytics';

import { BeforeAfterCard } from './BeforeAfterCard';
import { CefrProgressMeterCard } from './CefrProgressMeterCard';
import { CefrQuizWidget } from './CefrQuizWidget';
import { DailyPracticeStreakWidget } from './DailyPracticeStreakWidget';
import { DisciplineShowcase } from './DisciplineShowcase';
import { FAQSection } from './FAQSection';
import { FeatureSection } from './FeatureSection';
import { Footer } from './Footer';
import HeroSection from './HeroSection';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { Navbar } from './Navbar';
import { PricingSection } from './PricingSection';
import { PwaInstallBanner } from './PwaInstallBanner';
import { ReportPdfExportModal } from './ReportPdfExportModal';
import { SocialProofMarquee } from './SocialProofMarquee';
import { TechnicalAudioPlayerWidget } from './TechnicalAudioPlayerWidget';
import { TechnicalProofreaderModal } from './TechnicalProofreaderModal';
import { VoicePitchMeterWidget } from './VoicePitchMeterWidget';
import { WorkflowSection } from './WorkflowSection';
import { STRUCTURED_DATA } from './constants';

const LandingPage = () => {
  const [scrollShift, setScrollShift] = useState(0);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [reportExportOpen, setReportExportOpen] = useState(false);
  const [proofreaderOpen, setProofreaderOpen] = useState(false);

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
      frame = window.requestAnimationFrame(() => {
        const next = Math.min(window.scrollY * 0.08, 72);
        setScrollShift((current) => (current === next ? current : next));
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20 pb-16">
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
      <Navbar onOpenProofreader={() => setProofreaderOpen(true)} />
      <HeroSection scrollShift={scrollShift} />
      <SocialProofMarquee />
      <DisciplineShowcase />
      <BeforeAfterCard />

      {/* Section 5 Interactive Widgets Grid (Gamification, Voice Pitch & Audio) */}
      <section className="py-6 px-4 sm:px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <DailyPracticeStreakWidget />
        <VoicePitchMeterWidget />
        <CefrProgressMeterCard />
        <TechnicalAudioPlayerWidget />
      </section>

      <FeatureSection />
      <WorkflowSection />
      <CefrQuizWidget />
      <PricingSection />
      <FAQSection />

      {/* Modals & Banners */}
      <PwaInstallBanner />
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ReportPdfExportModal isOpen={reportExportOpen} onClose={() => setReportExportOpen(false)} />
      <TechnicalProofreaderModal
        isOpen={proofreaderOpen}
        onClose={() => setProofreaderOpen(false)}
      />

      <Footer className="fixed bottom-0 inset-x-0 z-50 glass border-t border-border-soft shadow-sm" />
    </main>
  );
};
export default LandingPage;
