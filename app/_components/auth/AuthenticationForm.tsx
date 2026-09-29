import { useState, useEffect, type SubmitEventHandler } from 'react';
import Button from '../base/Button';
import { isNonEmptyString } from '@/lib/utils/strings';

interface CredentialsFormProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly onClientIdChange: (value: string) => void;
  readonly onClientSecretChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly submitText: string;
  readonly errorMessage?: string | null;
  readonly autoFocusClientId?: boolean;
  readonly isSubmitting?: boolean;
  readonly size?: 'md' | 'lg';
}

interface SizeStyles {
  readonly headerMargin: string;
  readonly inputsGap: string;
  readonly errorMargin: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly error: string;
  readonly label: string;
  readonly input: string;
}

const SIZE_STYLES: Record<'md' | 'lg', SizeStyles> = {
  md: {
    headerMargin: 'mb-4',
    inputsGap: 'gap-3',
    errorMargin: 'mb-3',
    eyebrow: 'text-sm mb-0.5',
    title: 'text-3xl mb-2',
    description: 'text-sm leading-6',
    error: 'px-4 py-3 text-sm',
    label: 'text-sm',
    input: 'h-12 px-4 text-base',
  },
  lg: {
    headerMargin: 'mb-5',
    inputsGap: 'gap-4',
    errorMargin: 'mb-4',
    eyebrow: 'text-base mb-2',
    title: 'text-4xl mb-4',
    description: 'text-base leading-7',
    error: 'px-5 py-4 text-base',
    label: 'text-base',
    input: 'h-14 px-5 text-lg mt-2',
  },
} as const;

export function AuthenticationForm({
  eyebrow,
  title,
  description,
  clientId,
  clientSecret,
  onClientIdChange,
  onClientSecretChange,
  onSubmit,
  submitText,
  errorMessage,
  autoFocusClientId = false,
  isSubmitting = false,
  size = 'md',
}: CredentialsFormProps) {
  // Browser autofill on load doesn't trigger onChange() and the states are not updated. The user should manually click on the input fields to trigger autofill.
  const [isAutofillBlocked, setIsAutofillBlocked] = useState(true);
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit();
  };
  const sizeStyles = SIZE_STYLES[size];

  useEffect(() => {
    setTimeout(() => {
      if (isAutofillBlocked) {
        setIsAutofillBlocked(false);
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={`flex flex-col`}>
      {/* Header */}
      <div className={sizeStyles.headerMargin}>
        <p
          className={`text-text-secondary font-semibold tracking-[0.2em] uppercase ${sizeStyles.eyebrow}`}
        >
          {eyebrow}
        </p>
        <h1 className={`text-text-primary font-semibold ${sizeStyles.title}`}>{title}</h1>
        <p className={`text-text-secondary ${sizeStyles.description}`}>{description}</p>
      </div>

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className={`flex flex-col ${sizeStyles.inputsGap}`}>
        {errorMessage ? (
          <div
            className={`border-status-error bg-status-error-soft text-status-error rounded-md border ${sizeStyles.error} ${sizeStyles.errorMargin}`}
          >
            Authentication failed:
            <br />
            <span className="font-mono">{errorMessage}</span>
          </div>
        ) : null}

        <div className={`flex flex-col ${sizeStyles.inputsGap}`}>
          <label className="block">
            <span className={`text-text-primary font-medium ${sizeStyles.label}`}>Client ID</span>
            <input
              readOnly={isAutofillBlocked}
              autoFocus={autoFocusClientId}
              type="text"
              value={clientId}
              onChange={(event) => onClientIdChange(event.target.value)}
              className={`border-border-default bg-surface-input text-text-primary placeholder:text-text-secondary focus:outline-focus-soft w-full rounded-md border focus:outline-2 ${sizeStyles.input}`}
              placeholder="Enter client ID"
              aria-label="Client ID"
              required
            />
          </label>

          <label className="block">
            <span className={`text-text-primary font-medium ${sizeStyles.label}`}>
              Client Secret
            </span>
            <input
              readOnly={isAutofillBlocked}
              type="password"
              value={clientSecret}
              onChange={(event) => onClientSecretChange(event.target.value)}
              className={`border-border-default bg-surface-input text-text-primary placeholder:text-text-secondary focus:outline-focus-soft w-full rounded-md border focus:outline-2 ${sizeStyles.input}`}
              placeholder="Enter client secret"
              aria-label="Client Secret"
              required
            />
          </label>
        </div>

        {/* Continue Button */}
        <Button
          text={isSubmitting ? 'Saving...' : submitText}
          type="submit"
          autoComplete="off" // Otherwise Firefox causes hydration error
          className={`mt-3 w-min border`}
          variant="default"
          size={size}
          disabled={isSubmitting || !isNonEmptyString(clientId) || !isNonEmptyString(clientSecret)}
        />
      </form>
    </section>
  );
}
