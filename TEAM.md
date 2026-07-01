# EngineerOS Team Readiness

## Purpose

The Team feature prepares organization, manager and learner-summary workflows
for engineering contractors and project teams. It does not claim that team
provisioning or email delivery is live.

## Architecture

`src/features/team/` contains typed organization, member, invitation and
progress-summary models plus a provider-compatible service and UI store. The
current provider returns explicitly labelled demo data. Team pages consume the
central billing entitlement service rather than checking plan names directly.

## Security

The Team Supabase migration creates organization membership and summary tables
with RLS. Members may read their own summary. Owners and managers may read team
summaries and administer invitations. Summary rows intentionally exclude raw
learning submissions.

## Integration

- `/business` is the public B2B product page.
- `/team` is the entitlement-protected manager workspace.
- `/team/members/:memberId` shows an authorized summary view.
- Local invitations are `not-sent`; a production provider must confirm actual
  email delivery.

## Future Work

Live Supabase isolation, invitation email delivery, manager export generation
and backend-verified Team subscriptions remain deployment work.
