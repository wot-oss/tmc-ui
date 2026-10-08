import { fetchDataFromTxT } from '@/lib/services/localData';
import {
  AUTHORS_FILENAME,
  MANUFACTURERS_FILENAME,
  AUTHOR_ENDPOINT,
  MANUFACTURER_ENDPOINT,
  REPOSITORY_ENDPOINT,
  PROTOCOLS,
} from '@/lib/utils/constants';
import type {
  Filters,
  FilterKey,
  FilterOptionParam,
  FilterData,
  FilterOptionsFetchFunctionParams,
} from '../inventory/types';

export async function getAvailableFilterOptionsClient(): Promise<Filters> {
  const filterOptionParams: Record<FilterKey, FilterOptionParam> = {
    author: {
      endpoint: AUTHORS_FILENAME,
      transform: (res: FilterData[]) =>
        Array.from(new Set(res.map((author) => normalizeAuthor(author.value)).filter(Boolean))),
    },
    manufacturer: {
      endpoint: MANUFACTURERS_FILENAME,
    },
    repository: {
      skip: true,
    },
    protocol: {
      skip: true,
    },
  };

  const fetchFunction = async ({ transform, endpoint }: FilterOptionsFetchFunctionParams) => {
    const res = await fetchDataFromTxT(window.location.origin, endpoint);
    return transform ? transform(res) : res;
  };
  const filterOptionsResult = await getFilterOptionsResults(filterOptionParams, fetchFunction);

  // Manual fetch for skipped filters here:
  filterOptionsResult.repository = [];
  // TODO: protocols

  return filterOptionsResult;
}

export async function getAvailableFilterOptionsServer(
  authorizationHeader: string,
  signal?: AbortSignal,
): Promise<Filters> {
  const headers = {
    Authorization: authorizationHeader,
  };

  const filterOptionParams: Record<FilterKey, FilterOptionParam> = {
    author: {
      endpoint: AUTHOR_ENDPOINT,
      transform: (json: any) => (json as { data?: string[] } | null)?.data ?? [],
    },
    manufacturer: {
      endpoint: MANUFACTURER_ENDPOINT,
      transform: (json: any) => (json as { data?: string[] } | null)?.data ?? [],
    },
    repository: {
      endpoint: REPOSITORY_ENDPOINT,
      transform: (json: any) =>
        ((json as { data?: { name: string }[] } | null)?.data ?? []).map(({ name }) => name),
    },
    protocol: {
      skip: true,
    },
  };

  const fetchFunction = async ({ endpoint, transform }: FilterOptionsFetchFunctionParams) => {
    return await fetchAvailableFilterOptionsServer({ endpoint, transform, signal, headers });
  };

  const filterOptionResults = await getFilterOptionsResults(filterOptionParams, fetchFunction);
  // Manual fetch for skipped filters here:
  filterOptionResults.protocol = PROTOCOLS;

  return filterOptionResults;
}

async function getFilterOptionsResults(
  filterOptionParams: Record<FilterKey, FilterOptionParam>,
  fetchFunction: ({ endpoint, transform }: FilterOptionsFetchFunctionParams) => Promise<string[]>,
): Promise<Filters> {
  const filterOptionResults = {} as Filters;

  await Promise.all(
    Object.entries(filterOptionParams).map(async ([filterKey, value]): Promise<void> => {
      if ('skip' in value) {
        return;
      }
      const typedKey = filterKey as FilterKey;
      try {
        const apiResponse = await fetchFunction({
          endpoint: value.endpoint,
          transform: value.transform,
        });
        if (apiResponse.length === 0) {
          filterOptionResults[typedKey] = {
            errorMessage: `No filter data available`,
          };
        } else {
          // Distinct filter values
          filterOptionResults[typedKey] = [...new Set(apiResponse.map((s) => s.toLowerCase()))].map(
            (value) => ({ value, checked: false }),
          );
        }
      } catch (err) {
        filterOptionResults[typedKey] = {
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    }),
  );
  return filterOptionResults;
}

export async function fetchAvailableFilterOptionsServer({
  endpoint,
  headers,
  signal,
  transform,
}: {
  endpoint: string;
  transform?: (json: unknown) => string[];
  headers?: HeadersInit;
  signal?: AbortSignal;
}): Promise<string[]> {
  try {
    const apiResponse = await fetch(`${process.env.API_BASE}/${endpoint}`, {
      headers,
      signal,
    });
    if (!apiResponse.ok) {
      throw new Error(`${endpoint}: HTTP ${apiResponse.status}`);
    }
    const result = transform ? transform(await apiResponse.json()) : await apiResponse.json();
    return result;
  } catch (error) {
    if (signal?.aborted) return [];
    throw error;
  }
}

export function normalizeAuthor(raw: string): string {
  const firstSegment = raw.split('/')[0]?.trim() ?? '';
  if (!firstSegment) return '';
  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
}
