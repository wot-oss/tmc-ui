import { useClientCredentialsToken } from '../hooks/useClientCredentialsToken';
import { AuthContext, type AuthProviderProps } from './index';

export const AuthProvider = ({
  children,
  tokenUrl,
  clientId,
  clientSecret,
  enabled = true,
  seedToken = null,
}: AuthProviderProps) => {
  const tokenState = useClientCredentialsToken({
    tokenUrl: tokenUrl ?? '',
    clientId: clientId ?? '',
    clientSecret: clientSecret ?? '',
    enabled: enabled,
    seedToken,
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
