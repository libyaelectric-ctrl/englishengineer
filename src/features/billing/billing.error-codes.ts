/**
 * The single seam between this feature and the backend's error-code contract.
 *
 * It is deliberately the only place in `src/` that names a path under `backend/`, and it
 * is type-only: nothing is imported at runtime, the bundler erases it, and the two
 * deployments stay independent. `.dependency-cruiser.mjs` allows exactly this one path,
 * and ESLint fails a value import from `backend/**`, so the seam cannot quietly grow into
 * a runtime dependency — see the boundary rules for `src/**` in `eslint.config.js`.
 *
 * The contract itself, including why a code is either part of the billing surface or not,
 * lives next to the backend code that throws it:
 * `backend/src/contracts/error-codes.ts`.
 */
export type { BillingSurfaceErrorCode } from '../../../backend/src/contracts/error-codes';
