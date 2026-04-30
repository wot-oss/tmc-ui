import CredentialsForm from './CredentialsForm';

interface CredentialsPromptProps {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly onClientIdChange: (value: string) => void;
  readonly onClientSecretChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly errorMessage?: string | null;
  readonly isSubmitting?: boolean;
}

const CredentialsPrompt: React.FC<CredentialsPromptProps> = ({
  clientId,
  clientSecret,
  onClientIdChange,
  onClientSecretChange,
  onSubmit,
  errorMessage = null,
  isSubmitting = false,
}: CredentialsPromptProps) => {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-bgBodyPrimary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-xl">
          <CredentialsForm
            eyebrow="Startup authentication"
            title="Enter API credentials"
            description="Provide the client ID and client secret to start the authenticated catalog session."
            clientId={clientId}
            clientSecret={clientSecret}
            onClientIdChange={onClientIdChange}
            onClientSecretChange={onClientSecretChange}
            onSubmit={onSubmit}
            submitText="Continue"
            helperText="Credentials stay available for this browser tab until it is closed."
            errorMessage={errorMessage}
            autoFocusClientId
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </main>
  );
};

export default CredentialsPrompt;
