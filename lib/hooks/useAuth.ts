import { useContext } from 'react';
import { AuthContext } from '../context';

/**
 * Gets the context from AuthContext which is set in AuthenticationGuard.tsx
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Error on context: useAuth must be used inside AuthProvider');
  }

  return context;
};
