import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AUTHOR_ENDPOINT,
  MANUFACTURER_ENDPOINT,
  PROTOCOLS,
  REPOSITORY_ENDPOINT,
} from '../utils/constants';

import { fetchLocalDataFilters } from '../services/localData';
import { useAuth } from './AuthContext';

interface FilterContextType {
  repositories: FilterData[];
  manufacturers: FilterData[];
  authors: FilterData[];
  protocols: FilterData[];
  loading: boolean;
  errorFetchData: string | null;
}

interface FilterProviderProps {
  readonly children: React.ReactNode;
}

const normalizeAuthor = (raw: string): string => {
  const firstSegment = raw.split('/')[0]?.trim() ?? '';
  if (!firstSegment) return '';
  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const { accessToken } = useAuth();

  const [repositories, setRepositories] = useState<FilterData[]>([]);
  const [manufacturers, setManufacturers] = useState<FilterData[]>([]);
  const [authors, setAuthors] = useState<FilterData[]>([]);
  const [protocols, setProtocols] = useState<FilterData[]>(PROTOCOLS);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorFetchData, setErrorFetchData] = useState<string | null>(null);

  async function fetchApiDataFilters(): Promise<{
    nextProtocols: FilterData[];
    nextManufacturers: FilterData[];
    nextAuthors: FilterData[];
    nextRepositories: FilterData[];
  }> {
    let nextProtocols: FilterData[] = [];
    let nextManufacturers: FilterData[] = [];
    let nextAuthors: FilterData[] = [];
    let nextRepositories: FilterData[] = [];

    try {
      console.log('Fetching filter data from API with access token:', accessToken);
      const [reposRes, manufacturersRes, authorsRes] = await Promise.all([
        fetch(`${__API_BASE__}/${REPOSITORY_ENDPOINT}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${__API_BASE__}/${MANUFACTURER_ENDPOINT}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${__API_BASE__}/${AUTHOR_ENDPOINT}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (!reposRes.ok || !manufacturersRes.ok || !authorsRes.ok) {
        throw new Error('Failed to fetch filter data');
      }

      const [reposJson, manufacturersJson, authorsJson] = await Promise.all([
        reposRes.json(),
        manufacturersRes.json(),
        authorsRes.json(),
      ]);

      nextManufacturers = (manufacturersJson.data || []).map((manufacturer: string) => ({
        value: manufacturer,
        label: manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1),
        checked: false,
      }));

      nextAuthors = (authorsJson.data || []).map((author: string) => ({
        value: author,
        label: author.charAt(0).toUpperCase() + author.slice(1),
        checked: false,
      }));

      nextRepositories = (reposJson.data || []).map((repo: { name: string }) => ({
        value: repo.name,
        label: repo.name.charAt(0).toUpperCase() + repo.name.slice(1),
        checked: false,
      }));

      if (
        nextAuthors.length === 0 &&
        nextManufacturers.length === 0 &&
        nextRepositories.length === 0
      ) {
        throw new Error('No filter data available');
      }
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'fecthApiDataFilters unknown error');
    }
    return { nextProtocols, nextManufacturers, nextAuthors, nextRepositories };
  }

  useEffect(() => {
    const controller = new AbortController();

    const isAbortError = (err: unknown): boolean =>
      err instanceof DOMException && err.name === 'AbortError';

    async function loadData() {
      let nextAuthors: FilterData[] = [];
      let nextManufacturers: FilterData[] = [];
      let nextProtocols: FilterData[] = [];
      let nextRepositories: FilterData[] = [];

      if (__DEPLOY_TYPE__ === 'TYPE_TMC-UI-CATALOG' || __DEPLOY_TYPE__ === 'TYPE_CATALOG-TMC-UI') {
        setLoading(true);
        const result = await fetchLocalDataFilters(import.meta.env.BASE_URL).catch(
          (err: unknown) => {
            if (!isAbortError(err)) {
              setErrorFetchData(err instanceof Error ? err.message : 'Unknown error');
              setLoading(false);
              console.error('Error fetching local filters:', err);
            }
          },
        );

        if (result) {
          ({ nextProtocols, nextManufacturers, nextAuthors, nextRepositories } = result);
        }

        const normalizedAuthors = Array.from(
          new Set(nextAuthors.map((author) => normalizeAuthor(author.value)).filter(Boolean)),
        ).map((name) => ({
          value: name,
          label: name,
          checked: false,
        }));

        nextAuthors = normalizedAuthors;

        setLoading(false);
      } else {
        setLoading(true);
        const result = await fetchApiDataFilters().catch((err: unknown) => {
          if (!isAbortError(err)) {
            setErrorFetchData(err instanceof Error ? err.message : 'Unknown error');
            setLoading(false);
            console.error('Error fetching filters:', err);
          }
        });
        if (result) {
          ({ nextProtocols, nextManufacturers, nextAuthors, nextRepositories } = result);
        }
        setLoading(false);
      }
      setProtocols(nextProtocols);
      setManufacturers(nextManufacturers);
      setAuthors(nextAuthors);
      setRepositories(nextRepositories);
      setErrorFetchData(null);
    }
    loadData();
    return () => controller.abort();
  }, []);

  return (
    <FilterContext.Provider
      value={{
        repositories,
        manufacturers,
        authors,
        protocols,
        loading,
        errorFetchData,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider');
  return ctx;
};
