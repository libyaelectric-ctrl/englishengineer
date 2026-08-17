import { SignIn, SignUp } from '@clerk/clerk-react';

interface ClerkAuthPageProps {
  mode: 'sign-in' | 'sign-up';
}

const ClerkAuthPage = ({ mode }: ClerkAuthPageProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-200 p-6">
        {mode === 'sign-in' ? <SignIn /> : <SignUp />}
      </div>
    </div>
  );
};

export default ClerkAuthPage;
