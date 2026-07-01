# EngineerOS v2.2 Trust & Reality

EngineerOS must be clear about what is real now, what is local-only, and what requires production backend services.

## What Is Real Now

- Reading, Writing, Listening, Speaking, Vocabulary, Analytics, Gamification, AI Coach UI, Billing UI, Profile, and Dashboard routes run in the current frontend.
- Learning progress, vocabulary progress, achievements, AI Coach history, and gamification state persist locally through the existing storage layer.
- Speaking can use the browser Web Speech API when the browser supports it.
- Typed transcript fallback works when browser speech recognition is unavailable.
- Local auth remains available for demo and development.

## Mock Mode

Mock mode means the app is using local fallback responses or local sample logic instead of a production backend.

- Mock AI is active when `VITE_AI_PROVIDER=mock` or when no AI proxy URL is configured.
- Mock AI output must be labeled as a mock fallback response.
- Mock output should never be presented as verified production AI.

## Demo And Local Mode

Local mode means progress is saved on the current device/browser profile.

- Local auth is not production identity management.
- Local entitlement mode does not verify real Stripe payments.
- Local analytics are calculated from the current browser's learning state.
- Empty or limited local data should be shown as local-only or not enough data yet.

## Browser Mode

Browser mode means capability depends on the user's browser.

- Speaking uses Web Speech API only if supported by the browser.
- Browser speech recognition captures transcript text.
- Pronunciation scoring is not available in the current browser transcript mode.
- Typed transcript fallback remains available.

## Simulated Listening

Listening currently uses transcript-backed simulation unless real audio assets are connected.

- Playback controls represent simulated playback.
- Visual bars are activity indicators, not measured audio levels.
- Listening scores reflect transcript comprehension and submitted answers.

## Backend Dependencies

Production backend services are required for:

- Live AI coaching through `BackendProxyAIProvider`
- Supabase production authentication and cloud sync
- Stripe Checkout, Customer Portal, invoices, and verified subscription status
- Production-grade analytics beyond local learning state

## Billing Reality

Billing UI can show plans and local entitlement status.

- If `VITE_BILLING_API_URL` is missing, billing backend is unavailable.
- Checkout is unavailable without the backend.
- Local entitlement mode does not prove payment or subscription ownership.
- Stripe test/live mode must be communicated by the backend contract in production.

## Cloud Sync Reality

Cloud sync requires Supabase configuration and the existing sync service.

- Without Supabase env variables, local storage remains active.
- Last sync should not be invented if no cloud snapshot exists.
- Pending sync and unavailable cloud sync must be labeled honestly.

## Trust Label Philosophy

Use short status labels:

- Mock AI active
- Backend unavailable
- Local progress mode
- Browser Speech Recognition
- Typed Transcript Fallback
- Listening Simulation
- Cloud sync unavailable
- Billing backend unavailable
- Local entitlement mode

Trust labels should be visible, calm, and professional. They should clarify limitations without making the product feel broken.

## Future v2.3 Work

- Add a single global environment status strip.
- Add sync queue visibility when Supabase is configured.
- Add backend-supplied Stripe mode labels: test, live, unavailable.
- Add page-level empty states for first-run users with no activity.
- Add production audio asset support for Listening without changing the evaluator contract.
