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
    <section className="border-buttonBorder/30 w-full rounded-2xl border bg-bgBodyPrimary p-8 shadow-lg shadow-black/5">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-textLabel">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-inputText">{title}</h1>
        <p className="text-sm leading-6 text-textLabel">{description}</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            <span>Error on credentials</span>
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-textValue">Client ID</span>
          <input
            autoFocus={autoFocusClientId}
            type="text"
            value={clientId}
            onChange={(event) => onClientIdChange(event.target.value)}
            className="border-buttonBorder/40 h-12 w-full rounded-md border bg-inputBg px-4 text-base text-inputText placeholder:text-textLabel focus:outline focus:outline-2 focus:outline-buttonFocus"
            placeholder="Enter client ID"
            aria-label="Client ID"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-textValue">Client Secret</span>
          <input
            type="password"
            value={clientSecret}
            onChange={(event) => onClientSecretChange(event.target.value)}
            className="border-buttonBorder/40 h-12 w-full rounded-md border bg-inputBg px-4 text-base text-inputText placeholder:text-textLabel focus:outline focus:outline-2 focus:outline-buttonFocus"
            placeholder="Enter client secret"
            aria-label="Client Secret"
            required
          />
        </label>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-textLabel">{helperText}</p>
          <Button text={isSubmitting ? 'Saving...' : submitText} type="submit" />
        </div>
      </form>
    </section>
  );
};

export default CredentialsForm;
