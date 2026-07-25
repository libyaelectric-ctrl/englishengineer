# Developer Onboarding Runbook

## Day 1: Setup

### Prerequisites
- Node.js 22+ installed
- Git configured
- GitHub access to repo
- Vercel account (for frontend deploys)
- Railway account (for backend deploys)

### Clone & Install
```bash
git clone https://github.com/libyaelectric-ctrl/englishengineer.git
cd englishengineer
npm ci
cd backend && npm ci && cd ..
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Copy `backend/.env.example` to `backend/.env`
3. Get credentials from team lead:
   - Supabase URL + keys
   - Stripe keys
   - Upstash Redis URL

### Run Locally
```bash
# Frontend (port 3000)
npm run dev

# Backend (port 8080)
cd backend && npm run dev
```

## Day 2: Architecture

### Read These Docs
1. `docs/README.md` - Project overview
2. `docs/architecture/ARCHITECTURE.md` - System design
3. `docs/adr/` - Architecture decisions
4. `docs/DEPLOYMENT.md` - Deployment process

### Key Directories
```
src/
  features/     # Feature modules (admin, billing, vocabulary)
  pages/        # Route components
  shared/       # Shared components, hooks, utils
  core/         # Core stores, services
backend/
  src/
    routes/     # API routes
    services/   # Business logic
    middleware/ # Express middleware
```

## Day 3: First Task

### Pick a Task
- Check GitHub Issues for "good first issue"
- Or ask team lead for a small bug fix

### Development Flow
1. Create branch: `git checkout -b feat/your-feature`
2. Make changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Commit with conventional commit
6. Push and create PR

### PR Guidelines
- Title follows conventional commits
- Description explains what and why
- Screenshots for UI changes
- Tests for new features

## Day 4-5: Deep Dive

### Understand These Services
- **Auth:** Supabase + OAuth flow
- **Billing:** Stripe integration
- **AI:** Anthropic/Gemini integration
- **Vocabulary:** Spaced repetition system

### Key Files to Study
- `src/features/auth/auth.service.ts` - Auth logic
- `src/features/billing/billing-flow.tsx` - Payment flow
- `backend/src/ai.ts` - AI service
- `backend/src/app.ts` - Express setup

## Week 2: Independence

### Deploy Your First PR
1. Get PR approved
2. Merge to main
3. Watch Vercel auto-deploy
4. Verify on production

### Monitoring
- Sentry: Error tracking
- Vercel Analytics: Performance
- Railway Metrics: Backend health

## Questions?

- Slack: #engineering
- Docs: `docs/` directory
- Team lead: Available for pairing
