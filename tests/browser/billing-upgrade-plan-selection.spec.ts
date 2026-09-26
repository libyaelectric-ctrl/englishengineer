/**
 * Deployed-site smoke test for the billing upgrade flow.
 *
 * What it protects: a customer standing on `/billing` must not be pushed into a checkout
 * for a plan they never picked. The control that used to do exactly that was the
 * "Upgrade Plan" button, which started a checkout for a hard-coded default plan; it now
 * has to open the plan list on `/pricing` first, and only the tier the customer clicks
 * may reach the billing backend.
 *
 * Why a browser test: the regression lived in a React click handler, so only the real
 * deployed bundle pressed by a real browser can prove what a customer gets. This spec
 * drives production over the wire and reads the requests the page actually sends.
 *
 * Run it against production:
 *   npm run e2e:smoke:deployed
 *
 * Point it at a preview deploy or a local origin with ENGVOX_SMOKE_SITE. It needs no
 * Firebase test credentials: the demo session is the site's own entry point, which is
 * also why no plan click can ever complete a purchase here — the pricing page refuses a
 * demo profile before any checkout request exists. The tiers the app *sells* are covered
 * by `src/e2e/billing-upgrade.e2e.test.tsx`; this spec covers the deployed door.
 */
import { type Page, type Request, expect, test } from '@playwright/test';

const SITE = (process.env.ENGVOX_SMOKE_SITE || 'https://engvox.com').replace(/\/+$/, '');

/** The only endpoint that can start a checkout from the client. */
const CHECKOUT_ENDPOINT = /\/billing\/create-checkout-session/;
/** A checkout can also start by leaving the site entirely. */
const STRIPE_CHECKOUT_HOST = /https:\/\/(checkout|billing)\.stripe\.com\//;

/** Tiers a visitor who owns nothing is entitled to see and choose between. */
const PAID_TIERS = ['Junior', 'Senior', 'Specialist', 'Master'];

const startsCheckout = (request: Request): boolean =>
  (request.method() === 'POST' && CHECKOUT_ENDPOINT.test(request.url())) ||
  STRIPE_CHECKOUT_HOST.test(request.url());

/**
 * Records every request that would spend the customer's money. Registered before the
 * first navigation so a checkout started anywhere in the flow is caught, not just the
 * one the assertion happens to be looking at.
 */
const recordCheckoutStarts = (page: Page): Request[] => {
  const attempts: Request[] = [];
  page.on('request', (request) => {
    if (startsCheckout(request)) attempts.push(request);
  });
  return attempts;
};

const describeAttempts = (attempts: Request[]): string =>
  attempts.length === 0
    ? 'no checkout request was sent'
    : `checkout requests sent before a plan was chosen:\n${attempts
        .map((attempt) => `  ${attempt.method()} ${attempt.url()}`)
        .join('\n')}`;

const tierCard = (page: Page, tierName: string) =>
  page.getByRole('article').filter({
    has: page.getByRole('heading', { name: tierName, exact: true }),
  });

const signInAsDemoUser = async (page: Page) => {
  // `/billing` sits behind the auth guard, which round-trips through /sign-in and carries
  // the requested page along, so arriving back on /billing is also proof the demo session
  // survived the redirect.
  await page.goto(`${SITE}/billing`, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 30_000 });

  // The cookie banner is a fixed bottom overlay that would swallow the click. It is
  // optional choreography for this spec, so a build that does not show one is not a failure.
  await page
    .getByRole('button', { name: /^(reddet|reject)$/i })
    .click({ timeout: 5_000 })
    .catch(() => {});

  await page.getByRole('button', { name: /demo ile başla|try demo/i }).click();
  await expect(page).toHaveURL(/\/billing/, { timeout: 30_000 });
};

test.describe('Deployed billing upgrade flow', () => {
  test('Upgrade Plan opens the plan list and starts no checkout before a plan is chosen', async ({
    page,
  }) => {
    const checkoutStarts = recordCheckoutStarts(page);

    await signInAsDemoUser(page);

    const upgrade = page.getByRole('button', { name: /^upgrade plan$/i }).first();
    await expect(upgrade).toBeVisible({ timeout: 30_000 });
    await upgrade.click();

    // If the click had started a checkout, the browser would be on its way to Stripe. The
    // plan list can only be rendered here if it did not.
    await expect(page).toHaveURL(/\/pricing/, { timeout: 30_000 });
    await expect(page.getByRole('article').first()).toBeVisible({ timeout: 30_000 });

    expect(checkoutStarts, describeAttempts(checkoutStarts)).toEqual([]);
    expect(page.url(), 'the browser must not be on a Stripe checkout page').not.toMatch(
      STRIPE_CHECKOUT_HOST
    );

    // Every tier the customer may buy is offered for selection, not just a default one.
    for (const tier of PAID_TIERS) {
      await expect(tierCard(page, tier), `${tier} must be offered on /pricing`).toBeVisible();
    }

    // Choosing a plan is the moment a checkout is allowed to start — and for a demo
    // profile the pricing page refuses it, so the refusal must be the specific demo
    // sentence rather than a generic failure, and still no request may leave the page.
    const specialist = tierCard(page, 'Specialist');
    await specialist.getByRole('button').first().click();

    await expect(page.getByRole('alert')).toContainText(/demo profiles cannot make purchases/i, {
      timeout: 15_000,
    });
    expect(checkoutStarts, describeAttempts(checkoutStarts)).toEqual([]);
  });
});
