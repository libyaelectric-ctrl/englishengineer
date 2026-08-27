import { AppShell } from '@/layouts/AppShell';
import { PublicLayout } from '@/layouts/PublicLayout';
import { ErrorBoundary } from 'react-error-boundary';

import { type ComponentType, Suspense, lazy } from 'react';

import { Navigate, createBrowserRouter } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';
import { PageErrorBoundary } from '@/shared/components/PageErrorBoundary';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { RequireAdminRole } from '@/features/auth/RequireAdminRole';
import { CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from '@/features/auth/clerk.config';
import { CurriculumSectionGuard, SubscriptionRouteGuard } from '@/features/billing';
import { OnboardingGate } from '@/features/profile';
import { FEATURE_FLAGS } from '@/shared/feature-flags';

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
const LessonRunner = lazy(() => import('@/pages/LessonRunnerPage'));
const ClerkAuthPage = lazy(() => import('@/pages/ClerkAuthPage'));

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
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'onboarding/:step',
        element: <Navigate to="/dashboard" replace />,
      },

      {
        path: 'learning-path',
        element: withSuspense(LearningPath),
      },
      {
        path: 'lesson-runner/:levelId?',
        element: withSuspense(LessonRunner),
      },
      {
        path: 'profile',
        element: withSuspense(Profile),
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
        element: (
          <SubscriptionRouteGuard feature="placementTest">
            {withSuspense(Placement)}
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'translator',
        element: (
          <SubscriptionRouteGuard feature="translator">
            {withSuspense(Translator)}
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'speaking',
        element: (
          <SubscriptionRouteGuard feature="speaking">
            <PageErrorBoundary pageName="Speaking">{withSuspense(Speaking)}</PageErrorBoundary>
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'vocabulary',
        element: (
          <SubscriptionRouteGuard feature="vocabulary">
            <PageErrorBoundary pageName="Vocabulary">{withSuspense(Vocabulary)}</PageErrorBoundary>
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'grammar',
        element: (
          <SubscriptionRouteGuard feature="grammar">
            <PageErrorBoundary pageName="Grammar">{withSuspense(Grammar)}</PageErrorBoundary>
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'reading',
        element: (
          <SubscriptionRouteGuard feature="reading">
            <PageErrorBoundary pageName="Reading">{withSuspense(Reading)}</PageErrorBoundary>
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'writing',
        element: (
          <SubscriptionRouteGuard feature="writing">
            <PageErrorBoundary pageName="Writing">{withSuspense(Writing)}</PageErrorBoundary>
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'listening',
        element: (
          <SubscriptionRouteGuard feature="listening">
            <PageErrorBoundary pageName="Listening">{withSuspense(Listening)}</PageErrorBoundary>
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'ai',
        element: <Navigate to="/tools/ai" replace />,
      },
      {
        path: 'analytics',
        element: <Navigate to="/progress" replace />,
      },
      {
        path: 'progress',
        element: withSuspense(Progress),
      },
      {
        path: 'progress/:section',
        element: withSuspense(Progress),
      },
      {
        path: 'curriculum',
        element: <CurriculumSectionGuard>{withSuspense(Curriculum)}</CurriculumSectionGuard>,
      },
      {
        path: 'curriculum/:section',
        element: <CurriculumSectionGuard>{withSuspense(Curriculum)}</CurriculumSectionGuard>,
      },
      {
        path: 'tools',
        element: <Navigate to="/tools/work" replace />,
      },
      {
        path: 'tools/:section',
        element: (
          <SubscriptionRouteGuard feature="tool">{withSuspense(Tools)}</SubscriptionRouteGuard>
        ),
      },

      {
        path: 'team',
        element: FEATURE_FLAGS.TEAM_BETA ? (
          <ErrorBoundary
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-surface text-foreground">
                <div className="text-center space-y-4">
                  <p className="text-lg font-bold">Team sayfası yüklenemedi.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-[12px] border border-border-soft bg-surface px-5 py-2.5 text-sm font-bold transition-colors hover:bg-surface-hover"
                  >
                    Yeniden Dene
                  </button>
                </div>
              </div>
            }
          >
            {withSuspense(Team)}
          </ErrorBoundary>
        ) : (
          <Navigate to="/dashboard" replace />
        ),
      },
      {
        path: 'team/members/:memberId',
        element: FEATURE_FLAGS.TEAM_BETA ? withSuspense(TeamMember) : (
          <Navigate to="/dashboard" replace />
        ),
      },
    ],
  },
  {
    path: CLERK_SIGN_IN_URL,
    errorElement: <RouteErrorPage />,
    element: (
      <Suspense fallback={<LoadingState />}>
        <ClerkAuthPage mode="sign-in" />
      </Suspense>
    ),
  },
  {
    path: CLERK_SIGN_UP_URL,
    errorElement: <RouteErrorPage />,
    element: (
      <Suspense fallback={<LoadingState />}>
        <ClerkAuthPage mode="sign-up" />
      </Suspense>
    ),
  },
  {
    path: '*',
    errorElement: <RouteErrorPage />,
    element: withSuspense(NotFound),
  },
]);
