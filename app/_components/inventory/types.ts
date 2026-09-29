export interface FetchFailure {
  instance: string;
  status: number;
  detail: string;
}
export interface ServerResponseError {
  code: string;
  detail: string;
  instance: string;
  status: number;
  title: string;
}

export interface SettledFetchResult<T> {
  data: T;
  failure: FetchFailure | null;
}

export const allFilterKeys = ['repository', 'manufacturer', 'author', 'protocol'] as const;
export type FilterKey = (typeof allFilterKeys)[number];

export type Filters = Record<FilterKey, FilterData[] | { errorMessage: string }>;
export type FilterData = {
  value: string;
  checked: boolean;
};
export const initialFilters: Filters = {
  author: [],
  manufacturer: [],
  protocol: [],
  repository: [],
};

export type CheckedFilterOptions = Record<FilterKey, string[]>;

export type FilterOptionParam =
  | FilterOptionsFetchFunctionParams
  | {
      skip: true;
    };

export interface FilterOptionsFetchFunctionParams {
  endpoint: string;
  transform?: (res: any) => string[];
}
