'use client';
import Loader from './_components/base/Loader';
import { AppErrorUI } from './_components/AppErrorUI';
import Dropdown from './_components/base/Dropdown';
import GridList from './_components/GridList';
import Pagination from './_components/Pagination';
import { Search } from './_components/Search';
import SideBar from './_components/sidebar/SideBar';
import { useInventory } from './_components/sidebar/hooks';
import { useCallback, useDeferredValue, useMemo } from 'react';

export default function InventoryLoad() {
  const {
    filters,
    baseInventory,
    setInventoryError,
    didFiltersChange,
    setFilteredInventory,
    areAvailableFiltersLoading,
    inventoryError,
    filteredInventory,
    isInventoryLoading,
    resetFilters,
    toggleFilter,
    page,
    pageSize,
    setPage,
    totalPages,
    handlePageSizeChangeServer,
    handlePageChangeServer,
  } = useInventory();

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
  if (inventoryError) {
    return <AppErrorUI title={"Couldn't load inventory"} description={inventoryError} />;
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
                <Search onSearch={onSearchResponse} baseItems={baseInventory} />
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
              />
            </aside>

            {/* Results */}
            <section className="w-full flex-1 lg:w-3/4">
              <div className="text-text-primary mb-4 flex flex-wrap items-center justify-between gap-4">
                <p className="text-lg">
                  <span className="text-(--color-icon-brand)">{filteredInventory.length}</span>{' '}
                  result
                  {filteredInventory.length !== 1 ? 's' : ''} found in the catalog with{' '}
                  {filteredInventory.length} TMs in total
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

              {!process.env.SERVER_URL && (
                <div>
                  {areAvailableFiltersLoading && <Loader text="Loading catalog..." />}
                  {!areAvailableFiltersLoading && (
                    <GridList items={deferredPaginatedItems} loading={isInventoryLoading} />
                  )}

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}

              {process.env.SERVER_URL && (
                <div>
                  {areAvailableFiltersLoading && <Loader text="Loading catalog..." />}
                  {!areAvailableFiltersLoading && (
                    <GridList items={deferredFilteredItems} loading={isInventoryLoading} />
                  )}

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChangeServer}
                  />
                </div>
              )}
            </section>
          </div>
          ;
        </main>
      </div>
    </>
  );
}
