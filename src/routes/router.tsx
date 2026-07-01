import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/shared/layout/AppShell';
import { lazy, Suspense } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { LoadingState } from '@/shared/components/LoadingState';
import { OnboardingGate } from '@/features/profile';
import { RouteErrorPage } from './RouteErrorPage';
import { PublicLayout } from '@/shared/layout/PublicLayout';

const Dashboard = lazy(() => import('@/pages/DashboardPage'));
const Profile = lazy(() => import('@/pages/ProfilePage'));
const Speaking = lazy(() => import('@/pages/SpeakingPage'));
const Vocabulary = lazy(() => import('@/pages/VocabularyPage'));
const Grammar = lazy(() => import('@/pages/GrammarPage'));
const Reading = lazy(() => import('@/pages/ReadingPage'));
const Writing = lazy(() => import('@/pages/WritingPage'));
const Listening = lazy(() => import('@/pages/ListeningPage'));
const AI = lazy(() => import('@/pages/AIPage'));
const Analytics = lazy(() => import('@/pages/AnalyticsPage'));
const Gamification = lazy(() => import('@/pages/GamificationPage'));
const Curriculum = lazy(() => import('@/pages/CurriculumPage'));
const Offline = lazy(() => import('@/pages/OfflinePage'));
const Tools = lazy(() => import('@/pages/ToolsPage'));
const LearningIntelligence = lazy(
  () => import('@/pages/LearningIntelligencePage')
);
const BetaProgram = lazy(() => import('@/pages/BetaProgramPage'));
const NotFound = lazy(() => import('@/pages/NotFoundPage'));
const Login = lazy(() => import('@/pages/LoginPage'));
const Onboarding = lazy(() => import('@/pages/OnboardingPage'));
const Landing = lazy(() => import('@/pages/LandingPage'));
const Pricing = lazy(() => import('@/pages/PricingPage'));
const Business = lazy(() => import('@/pages/BusinessPage'));
const Legal = lazy(() => import('@/pages/LegalPage'));
const Team = lazy(() => import('@/pages/TeamPage'));
const TeamMember = lazy(() => import('@/pages/TeamMemberPage'));
const Start = lazy(() => import('@/pages/StartPage'));
const Placement = lazy(() => import('@/pages/PlacementPage'));

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Landing />
          </Suspense>
        ),
      },
      {
        path: '/pricing',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Pricing />
          </Suspense>
        ),
      },
      {
        path: '/business',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Business />
          </Suspense>
        ),
      },
      {
        path: '/start',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Start />
          </Suspense>
        ),
      },
      ...(['terms', 'privacy', 'cookies', 'refund'] as const).map(
        (document) => ({
          path: `/legal/${document}`,
          element: (
            <Suspense fallback={<LoadingState />}>
              <Legal document={document} />
            </Suspense>
          ),
        })
      ),
    ],
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
        path: 'onboarding',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Onboarding />
          </Suspense>
        ),
      },
      ...(['profile', 'role', 'goals', 'level', 'plan'] as const).map(
        (step) => ({
          path: `onboarding/${step}`,
          element: (
            <Suspense fallback={<LoadingState />}>
              <Onboarding />
            </Suspense>
          ),
        })
      ),
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'placement',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Placement />
          </Suspense>
        ),
      },
      {
        path: 'speaking',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Speaking />
          </Suspense>
        ),
      },
      {
        path: 'vocabulary',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Vocabulary />
          </Suspense>
        ),
      },
      {
        path: 'grammar',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Grammar />
          </Suspense>
        ),
      },
      {
        path: 'reading',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Reading />
          </Suspense>
        ),
      },
      {
        path: 'writing',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Writing />
          </Suspense>
        ),
      },
      {
        path: 'listening',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Listening />
          </Suspense>
        ),
      },
      {
        path: 'ai',
        element: (
          <Suspense fallback={<LoadingState />}>
            <AI />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: 'gamification',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Gamification />
          </Suspense>
        ),
      },
      {
        path: 'curriculum',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Curriculum />
          </Suspense>
        ),
      },
      {
        path: 'tools',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Tools />
          </Suspense>
        ),
      },
      {
        path: 'work-tools',
        element: <Navigate to="/tools" replace />,
      },
      {
        path: 'quick-tools',
        element: <Navigate to="/tools?tab=quick" replace />,
      },
      {
        path: 'learning-plan',
        element: (
          <Suspense fallback={<LoadingState />}>
            <LearningIntelligence />
          </Suspense>
        ),
      },
      {
        path: 'beta-program',
        element: (
          <Suspense fallback={<LoadingState />}>
            <BetaProgram />
          </Suspense>
        ),
      },
      {
        path: 'offline',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Offline />
          </Suspense>
        ),
      },
      {
        path: 'team',
        element: (
          <Suspense fallback={<LoadingState />}>
            <Team />
          </Suspense>
        ),
      },
      {
        path: 'team/members/:memberId',
        element: (
          <Suspense fallback={<LoadingState />}>
            <TeamMember />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingState />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingState />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/signup',
    element: (
      <Suspense fallback={<LoadingState />}>
        <Login />
      </Suspense>
    ),
  },
]);
