import { useCallback, useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';

interface ErrorProps {
  readonly mainMessage: string;
  readonly redirectAfterMs?: number;
  readonly redirectTo?: string;
  readonly fallbackRedirectTo?: string;
  readonly redirectLabel?: string;
}

const Error: React.FC<ErrorProps> = ({
  mainMessage,
  redirectAfterMs,
  redirectTo,
  fallbackRedirectTo = '/',
  redirectLabel,
}) => {
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    redirectAfterMs ? Math.ceil(redirectAfterMs / 1000) : null,
  );
  const resolvedRedirectLabel =
    redirectLabel ?? (redirectTo ? 'the destination page' : 'the previous page');

  const navigateBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackRedirectTo);
  }, [fallbackRedirectTo, navigate]);

  const handleRedirect = useCallback(() => {
    if (redirectTo) {
      navigate(redirectTo);
      return;
    }

    navigateBack();
  }, [navigate, navigateBack, redirectTo]);

  useEffect(() => {
    if (!redirectAfterMs || redirectAfterMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      handleRedirect();
    }, redirectAfterMs);

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds === null || currentSeconds <= 1) {
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [handleRedirect, redirectAfterMs]);

  return (
    <div className="rounded-md bg-status-error-soft p-4 outline outline-status-error">
      <div className="flex">
        <div className="shrink-0">
          <XCircleIcon aria-hidden="true" className="size-5 text-status-error" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-text-inverse">{mainMessage}</h3>
          {secondsRemaining !== null ? (
            <p className="mt-1 text-sm text-text-muted-light">
              Returning to {resolvedRedirectLabel} in {secondsRemaining} second
              {secondsRemaining === 1 ? '' : 's'}.
            </p>
          ) : null}
          <button
            type="button"
            onClick={navigateBack}
            className="mt-3 inline-flex rounded-md border border-status-error bg-status-error-soft px-3 py-1.5 text-sm font-medium text-text-inverse transition hover:bg-status-error-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-error"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
