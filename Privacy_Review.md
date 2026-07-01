# EngineerOS Closed Beta Privacy Review

## Privacy Position

EngineerOS closed beta remains local-first. The app does not require unnecessary personal information to start learning.

## Data Collected Locally

Onboarding:

- Engineering discipline
- Experience level
- Current English level
- Target English level
- Industry
- Daily study goal
- Career goal
- Timezone

Feedback:

- Feedback type
- Message
- Ratings
- Current screen
- Optional screenshot file name only

Product analytics:

- Anonymous screen views
- Anonymous local events
- Optional session duration

## Data Not Collected

- No government IDs
- No payment secrets
- No AI vendor keys
- No unnecessary personal demographics
- No hidden browser fingerprinting

## Local Storage

Closed beta data uses the existing storage wrapper. Direct `localStorage` usage remains isolated to the shared storage layer.

## AI Request Handling

The frontend never calls OpenAI, Anthropic, Gemini or other AI vendors directly. Real AI requires a backend proxy. Mock AI remains clearly labelled.

## Data Export / Account Deletion

Profile now provides two explicit device-level controls:

- Export local EngineerOS data as a JSON file.
- Clear local EngineerOS progress after typing `CLEAR` in local-auth mode.

The export includes only `eos_` namespaced EngineerOS data and excludes
unrelated browser storage. These controls do not claim to delete a Supabase
cloud account. Verified cloud export and account deletion remain blocked until
the production backend flow is deployed and reviewed.

## Compliance Note

EngineerOS should not claim GDPR, HIPAA, SOC 2 or enterprise compliance until reviewed by legal/security specialists and validated in production infrastructure.
