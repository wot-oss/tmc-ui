import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

interface FetchFailure {
  instance: string;
  status: number;
  detail: string;
}

const normalizeAuthor = (raw: string): string => {
  const firstSegment = raw.split('/')[0]?.trim() ?? '';
  if (!firstSegment) return '';
  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
};

const parseFailedResponse = async (
  response: Response,
  fallbackInstance: string,
): Promise<FetchFailure> => {
  let instance = fallbackInstance;
  let detail = response.statusText || 'Request failed';

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await response.json().catch(() => null)) as {
      instance?: string;
      detail?: string;
      message?: string;
      title?: string;
    } | null;

    instance = body?.instance ?? fallbackInstance;
    detail = body?.detail ?? body?.message ?? body?.title ?? detail;
  } else {
    const text = await response.text().catch(() => '');
    if (text.trim()) {
      detail = text.trim();
    }
  }

  return {
    instance,
    status: response.status,
    detail,
  };
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const { authorizationHeader, enabled, error, isLoading } = useAuth();

  const [repositories, setRepositories] = useState<FilterData[]>([]);
  const [manufacturers, setManufacturers] = useState<FilterData[]>([]);
  const [authors, setAuthors] = useState<FilterData[]>([]);
  const [protocols, setProtocols] = useState<FilterData[]>(PROTOCOLS);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorFetchData, setErrorFetchData] = useState<string | null>(null);

  const fetchApiDataFilters = useCallback(
    async (
      nextAuthorizationHeader: string,
      signal?: AbortSignal,
    ): Promise<{
      nextProtocols: FilterData[];
      nextManufacturers: FilterData[];
      nextAuthors: FilterData[];
      nextRepositories: FilterData[];
    }> => {
      let nextProtocols: FilterData[] = [];
      let nextManufacturers: FilterData[] = [];
      let nextAuthors: FilterData[] = [];
      let nextRepositories: FilterData[] = [];

      try {
        const headers = {
          Authorization: nextAuthorizationHeader,
        };

        const [reposRes, manufacturersRes, authorsRes] = await Promise.all([
          fetch(`${__API_BASE__}/${REPOSITORY_ENDPOINT}`, {
            headers,
            signal,
          }),
          fetch(`${__API_BASE__}/${MANUFACTURER_ENDPOINT}`, {
            headers,
            signal,
          }),
          fetch(`${__API_BASE__}/${AUTHOR_ENDPOINT}`, {
            headers,
            signal,
          }),
        ]);

        const failures: FetchFailure[] = [];

        if (!reposRes.ok) {
          failures.push(await parseFailedResponse(reposRes, REPOSITORY_ENDPOINT));
        }

        if (!manufacturersRes.ok) {
          failures.push(await parseFailedResponse(manufacturersRes, MANUFACTURER_ENDPOINT));
        }

        if (!authorsRes.ok) {
          failures.push(await parseFailedResponse(authorsRes, AUTHOR_ENDPOINT));
        }

        if (failures.length > 0) {
          const message = failures
            .map(
              (failure) =>
                `instance: ${failure.instance} | status: ${failure.status} | detail: ${failure.detail}`,
            )
            .join(' ; ');

          throw new Error(`Failed to fetch the following: ${message}`);
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
        throw new Error(
          err instanceof Error ? err.message : 'Fetch Api Data Filters unknown error',
        );
      }

      return { nextProtocols, nextManufacturers, nextAuthors, nextRepositories };
    },
    [],
  );

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
        if (enabled && isLoading && !authorizationHeader) {
          console.error('0001');
          return;
        }

        if (enabled && !authorizationHeader) {
          console.error('0002');

          setLoading(true);
          return;
        }

        if (error) {
          console.error('0003');
          setErrorFetchData(error);
          setLoading(false);
          return;
        }

        console.error('0004');
        setLoading(true);
        const result = await fetchApiDataFilters(
          authorizationHeader ?? '',
          controller.signal,
        ).catch((err: unknown) => {
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
  }, [authorizationHeader, enabled, error, fetchApiDataFilters, isLoading]);

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
