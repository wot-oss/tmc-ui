import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CredentialsForm from '../components/CredentialsForm';
import {
  requestClientCredentialsToken,
  type RequestClientCredentialsTokenResult,
} from '../services/auth';

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
    <main className="min-h-[calc(100dvh-4rem)] bg-bgBodyPrimary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-textLabel">
            Settings
          </p>
          <h1 className="text-3xl font-semibold text-inputText">Manage API credentials</h1>
          <p className="text-sm leading-6 text-textLabel">
            Review the credentials stored for this tab and save changes to re-authenticate the
            catalog session.
          </p>
        </div>

        <CredentialsForm
          eyebrow="Settings"
          title="Update API credentials"
          description="Edit the client ID and client secret used for authenticated catalog requests."
          clientId={newClientId}
          clientSecret={newClientSecret}
          onClientIdChange={setNewClientId}
          onClientSecretChange={setNewClientSecret}
          onSubmit={handleSave}
          submitText="Save credentials"
          helperText="Changes are saved to this browser tab and applied immediately after re-authentication."
          errorMessage={saveError}
          isSubmitting={isSaving}
        />
      </div>
    </main>
  );
};

export default Settings;
