'use client';

import { TriangleAlert } from 'lucide-react';
import { useQueryState } from 'nuqs';

const errorMessages: Record<string, string> = {
  'required-scopes-missing':
    'We’re missing the permissions needed to craft your full experience. Please sign in again and allow the requested access.',
};

const ErrorMessage = () => {
  const [error] = useQueryState('error');

  if (!error || !(error in errorMessages)) return null;

  return (
    <div className="border-red/10 bg-red/5 min-w-0 max-w-fit shrink overflow-hidden break-words rounded-lg border p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center">
        <TriangleAlert size={28} />
        <p className="ml-2 text-sm text-black/80 dark:text-white/80">{errorMessages[error]}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
