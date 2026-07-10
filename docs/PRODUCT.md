# EngineerOS — Product & Commercial Overview

## Commercial Beta Positioning

One-liner: EngineerOS helps professional engineers improve Engineering English for site reports, consultant communication, meetings, commissioning, QA/QC, vocabulary, and AI-assisted practice.

Target users:

- Electrical, MEP, commissioning, QA/QC, project, procurement, and site engineers
- Engineers working on hospitals, data centers, infrastructure, construction, oil and gas, and international projects
- Professionals preparing for stronger technical English in reports, emails, meetings, inspections, and handover communication

Plan structure:

- Free: local-first learning modules with limits and mock/local fallbacks
- Pro: intended for unlimited modules, AI Coach, advanced analytics, and full gamification once backend billing is live
- Team: future-ready for company groups, team analytics, and managed deployment

Privacy and AI usage:

- Local mode stores progress in browser storage.
- Real AI requires backend proxy deployment.
- The browser never stores AI vendor keys.
- Mock AI is labelled as mock and must not be treated as real AI output.

Billing limitation:

- Local billing mode does not verify payment.
- Refunds, payment failures, invoices, and plan enforcement require the production billing backend and Stripe webhook processing.

## International UX and Commercial Preview

- English is the default interface language; Turkish support uses stable local
  translation keys. Arabic, Spanish, Italian and French are prepared as future
  language packs without duplicating pages.
- Learning content remains English. Explanations and support labels follow the
  selected interface language where a reviewed translation exists.
- Electrical onboarding uses electrical subdomains rather than mixing unrelated
  engineering disciplines. The selection changes work context, never CEFR
  difficulty.
- Pricing presents Free, Starter, Core, Pro and Team commercial previews.
  **Paid checkout is disabled until Kademe 8 staging evidence passes.**
- Free sponsor-placement readiness is disabled by default and excludes active
  tasks, primary actions and mobile navigation. Paid plans are ad-free.

Current release decision: production launch **NO**; live billing **NO**.

## Commercial Handoff

- `EngineerOS_Commercial_Handoff_Package.md` defines the buyer-facing product,
  evidence and due-diligence package.
- `PRC_EngineerOS_100_Readiness_CODEX_Report.md` records the latest UI,
  interaction, performance and release-gate audit.
- The clean source export excludes local environment files, dependencies,
  generated build output, caches, logs and previous ZIP archives.
- Owner and author attribution is **Özcan ERENSAYIN**. Demo learner identities
  remain neutral.
