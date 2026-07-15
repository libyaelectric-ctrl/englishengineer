import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

export const useClipboard = ({ timeout = 2000 }: UseClipboardOptions = {}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);

        if (timeout > 0) {
          setTimeout(() => setCopied(false), timeout);
        }

        return true;
      } catch (err) {
        setError(err as Error);
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return { copied, error, copy, reset };
};

// Legacy API fallback
export const useClipboardLegacy = ({
  timeout = 2000,
}: UseClipboardOptions = {}) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text: string) => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);

        if (timeout > 0) {
          setTimeout(() => setCopied(false), timeout);
        }

        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copied, copy };
};
