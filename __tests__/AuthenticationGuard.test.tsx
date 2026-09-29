import { StrictMode, type ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AuthenticationGuard from '../app/_components/auth/AuthenticationGuard';
import { requestClientCredentialsToken } from '../lib/services/auth';
import { clearStoredCredentialsSession, getProcessedSessionStoreValue } from '../lib/utils/storage';

vi.mock('../lib/services/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/services/auth')>()),
  requestClientCredentialsToken: vi.fn(),
}));

vi.mock('../lib/utils/storage', () => ({
  getStoredSessionValue: vi.fn(),
  setStoredSessionValue: vi.fn(),
  clearStoredCredentialsSession: vi.fn(),
}));

vi.mock('../lib/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('../app/_components/Navbar', () => ({ default: () => null }));
vi.mock('../app/_components/ValidationLoader', () => ({
  ValidationLoader: () => <div role="status">Loading</div>,
}));
vi.mock('../app/_components/AuthenticationForm', () => ({
  AuthenticationForm: ({ errorMessage }: { errorMessage: string | null }) => (
    <form aria-label="Authentication">{errorMessage}</form>
  ),
}));

const token = { accessToken: 'test-token', expiresAt: null };
const requestToken = vi.mocked(requestClientCredentialsToken);

function renderGuard(serverUrl = 'https://api.test') {
  return render(
    <StrictMode>
      <AuthenticationGuard serverUrl={serverUrl} tokenUrl="https://api.test/token">
        <div>Destination page</div>
      </AuthenticationGuard>
    </StrictMode>,
  );
}

beforeEach(() => {
  requestToken.mockReset();
  vi.mocked(getProcessedSessionStoreValue).mockReturnValue('stored-credential');
});

describe('AuthenticationGuard on load', () => {
  test('keeps loading after Strict Mode aborts the first request until the active request succeeds', async () => {
    const pendingToken = Promise.withResolvers<typeof token>();
    requestToken.mockImplementationOnce(
      ({ signal }) =>
        new Promise((resolve, reject) => {
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    requestToken.mockReturnValueOnce(pendingToken.promise);

    renderGuard();
    await act(async () => {});

    expect(requestToken).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('status')).not.toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByText('Destination page')).toBeNull();

    await act(async () => pendingToken.resolve(token));

    expect(screen.queryByText('Destination page')).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
  });

  test('ignores a stale success while the active request is pending', async () => {
    const staleToken = Promise.withResolvers<typeof token>();
    requestToken.mockReturnValueOnce(staleToken.promise);
    requestToken.mockReturnValueOnce(new Promise(() => {}));

    renderGuard();
    await act(async () => staleToken.resolve(token));

    expect(screen.queryByRole('status')).not.toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByText('Destination page')).toBeNull();
  });

  test('shows the form when no credentials are stored', () => {
    vi.mocked(getProcessedSessionStoreValue).mockReturnValue(null);

    renderGuard();

    expect(screen.queryByRole('form')).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(requestToken).not.toHaveBeenCalled();
  });

  test('shows the form and clears credentials when authentication fails', async () => {
    requestToken.mockRejectedValue(new Error('Invalid credentials'));

    renderGuard();
    await act(async () => {});

    expect(screen.queryByRole('form')).not.toBeNull();
    expect(screen.queryByText('Invalid credentials')).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(clearStoredCredentialsSession).toHaveBeenCalledTimes(1);
  });

  test('renders the destination directly when authentication is disabled', () => {
    renderGuard('');

    expect(screen.queryByText('Destination page')).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    expect(requestToken).not.toHaveBeenCalled();
  });
});
