'use client';
import Loader from './_components/base/Loader';
import Dropdown from './_components/base/Dropdown';
import InventoryResults from './_components/inventory/InventoryResults';
import Pagination from './_components/Pagination';
import { Search } from './_components/Search';
import { SideBar } from './_components/sidebar/SideBar';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { fetchApiDataInventory } from '@/lib/services/apiData';
import { fetchLocalDataInventory } from '@/lib/services/localData';
import _ from 'lodash';
import {
  initialFilters,
  type Filters,
  type CheckedFilterOptions,
  type FilterKey,
} from './_components/filters/types';
import {
  getAvailableFilterOptionsServer,
  getAvailableFilterOptionsClient,
} from './_components/sidebar/utils';
import { ErrorUI } from './_components/error/ErrorUI';
import { type InventoryItem } from './_components/inventory/types';

const DEFAULT_PAGE_SIZE = 10;

// TODO: check if signals are actually necessary
export default function InventoryLoad() {
  const { authorizationHeader } = useAuth();

  // Inventory
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const baseInventory = useRef<InventoryItem[]>([]);
  console.log({ filteredInventory });

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

  // TODO: apply the reset filters immediately
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
        if (process.env.SERVER_URL) {
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
    [authorizationHeader, checkedFilterOptions, filteredInventory, page, pageSize],
  );

  // TODO: items are being fetched twice from the server
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

  const onSearchResponse = useCallback(
    (results: InventoryItem[], query: string) => {
      setFilteredInventory(results);
      setPage(1);
      if (results.length === 0) {
        setInventoryError(`No results found for "${query}"`);
      }
    },
    [setFilteredInventory, setInventoryError, setPage],
  );

  const paginatedItems = useMemo<InventoryItem[]>(() => {
    const start = (page - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [filteredInventory, page, pageSize]);

  // Defer the heavy grid updates so checkbox/filter interactions paint immediately
  // while the (memoized) GridList re-renders at a lower priority.
  const deferredPaginatedItems = useDeferredValue(paginatedItems);
  const deferredFilteredItems = useDeferredValue(filteredInventory);

  if (isInventoryLoading) {
    return <Loader text="Loading inventory..." />;
  }

  return (
    <>
      <div className="bg-surface-canvas min-h-dvh py-10">
        <main>
          <div
            id="search-bar"
            className="mb-10 flex justify-center gap-4 px-4 sm:px-6 md:flex-row md:items-center"
          >
            <div className="w-full md:w-3/4 lg:w-3/5">
              {process.env.SERVER_URL && (
                <Search
                  onSearchResponse={onSearchResponse}
                  baseInventory={baseInventory.current}
                  setError={setInventoryError}
                />
              )}
            </div>
          </div>
          <div className="max-w-screen-3xl flex flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
            {/* Sidebar */}
            <aside className="w-full rounded-lg lg:w-1/4 lg:max-w-72" aria-label="Filters">
              <SideBar
                filters={filters}
                onFilterCheck={toggleFilter}
                resetFilters={resetFilters}
                areAvailableFiltersLoading={areAvailableFiltersLoading}
                didFiltersChange={didFiltersChange}
                applyFilters={applyFilters}
              />
            </aside>

            {/* Results */}
            {inventoryError ? (
              <ErrorUI
                title={"Couldn't load inventory"}
                description={inventoryError}
                buttonText="Retry"
                buttonOnclick={applyFilters}
              />
            ) : (
              <section className="w-full flex-1 lg:w-3/4">
                <div className="text-text-primary mb-4 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-lg">
                    <span className="text-(--color-icon-brand)">{filteredInventory.length}</span>{' '}
                    result
                    {filteredInventory.length !== 1 ? 's' : ''} of {baseInventory.current.length}{' '}
                    catalog TMs matched
                  </p>

                  <label className="text-text-primary flex items-center gap-2 text-sm">
                    TMs per page:
                    <Dropdown
                      id="page-size"
                      label="TMs per page"
                      value={String(pageSize)}
                      onChange={async (value) => {
                        await handlePageSizeChangeServer(Number(value));
                      }}
                      options={[10, 20, 50, 100].map((n) => ({
                        key: String(n),
                        value: String(n),
                      }))}
                      showChevron={true}
                      className="bg-surface-canvas rounded px-2 py-1 pr-10 text-sm"
                    />
                  </label>
                </div>

                {process.env.SERVER_URL ? (
                  <div>
                    {areAvailableFiltersLoading && <Loader text="Loading catalog..." />}
                    {!areAvailableFiltersLoading && (
                      <InventoryResults
                        items={deferredFilteredItems}
                        loading={isInventoryLoading}
                      />
                    )}

                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChangeServer}
                    />
                  </div>
                ) : (
                  <div>
                    {areAvailableFiltersLoading && <Loader text="Loading catalog..." />}
                    {!areAvailableFiltersLoading && (
                      <InventoryResults
                        items={deferredPaginatedItems}
                        loading={isInventoryLoading}
                      />
                    )}

                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={(p) => setPage(p)}
                    />
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
