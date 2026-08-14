import { AppShell } from '@/layouts/AppShell';
import { PublicLayout } from '@/layouts/PublicLayout';

import { type ComponentType, Suspense, lazy } from 'react';

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
const Tools = lazy(() => import('@/pages/ToolsPage'));
const Progress = lazy(() => import('@/pages/ProgressPage'));
const NotFound = lazy(() => import('@/pages/NotFoundPage'));
const Login = lazy(() => import('@/pages/LoginPage'));
const Onboarding = lazy(() => import('@/pages/OnboardingPage'));
const Welcome = lazy(() => import('@/pages/WelcomePage'));
const Landing = lazy(() => import('@/pages/LandingPage'));
const Pricing = lazy(() => import('@/pages/PricingPage'));
const Business = lazy(() => import('@/pages/BusinessPage'));
const Legal = lazy(() => import('@/pages/LegalPage'));
const Team = lazy(() => import('@/pages/TeamPage'));
const TeamMember = lazy(() => import('@/pages/TeamMemberPage'));
const Start = lazy(() => import('@/pages/StartPage'));
const Placement = lazy(() => import('@/pages/PlacementPage'));
const Translator = lazy(() => import('@/pages/TranslatorPage'));
const LearningPath = lazy(() => import('@/pages/LearningPathPage'));
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
      ...(['terms', 'privacy'] as const).map((document) => ({
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
    errorElement: <RouteErrorPage />,
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
        <OnboardingGate>
          <AppShell />
        </OnboardingGate>
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: withSuspense(Dashboard),
      },
      {
        path: 'onboarding',
        element: withSuspense(Onboarding),
      },
      {
        path: 'onboarding/:step',
        element: withSuspense(Onboarding),
      },
      {
        path: 'welcome',
        element: withSuspense(Welcome),
      },

      {
        path: 'learning-path',
        element: withSuspense(LearningPath),
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
        path: 'progress',
        element: <Navigate to="/progress/overview" replace />,
      },
      {
        path: 'progress/:section',
        element: withSuspense(Progress),
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
    errorElement: <RouteErrorPage />,
    element: withSuspense(Login),
  },
  {
    path: '/signup',
    errorElement: <RouteErrorPage />,
    element: withSuspense(Login),
  },
  {
    path: '/auth/callback',
    errorElement: <RouteErrorPage />,
    element: withSuspense(AuthCallbackPage),
  },
  {
    path: '*',
    errorElement: <RouteErrorPage />,
    element: withSuspense(NotFound),
  },
]);
