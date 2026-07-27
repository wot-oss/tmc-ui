import Button from './base/Button';

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
  readonly helperText: string;
  readonly errorMessage?: string | null;
  readonly autoFocusClientId?: boolean;
  readonly isSubmitting?: boolean;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({
  eyebrow,
  title,
  description,
  clientId,
  clientSecret,
  onClientIdChange,
  onClientSecretChange,
  onSubmit,
  submitText,
  helperText,
  errorMessage,
  autoFocusClientId = false,
  isSubmitting = false,
}: CredentialsFormProps) => {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="w-full rounded-2xl border border-border-default bg-surface-canvas p-8 shadow-lg shadow-black/5">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
        <p className="text-sm leading-6 text-text-secondary">{description}</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="rounded-md border border-status-error bg-status-error-soft px-4 py-3 text-sm text-status-error">
            <span>Error on credentials</span>
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-text-primary">Client ID</span>
          <input
            autoFocus={autoFocusClientId}
            type="text"
            value={clientId}
            onChange={(event) => onClientIdChange(event.target.value)}
            className="h-12 w-full rounded-md border border-border-default bg-surface-input px-4 text-base text-text-primary placeholder:text-text-secondary focus:outline focus:outline-2 focus:outline-focus-soft"
            placeholder="Enter client ID"
            aria-label="Client ID"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-text-primary">Client Secret</span>
          <input
            type="password"
            value={clientSecret}
            onChange={(event) => onClientSecretChange(event.target.value)}
            className="h-12 w-full rounded-md border border-border-default bg-surface-input px-4 text-base text-text-primary placeholder:text-text-secondary focus:outline focus:outline-2 focus:outline-focus-soft"
            placeholder="Enter client secret"
            aria-label="Client Secret"
            required
          />
        </label>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">{helperText}</p>
          <Button
            text={isSubmitting ? 'Saving...' : submitText}
            type="submit"
            className="border pl-4 pr-4"
            variant="default"
          />
        </div>
      </form>
    </section>
  );
};

export default CredentialsForm;
