import { Link, useSearchParams } from 'react-router-dom';

export default function BillingReturnPage() {
  const [params] = useSearchParams();
  const query = new URLSearchParams();
  for (const key of ['billing', 'topup']) {
    const value = params.get(key);
    if (value === 'success' || value === 'cancelled') query.set(key, value);
  }
  return (
    <main className="mx-auto max-w-lg space-y-5 px-5 py-16">
      <h1 className="text-2xl font-bold">Return to EngVox</h1>
      <p>Your account will be updated after the payment provider confirms the transaction.</p>
      <a
        className="inline-flex min-h-12 items-center rounded-md bg-primary px-5 font-bold text-primary-foreground"
        href={`com.engvox.app://billing?${query}`}
      >
        Open EngVox app
      </a>
      <p>
        <Link className="text-primary underline" to={`/billing?${query}`}>
          Continue in browser
        </Link>
      </p>
    </main>
  );
}
