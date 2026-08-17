import { AppShell } from '@/layouts/AppShell';
import { PublicLayout } from '@/layouts/PublicLayout';

import { type ComponentType, Suspense, lazy } from 'react';

import { Navigate, createBrowserRouter } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { RequireAdminRole } from '@/features/auth/RequireAdminRole';
import { CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from '@/features/auth/clerk.config';
import { CurriculumSectionGuard, SubscriptionRouteGuard } from '@/features/billing';
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
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'));
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
        path: 'lesson-runner/:levelId',
        element: withSuspense(LessonRunner),
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
            {withSuspense(Speaking)}
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'vocabulary',
        element: (
          <SubscriptionRouteGuard feature="vocabulary">
            {withSuspense(Vocabulary)}
          </SubscriptionRouteGuard>
        ),
      },
      {
        path: 'grammar',
        element: (
          <SubscriptionRouteGuard feature="grammar">{withSuspense(Grammar)}</SubscriptionRouteGuard>
        ),
      },
      {
        path: 'reading',
        element: (
          <SubscriptionRouteGuard feature="reading">{withSuspense(Reading)}</SubscriptionRouteGuard>
        ),
      },
      {
        path: 'writing',
        element: (
          <SubscriptionRouteGuard feature="writing">{withSuspense(Writing)}</SubscriptionRouteGuard>
        ),
      },
      {
        path: 'listening',
        element: (
          <SubscriptionRouteGuard feature="listening">
            {withSuspense(Listening)}
          </SubscriptionRouteGuard>
        ),
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
        // Today is the free Learning Hub entry; the full curriculum and
        // learning memory require a paid plan (Learning Hub feature).
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
    element: (
      <Suspense fallback={<LoadingState />}>
        <ClerkAuthPage mode="sign-in" />
      </Suspense>
    ),
  },
  {
    path: '/signup',
    errorElement: <RouteErrorPage />,
    element: (
      <Suspense fallback={<LoadingState />}>
        <ClerkAuthPage mode="sign-up" />
      </Suspense>
    ),
  },
  {
    path: '/auth/callback',
    errorElement: <RouteErrorPage />,
    element: withSuspense(AuthCallbackPage),
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
