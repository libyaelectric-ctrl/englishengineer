import { MoveLeft, ShieldAlert } from 'lucide-react';

import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/Button';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="p-6 bg-surface-hover rounded-[var(--radius-card)] mb-8 text-muted-copy">
      <ShieldAlert className="h-16 w-16" />
    </div>
    <h1 className="text-6xl font-medium tracking-tighter">404 LOGIC FAULT</h1>
    <p className="text-muted-copy mt-4 max-w-md text-lg">
      The sector you are trying to access has been deindexed or never existed in the registry.
    </p>
    <Link to="/dashboard" className="mt-12">
      <Button variant="outline" className="gap-3 px-8 h-14 text-lg rounded-[var(--radius-card)]">
        <MoveLeft className="h-5 w-5" /> Return to Command Center
      </Button>
    </Link>
  </div>
);

export default NotFoundPage;
