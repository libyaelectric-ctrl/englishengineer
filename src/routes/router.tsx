import { AppShell } from '@/layouts/AppShell';
import { PublicLayout } from '@/layouts/PublicLayout';

import { Suspense, lazy, type ComponentType } from 'react';

import { Navigate, createBrowserRouter } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { RequireAdminRole } from '@/features/auth/RequireAdminRole';
import { OnboardingGate } from '@/features/profile';

import { RouteErrorPage } from './RouteErrorPage';

const withSuspense = (Component: ComponentType) => (
  <Suspense fallback={<LoadingState />}>
    <Component />
  </Suspense>
);

const Dashboard = lazy(() => import('@/pages/DashboardPage'));
const Profile = lazy(() => import('@/pages/ProfilePage'));
const Billing = lazy(() => import('@/pages/BillingPage'));
const Speaking = lazy(() => import('@/pages/SpeakingPage'));
const Vocabulary = lazy(() => import('@/pages/VocabularyPage'));
const Grammar = lazy(() => import('@/pages/GrammarPage'));
const Reading = lazy(() => import('@/pages/ReadingPage'));
const Writing = lazy(() => import('@/pages/WritingPage'));
const Listening = lazy(() => import('@/pages/ListeningPage'));
const Admin = lazy(() => import('@/pages/AdminPage'));
const Curriculum = lazy(() => import('@/pages/CurriculumPage'));
const Offline = lazy(() => import('@/pages/OfflinePage'));
const Tools = lazy(() => import('@/pages/ToolsPage'));
const NotFound = lazy(() => import('@/pages/NotFoundPage'));
const Login = lazy(() => import('@/pages/LoginPage'));

const Landing = lazy(() => import('@/pages/LandingPage'));
const Pricing = lazy(() => import('@/pages/PricingPage'));
const Business = lazy(() => import('@/pages/BusinessPage'));
const Legal = lazy(() => import('@/pages/LegalPage'));
const Team = lazy(() => import('@/pages/TeamPage'));
const TeamMember = lazy(() => import('@/pages/TeamMemberPage'));
const Start = lazy(() => import('@/pages/StartPage'));
const Placement = lazy(() => import('@/pages/PlacementPage'));
const Translator = lazy(() => import('@/pages/TranslatorPage'));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'));

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: withSuspense(Landing),
      },
      {
        path: '/pricing',
        element: withSuspense(Pricing),
      },
      {
        path: '/business',
        element: withSuspense(Business),
      },
      {
        path: '/start',
        element: withSuspense(Start),
      },
      {
        path: '/demo',
        element: <Navigate to="/start" replace />,
      },
      ...(['terms', 'privacy', 'cookies', 'refund'] as const).map((document) => ({
        path: `/legal/${document}`,
        element: (
          <Suspense fallback={<LoadingState />}>
            <Legal document={document} />
          </Suspense>
        ),
      })),
    ],
  },
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <RequireAdminRole>
          <Suspense fallback={<LoadingState />}>
            <Admin />
          </Suspense>
        </RequireAdminRole>
      </AuthGuard>
    ),
  },
  {
    errorElement: <RouteErrorPage />,
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingState />}>
            <OnboardingGate>
              <Dashboard />
            </OnboardingGate>
          </Suspense>
        ),
      },
      
      
      {
        path: 'profile',
        element: <Navigate to="/profile/overview" replace />,
      },
      {
        path: 'profile/:section',
        element: withSuspense(Profile),
      },
      {
        path: 'billing',
        element: withSuspense(Billing),
      },
      {
        path: 'placement',
        element: withSuspense(Placement),
      },
      {
        path: 'translator',
        element: withSuspense(Translator),
      },
      {
        path: 'speaking',
        element: withSuspense(Speaking),
      },
      {
        path: 'vocabulary',
        element: withSuspense(Vocabulary),
      },
      {
        path: 'grammar',
        element: withSuspense(Grammar),
      },
      {
        path: 'reading',
        element: withSuspense(Reading),
      },
      {
        path: 'writing',
        element: withSuspense(Writing),
      },
      {
        path: 'listening',
        element: withSuspense(Listening),
      },
      {
        path: 'ai',
        element: <Navigate to="/tools/ai" replace />,
      },
      {
        path: 'analytics',
        element: <Navigate to="/progress/overview" replace />,
      },
      {
        path: 'gamification',
        element: <Navigate to="/progress/next-steps" replace />,
      },
      {
        path: 'curriculum',
        element: <Navigate to="/curriculum/today" replace />,
      },
      {
        path: 'curriculum/:section',
        element: withSuspense(Curriculum),
      },
      {
        path: 'tools',
        element: <Navigate to="/tools/work" replace />,
      },
      {
        path: 'tools/:section',
        element: withSuspense(Tools),
      },
      
      
      {
        path: 'learning-plan',
        element: <Navigate to="/progress/next-steps" replace />,
      },
      {
        path: 'beta-program',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'offline',
        element: withSuspense(Offline),
      },
      {
        path: 'team',
        element: withSuspense(Team),
      },
      {
        path: 'team/members/:memberId',
        element: withSuspense(TeamMember),
      },
    ],
  },
  {
    path: '/login',
    element: withSuspense(Login),
  },
  {
    path: '/signup',
    element: withSuspense(Login),
  },
  {
    path: '/auth/callback',
    element: withSuspense(AuthCallbackPage),
  },
  {
    path: '*',
    element: withSuspense(NotFound),
  },
]);

