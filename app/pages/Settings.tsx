import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  requestClientCredentialsToken,
  type RequestClientCredentialsTokenResult,
} from '../../lib/services/auth';

interface SettingsProps {
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly onCommitCredentials: (
    clientId: string,
    clientSecret: string,
    validatedToken: RequestClientCredentialsTokenResult,
  ) => void;
}

const Settings: React.FC<SettingsProps> = ({
  tokenUrl,
  clientId,
  clientSecret,
  onCommitCredentials,
}) => {
  const navigate = useNavigate();
  const [newClientId, setNewClientId] = useState(clientId);
  const [newClientSecret, setNewClientSecret] = useState(clientSecret);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewClientId(clientId);
  }, [clientId]);

  useEffect(() => {
    setNewClientSecret(clientSecret);
  }, [clientSecret]);

  useEffect(() => {
    setSaveError(null);
  }, [newClientId, newClientSecret]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const validatedToken = await requestClientCredentialsToken({
        tokenUrl,
        clientId: newClientId,
        clientSecret: newClientSecret,
      });

      onCommitCredentials(newClientId, newClientSecret, validatedToken);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      setSaveError(err instanceof Error ? err.message : 'Failed to validate credentials.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="bg-surface-canvas min-h-[calc(100dvh-4rem)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <CredentialsForm
          eyebrow="API Authentication"
          title="Update API credentials"
          description=" Review the credentials stored for this tab and save changes to re-authenticate the
            catalog session"
          clientId={newClientId}
          clientSecret={newClientSecret}
          onClientIdChange={setNewClientId}
          onClientSecretChange={setNewClientSecret}
          onSubmit={handleSave}
          submitText="Save credentials"
          errorMessage={saveError}
          isSubmitting={isSaving}
        />
      </div>
    </main>
  );
};

export default Settings;
