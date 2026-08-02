import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const PricingFooter = () => (
  <section className="px-6 md:px-12 pt-8 pb-4 max-w-7xl mx-auto border-t border-border-soft">
    <div className="flex items-center justify-between text-xs text-muted-copy">
      <span>EngVox Engineering Operating System © 2026</span>
      <Link to="/" className="font-bold text-primary hover:underline flex items-center gap-1">
        <span>Back to Home</span>
        <Zap className="h-3.5 w-3.5" />
      </Link>
    </div>
  </section>
);
