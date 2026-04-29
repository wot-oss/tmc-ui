import Button from './base/Button';

interface CredentialsPromptProps {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly onClientIdChange: (value: string) => void;
  readonly onClientSecretChange: (value: string) => void;
  readonly onSubmit: () => void;
}

export function CredentialsPrompt({
  clientId,
  clientSecret,
  onClientIdChange,
  onClientSecretChange,
  onSubmit,
}: CredentialsPromptProps) {
  const isSubmitDisabled = clientId.trim().length === 0 || clientSecret.trim().length === 0;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    onSubmit();
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-bgBodyPrimary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-6xl items-center justify-center">
        <section className="border-buttonBorder/30 w-full max-w-xl rounded-2xl border bg-bgBodyPrimary p-8 shadow-lg shadow-black/5">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-textLabel">
              Startup authentication
            </p>
            <h1 className="text-3xl font-semibold text-inputText">Enter API credentials</h1>
            <p className="text-sm leading-6 text-textLabel">
              Provide the client ID and client secret to start the authenticated catalog session.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-textValue">Client ID</span>
              <input
                autoFocus
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
              <span className="text-sm font-medium text-textValue">Client secret</span>
              <input
                type="password"
                value={clientSecret}
                onChange={(event) => onClientSecretChange(event.target.value)}
                className="border-buttonBorder/40 h-12 w-full rounded-md border bg-inputBg px-4 text-base text-inputText placeholder:text-textLabel focus:outline focus:outline-2 focus:outline-buttonFocus"
                placeholder="Enter client secret"
                aria-label="Client secret"
                required
              />
            </label>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-textLabel">
                Credentials stay available for this browser tab until it is closed.
              </p>
              <Button disabled={isSubmitDisabled} text="Continue" type="submit" />
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
