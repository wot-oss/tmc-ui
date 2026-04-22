import { createContext } from 'react';
import type { ReactNode } from 'react';

export interface AuthProviderProps {
  readonly children: ReactNode;
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly enabled?: boolean;
}

export interface AuthContextType {
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

export interface FilterContextType {
  repositories: FilterData[];
  manufacturers: FilterData[];
  authors: FilterData[];
  protocols: FilterData[];
  loading: boolean;
  errorFetchData: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FilterContext = createContext<FilterContextType | undefined>(undefined);
