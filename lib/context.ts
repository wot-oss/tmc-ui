import { createContext } from 'react';
import type { ReactNode } from 'react';
import type { RequestClientCredentialsTokenResult } from './services/auth';
import { type FilterData } from '@/app/_components/inventory/types';

export interface AuthProviderProps {
  readonly children: ReactNode;
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly isAuthenticationEnabled: boolean;
  readonly seedToken?: RequestClientCredentialsTokenResult | null;
}

export interface AuthContextType {
  readonly authorizationHeader: string | null;
  readonly clearToken: () => void;
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
