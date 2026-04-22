import React, { useCallback, useEffect, useState } from 'react';
import {
  AUTHOR_ENDPOINT,
  MANUFACTURER_ENDPOINT,
  PROTOCOLS,
  REPOSITORY_ENDPOINT,
} from '../utils/constants';

import { fetchLocalDataFilters } from '../services/localData';
import { useAuth } from '../hooks/useAuth';
import { FilterContext } from './index';

interface FilterProviderProps {
  readonly children: React.ReactNode;
}

interface FetchFailure {
  instance: string;
  status: number;
  detail: string;
}
interface ServerResponseError {
  code: string;
  detail: string;
  instance: string;
  status: number;
  title: string;
}

interface SettledFetchResult<T> {
  data: T;
  failure: FetchFailure | null;
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
    const body = (await response.json().catch(() => null)) as ServerResponseError | null;

    instance = body?.instance ?? fallbackInstance;
    detail = body?.detail ?? body?.title ?? body?.code ?? detail;
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

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === 'AbortError';

const parseRejectedFetchFailure = (reason: unknown, fallbackInstance: string): FetchFailure => ({
  instance: fallbackInstance,
  status: 0,
  detail: reason instanceof Error ? reason.message : 'Request failed before receiving a response',
});

const resolveSettledFetch = async <T,>(
  result: PromiseSettledResult<Response>,
  fallbackInstance: string,
  mapResponse: (json: unknown) => T,
  fallbackData: T,
): Promise<SettledFetchResult<T>> => {
  if (result.status === 'rejected') {
    if (isAbortError(result.reason)) {
      throw result.reason;
    }

    return {
      data: fallbackData,
      failure: parseRejectedFetchFailure(result.reason, fallbackInstance),
    };
  }

  if (!result.value.ok) {
    return {
      data: fallbackData,
      failure: await parseFailedResponse(result.value, fallbackInstance),
    };
  }

  const json = await result.value.json().catch((reason: unknown) => {
    throw parseRejectedFetchFailure(reason, fallbackInstance);
  });

  return {
    data: mapResponse(json),
    failure: null,
  };
};

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
      nextManufacturers: FilterData[];
      nextAuthors: FilterData[];
      nextRepositories: FilterData[];
      errorMessage: string | null;
    }> => {
      let nextManufacturers: FilterData[] = [];
      let nextAuthors: FilterData[] = [];
      let nextRepositories: FilterData[] = [];
      let errorMessage: string | null = null;

      const headers = {
        Authorization: nextAuthorizationHeader,
      };

      const [reposRes, manufacturersRes, authorsRes] = await Promise.allSettled([
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

      const [reposResult, manufacturersResult, authorsResult] = await Promise.all([
        resolveSettledFetch(
          reposRes,
          REPOSITORY_ENDPOINT,
          (json) =>
            ((json as { data?: { name: string }[] } | null)?.data ?? []).map((repo) => ({
              value: repo.name,
              label: repo.name.charAt(0).toUpperCase() + repo.name.slice(1),
              checked: false,
            })),
          [] as FilterData[],
        ),
        resolveSettledFetch(
          manufacturersRes,
          MANUFACTURER_ENDPOINT,
          (json) =>
            ((json as { data?: string[] } | null)?.data ?? []).map((manufacturer) => ({
              value: manufacturer,
              label: manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1),
              checked: false,
            })),
          [] as FilterData[],
        ),
        resolveSettledFetch(
          authorsRes,
          AUTHOR_ENDPOINT,
          (json) =>
            ((json as { data?: string[] } | null)?.data ?? []).map((author) => ({
              value: author,
              label: author.charAt(0).toUpperCase() + author.slice(1),
              checked: false,
            })),
          [] as FilterData[],
        ),
      ]);

      nextRepositories = reposResult.data;
      nextManufacturers = manufacturersResult.data;
      nextAuthors = authorsResult.data;

      const failures = [
        reposResult.failure,
        manufacturersResult.failure,
        authorsResult.failure,
      ].filter((failure): failure is FetchFailure => failure !== null);

      if (failures.length > 0) {
        errorMessage = failures
          .map(
            (failure) =>
              `instance: ${failure.instance} | status: ${failure.status} | detail: ${failure.detail}`,
          )
          .join(' ; ');
      }

      if (!nextRepositories.length && !nextManufacturers.length && !nextAuthors.length) {
        errorMessage = errorMessage ?? 'No filter data available';
      }

      return { nextManufacturers, nextAuthors, nextRepositories, errorMessage };
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      let nextProtocols: FilterData[] = PROTOCOLS;
      let nextAuthors: FilterData[] = [];
      let nextManufacturers: FilterData[] = [];
      let nextRepositories: FilterData[] = [];
      let nextError: string | null = null;

      if (__DEPLOY_TYPE__ === 'TYPE_TMC-UI-CATALOG' || __DEPLOY_TYPE__ === 'TYPE_CATALOG-TMC-UI') {
        setLoading(true);
        const result = await fetchLocalDataFilters(import.meta.env.BASE_URL).catch(
          (err: unknown) => {
            if (!isAbortError(err)) {
              nextError = err instanceof Error ? err.message : 'Unknown error';
              setLoading(false);
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
          return;
        }

        if (enabled && !authorizationHeader) {
          setLoading(true);
          return;
        }

        if (error) {
          setErrorFetchData(error);
          setLoading(false);
          return;
        }

        setLoading(true);

        const result = await fetchApiDataFilters(
          authorizationHeader ?? '',
          controller.signal,
        ).catch((err: unknown) => {
          if (!isAbortError(err)) {
            nextError = err instanceof Error ? err.message : 'Unknown error';
          }
        });
        if (result) {
          ({ nextManufacturers, nextAuthors, nextRepositories } = result);
          nextError = result.errorMessage;
        }
        setLoading(false);
      }

      setManufacturers(nextManufacturers);
      setProtocols(nextProtocols);
      setAuthors(nextAuthors);
      setRepositories(nextRepositories);
      setErrorFetchData(nextError);
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
