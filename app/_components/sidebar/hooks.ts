import { fetchApiDataInventory } from '@/lib/services/apiData';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  type Filters,
  initialFilters,
  type FilterKey,
  type CheckedFilterOptions,
} from '../inventory/types';
import { getAvailableFilterOptionsServer, getAvailableFilterOptionsClient } from './utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { isNonEmptyString } from '@/lib/utils/strings';
import { fetchLocalDataInventory } from '@/lib/services/localData';
import _ from 'lodash';

const DEFAULT_PAGE_SIZE = 10;

export function useInventory() {
  const { authorizationHeader } = useAuth();
  const isServerAvailable = isNonEmptyString(process.env.SERVER_URL);

  // Inventory
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const baseInventory = useRef<InventoryItem[]>([]);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredInventory.length / pageSize)),
    [filteredInventory.length, pageSize],
  );

  // Filters
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [areAvailableFiltersLoading, setAreAvailableFiltersLoading] = useState<boolean>(true);
  // Used to check for new changes to enable the "Apply filters" button
  const [appliedCheckedOptions, setAppliedCheckedOptions] = useState<CheckedFilterOptions>(
    {} as CheckedFilterOptions,
  );

  // filterInventory depends on checkedFilterOptions, thus needs useMemo()
  const checkedFilterOptions: CheckedFilterOptions = useMemo(() => {
    const _checkedFilterOptions = {} as CheckedFilterOptions;
    for (const filterKey of Object.keys(filters)) {
      const key = filterKey as FilterKey;
      if ('errorMessage' in filters[key]) continue;
      const filteredOptions = filters[key].filter((opt) => opt.checked).map((opt) => opt.value);
      if (filteredOptions.length === 0) continue;
      _checkedFilterOptions[key] = filteredOptions;
    }
    return _checkedFilterOptions;
  }, [filters]);

  const didFiltersChange = useMemo(
    () => !_.isEqual(checkedFilterOptions, appliedCheckedOptions),
    [appliedCheckedOptions, checkedFilterOptions],
  );

  function toggleFilter(filterType: FilterKey, optionValue: string) {
    setFilters((prevFilters) => {
      if ('errorMessage' in prevFilters[filterType]) {
        return prevFilters;
      }
      return {
        ...prevFilters,
        [filterType]: prevFilters[filterType].map((opt) =>
          opt.value === optionValue ? { ...opt, checked: !opt.checked } : opt,
        ),
      };
    });
  }

  const resetFilters = () => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      for (const key of Object.keys(newFilters)) {
        const filterKey = key as FilterKey;
        if ('errorMessage' in newFilters[filterKey]) continue;
        const newOptions = newFilters[filterKey].map((opt) => ({ ...opt, checked: false }));
        newFilters[filterKey] = newOptions;
      }
      return newFilters;
    });
    setPage(1);
  };

  const applyFilters = useCallback(
    async (isInitialLoad?: boolean) => {
      setInventoryError(null);
      setIsInventoryLoading(true);
      const controller = new AbortController();
      try {
        let nextFilteredInventory: InventoryItem[];
        if (isServerAvailable) {
          //Server Filtering
          const { data } = await fetchApiDataInventory(
            process.env.API_BASE,
            {
              signal: controller.signal,
              authorizationHeader,
              filters: checkedFilterOptions,
            },
            page,
            pageSize,
          );
          console.log({ data });
          nextFilteredInventory = data as InventoryItem[];
        } else {
          // Client Filtering
          if (isInitialLoad) {
            const response = await fetchLocalDataInventory();
            const filteredInventory = response.filter((item) => item['schema:mpn'] !== '');
            nextFilteredInventory = filteredInventory;
          } else {
            nextFilteredInventory = filteredInventory.filter((item) => {
              const matchesCatalog =
                checkedFilterOptions.repository?.length === 0 ||
                checkedFilterOptions.repository?.includes(item.repo);
              const matchesManufacturer =
                checkedFilterOptions.manufacturer?.length === 0 ||
                checkedFilterOptions.manufacturer?.includes(
                  item['schema:manufacturer']?.['schema:name'],
                );
              const matchesAuthor =
                checkedFilterOptions.author?.length === 0 ||
                checkedFilterOptions.author?.some((author) =>
                  item.name?.toLowerCase().includes(author.toLowerCase()),
                );
              return matchesCatalog && matchesManufacturer && matchesAuthor;
            });
          }
        }
        setPage(1);
        setFilteredInventory(nextFilteredInventory);
        setAppliedCheckedOptions(checkedFilterOptions);
        if (!nextFilteredInventory.length) {
          setInventoryError(
            isInitialLoad ? 'The inventory is empty' : 'No items match these filters',
          );
        }
        return nextFilteredInventory;
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        console.error(err);
        setInventoryError("That didn't work. Please try again.");
      } finally {
        setIsInventoryLoading(false);
      }
    },
    [
      authorizationHeader,
      checkedFilterOptions,
      filteredInventory,
      isServerAvailable,
      page,
      pageSize,
    ],
  );

  // Load the inventory and the available filters on mount
  useEffect(() => {
    const controller = new AbortController();

    async function loadInventory() {
      baseInventory.current = (await applyFilters(true)) ?? [];
    }

    async function loadFilters() {
      setAreAvailableFiltersLoading(true);
      let filterOptionResults: Filters;

      if (process.env.SERVER_URL) {
        filterOptionResults = await getAvailableFilterOptionsServer(
          authorizationHeader ?? '',
          controller.signal,
        );
      } else {
        filterOptionResults = await getAvailableFilterOptionsClient();
      }

      setFilters(filterOptionResults);
      setAreAvailableFiltersLoading(false);
    }

    void loadInventory();
    void loadFilters();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChangeServer = useCallback(
    async (newPage: number) => {
      if (!process.env.SERVER_URL) return;
      setPage(newPage);

      const controller = new AbortController();

      try {
        const { data } = await fetchApiDataInventory(
          process.env.API_BASE,
          {
            signal: controller.signal,
            authorizationHeader,
            filters: checkedFilterOptions,
          },
          newPage,
          pageSize,
        );

        setFilteredInventory(data as InventoryItem[]);
      } catch {
        if (controller.signal.aborted) return;
        setInventoryError('Could not fetch inventory data');
      }
    },
    [authorizationHeader, checkedFilterOptions, pageSize],
  );

  // Pagination
  const handlePageSizeChangeServer = useCallback(
    async (newPageSize: number) => {
      setPageSize(newPageSize);
      setPage(1);

      if (!process.env.SERVER_URL) return;

      const controller = new AbortController();

      try {
        const { data } = await fetchApiDataInventory(
          process.env.API_BASE,
          {
            signal: controller.signal,
            authorizationHeader,
            filters: checkedFilterOptions,
          },
          1,
          newPageSize,
        );

        setFilteredInventory(data as InventoryItem[]);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        console.error(err);
      }
    },
    [authorizationHeader, checkedFilterOptions],
  );

  return {
    applyFilters,
    filters,
    baseInventory: baseInventory.current,
    setInventoryError,
    filteredInventory,
    setFilteredInventory,
    didFiltersChange,
    areAvailableFiltersLoading,
    toggleFilter,
    inventoryError,
    page,
    setPage,
    totalPages,
    pageSize,
    isInventoryLoading,
    resetFilters,
    handlePageChangeServer,
    handlePageSizeChangeServer,
  };
}
