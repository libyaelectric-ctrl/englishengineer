import { useEffect, useState } from 'react';

import { PageMetadata } from '@/shared/components/PageMetadata';
import { logger } from '@/shared/logger';

import { ProductAnalyticsService } from '@/features/analytics';

import { BeforeAfterCard } from './BeforeAfterCard';
import { DisciplineShowcase } from './DisciplineShowcase';
import { FeatureSection } from './FeatureSection';
import { Footer } from './Footer';
import HeroSection from './HeroSection';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { Navbar } from './Navbar';
import { PwaInstallBanner } from './PwaInstallBanner';
import { ReportPdfExportModal } from './ReportPdfExportModal';

import { TechnicalProofreaderModal } from './TechnicalProofreaderModal';
import { TrustStrip } from './TrustStrip';
import { WorkflowSection } from './WorkflowSection';
import { STRUCTURED_DATA } from './constants';

/** Subtle gradient divider between sections */
function SectionDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}

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
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Subtle grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#0047bb 1px,transparent 1px),linear-gradient(90deg,#0047bb 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <PageMetadata
        title="EngVox — Engineering Communication Operating System"
        description="AI-powered oral defense coaching, FIDIC contract writing, technical presentation practice, and 14,000+ domain-specific terms across 10 engineering disciplines."
        canonical="/"
        jsonLd={STRUCTURED_DATA}
      />

      {/* ── Navbar ── */}
      <Navbar onOpenProofreader={() => setProofreaderOpen(true)} />

      {/* ── 1. Hero ── bg-background */}
      <HeroSection scrollShift={scrollShift} />
      <SectionDivider />



      {/* ── 3. Disciplines ── bg-background */}
      <DisciplineShowcase />
      <SectionDivider />

      {/* ── 4. Before & After ── bg-surface */}
      <BeforeAfterCard />
      <SectionDivider />

      {/* ── 5. Features ── bg-background */}
      <FeatureSection />
      <SectionDivider />

      {/* ── 6. How It Works ── bg-surface */}
      <WorkflowSection />
      <SectionDivider />

      {/* ── 7. Trust Stats ── bg-background */}
      <TrustStrip />

      {/* ── Modals & Banners ── */}
      <PwaInstallBanner />
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ReportPdfExportModal
        isOpen={reportExportOpen}
        onClose={() => setReportExportOpen(false)}
      />
      <TechnicalProofreaderModal
        isOpen={proofreaderOpen}
        onClose={() => setProofreaderOpen(false)}
      />

      {/* ── Footer ── */}
      <Footer />
    </main>
  );
};
export default LandingPage;
