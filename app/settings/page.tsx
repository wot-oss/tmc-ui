'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';
import { AuthenticationForm } from '../_components/auth/AuthenticationForm';

export default function Settings() {
  const { clientId, clientSecret, isAuthenticationEnabled, updateCredentials } = useAuth();
  const router = useRouter();
  const [newClientId, setNewClientId] = useState(clientId);
  const [newClientSecret, setNewClientSecret] = useState(clientSecret);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = newClientId !== clientId || newClientSecret !== clientSecret;

  const handleSave = async () => {
    if (isSaving || !hasChanges) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      await updateCredentials(newClientId, newClientSecret);
      router.push('/');
    } catch (caughtError: unknown) {
      setSaveError(
        caughtError instanceof Error ? caughtError.message : 'Failed to validate credentials.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="bg-surface-canvas flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        {isAuthenticationEnabled ? (
          <AuthenticationForm
            eyebrow="API authentication"
            title="Update API credentials"
            description="Credentials are stored for this browser tab until it is closed"
            clientId={newClientId}
            clientSecret={newClientSecret}
            onClientIdChange={(value) => {
              setNewClientId(value);
              setSaveError(null);
            }}
            onClientSecretChange={(value) => {
              setNewClientSecret(value);
              setSaveError(null);
            }}
            onSubmit={handleSave}
            onDiscard={() => {
              setNewClientId(clientId);
              setNewClientSecret(clientSecret);
              setSaveError(null);
            }}
            submitText="Save credentials"
            errorMessage={saveError}
            isSubmitting={isSaving}
            actionsDisabled={!hasChanges}
          />
        ) : (
          <Navigate to="/" />
        )}
      </div>
    </main>
  );
}
