import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useClientCredentialsToken } from '../hooks/useClientCredentialsToken';

interface AuthProviderProps {
  readonly children: ReactNode;
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly enabled?: boolean;
}

interface AuthContextType {
  readonly enabled: boolean;
  readonly accessToken: string | null;
  readonly authorizationHeader: string | null;
  readonly expiresAt: number | null;
  readonly isAuthenticated: boolean;
  readonly isExpired: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly requestToken: () => Promise<void>;
  readonly clearToken: () => void;
  readonly serverUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  tokenUrl,
  clientId,
  clientSecret,
  enabled = true,
}: AuthProviderProps) => {
  const tokenState = useClientCredentialsToken({
    tokenUrl: tokenUrl ?? '',
    clientId: clientId ?? '',
    clientSecret: clientSecret ?? '',
    enabled: enabled,
  });

  return (
    <AuthContext.Provider
      value={{
        enabled,
        accessToken: tokenState.accessToken,
        authorizationHeader: tokenState.authorizationHeader,
        expiresAt: tokenState.expiresAt,
        isAuthenticated: Boolean(tokenState.accessToken) && !tokenState.isExpired,
        isExpired: tokenState.isExpired,
        isLoading: tokenState.isLoading,
        error: tokenState.error,
        requestToken: tokenState.requestToken,
        clearToken: tokenState.clearToken,
        serverUrl: __API_BASE__,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Error on context: useAuth must be used inside AuthProvider');
  }

  return context;
};
