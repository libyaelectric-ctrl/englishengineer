/* TEMPORARY dev-only preview harness for visual verification of OnboardPage.
   Rendered via /onboard-preview.html; delete both files after use. */
import { createRoot } from 'react-dom/client';

import { MemoryRouter } from 'react-router-dom';

import '@/index.css';

import { ThemeProvider } from '@/features/theme/ThemeProvider';

import OnboardPage from './index';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/onboard']}>
        <OnboardPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}