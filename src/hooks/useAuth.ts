import { useContext } from 'react';
import { AuthContext } from '../context/index';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Error on context: useAuth must be used inside AuthProvider');
  }

  return context;
};
