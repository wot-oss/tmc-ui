import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFilters } from '../hooks/useFilters';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from 'react-router-dom';
import GridList from '../components/GridList';
import Search from '../components/Search';
import SideBar from '../components/SideBar';
import Pagination from '../components/Pagination';
import Loader from '../components/base/Loader';
import Button from '../components/base/Button';
import Dropdown from '../components/base/Dropdown';
import { INVENTORY_ENDPOINT, PROTOCOLS_FILTER } from '../utils/constants';

const Layout: React.FC<{
  loadedItems: Item[];
  inventoryLoading: boolean;
  inventoryError: string | null;
}> = ({ loadedItems, inventoryLoading, inventoryError }) => {
  const [items, setItems] = useState<Item[]>(loadedItems ?? []);

  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading' || inventoryLoading;

  const [query, setQuery] = useState('');

  const { repositories, manufacturers, authors, protocols, loading, errorFetchData } = useFilters();
  const { authorizationHeader, enabled, error: authError, isLoading: authLoading } = useAuth();

  const [repositoriesState, setRepositoriesState] = useState<FilterData[]>([]);
  const [manufacturersState, setManufacturersState] = useState<FilterData[]>([]);
  const [authorsState, setAuthorsState] = useState<FilterData[]>([]);
  const [protocolsState, setProtocolsState] = useState<FilterData[]>(protocols);

  const [protocolFilteredItems, setProtocolFilteredItems] = useState<Item[] | null>(null);
  const selectedProtocols = useMemo(
    () => protocolsState.filter((p) => p.checked).map((p) => p.value),
    [protocolsState],
  );
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  useEffect(() => {
    setItems(loadedItems ?? []);
  }, [loadedItems]);

  useEffect(() => {
    if (repositories.length === 0) return;

    setRepositoriesState((prev) => (prev.length === 0 ? repositories : prev));
  }, [repositories]);

  useEffect(() => {
    if (manufacturers.length === 0) return;

    setManufacturersState((prev) => (prev.length === 0 ? manufacturers : prev));
  }, [manufacturers]);

  useEffect(() => {
    if (authors.length === 0) return;

    setAuthorsState((prev) => (prev.length === 0 ? authors : prev));
  }, [authors]);

  useEffect(() => {
    if (__DEPLOY_TYPE__ !== 'SERVER_AVAILABLE') return;

    const controller = new AbortController();

    if (selectedProtocols.length === 0) {
      setProtocolFilteredItems(null);
      return;
    }

    if (enabled && (authLoading || !authorizationHeader)) {
      return () => controller.abort();
    }

    const filterProtocols: string = selectedProtocols ? selectedProtocols.join(',') : '';

    const fetchProtocols = async () => {
      try {
        const fp = encodeURIComponent(filterProtocols);
        const res = await fetch(`${__API_BASE__}/${INVENTORY_ENDPOINT}?${PROTOCOLS_FILTER}${fp}`, {
          signal: controller.signal,
          headers: authorizationHeader ? { Authorization: authorizationHeader } : undefined,
        });
        if (!res.ok) throw new Error(`Protocol fetch failed: ${res.status}`);
        const json = await res.json();
        setProtocolFilteredItems(Array.isArray(json.data) ? json.data : []);
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error(e);
      }
    };

    fetchProtocols();

    return () => controller.abort();
  }, [authorizationHeader, authLoading, enabled, selectedProtocols]);

  const filteredItems = useMemo<Item[]>(() => {
    const checkedRepositories = repositoriesState
      .filter((opt) => opt.checked)
      .map((opt) => opt.value);
    const checkedManufacturers = manufacturersState
      .filter((opt) => opt.checked)
      .map((opt) => opt.value);
    const checkedAuthors = authorsState.filter((opt) => opt.checked).map((opt) => opt.value);

    const hasFilters =
      checkedRepositories.length > 0 ||
      checkedManufacturers.length > 0 ||
      checkedAuthors.length > 0;

    let result = protocolFilteredItems ?? items;

    if (hasFilters) {
      result = items.filter((item) => {
        const matchesCatalog =
          checkedRepositories.length === 0 || checkedRepositories.includes(item.repo);
        const matchesManufacturer =
          checkedManufacturers.length === 0 ||
          checkedManufacturers.includes(item['schema:manufacturer']?.['schema:name']);
        const matchesAuthor =
          checkedAuthors.length === 0 ||
          //checkedAuthors.includes(item["schema:author"]?.["schema:name"]); // case api
          checkedAuthors.some((author) => item.name?.toLowerCase().includes(author.toLowerCase())); // case local

        return matchesCatalog && matchesManufacturer && matchesAuthor;
      });
    }
    return result;
  }, [items, repositoriesState, manufacturersState, authorsState, protocolFilteredItems]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedItems = useMemo<Item[]>(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const handleFilterChange = (sectionId: string, optionValue: string, checked: boolean) => {
    const updateOptions = (prev: FilterData[]) =>
      prev.map((opt) => (opt.value === optionValue ? { ...opt, checked } : opt));

    if (sectionId === 'repository') {
      setRepositoriesState(updateOptions);
    } else if (sectionId === 'manufacturer') {
      setManufacturersState(updateOptions);
    } else if (sectionId === 'author') {
      setAuthorsState(updateOptions);
    } else if (sectionId === 'protocol') {
      setProtocolsState(updateOptions);
    }
  };

  const handleSearchResults = useCallback((results: Item[]) => {
    setItems(results);
    setPage(1);
  }, []);

  const resetFilters = () => {
    setQuery('');
    setRepositoriesState((prev) => prev.map((opt) => ({ ...opt, checked: false })));
    setManufacturersState((prev) => prev.map((opt) => ({ ...opt, checked: false })));
    setAuthorsState((prev) => prev.map((opt) => ({ ...opt, checked: false })));
    setProtocolsState((prev) => prev.map((opt) => ({ ...opt, checked: false })));
    setPage(1);
  };

  return (
    <>
      <div className="min-h-[100dvh] bg-surface-canvas py-10">
        <main>
          <div
            id="search-bar"
            className="mb-10 flex flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center"
          >
            <div className="hidden md:block md:w-1/4 lg:w-1/5" />
            <div className="w-full md:w-2/4 lg:w-3/5">
              {__DEPLOY_TYPE__ === 'SERVER_AVAILABLE' && (
                <Search
                  query={query}
                  onSearch={setQuery}
                  onResultsChange={handleSearchResults}
                  baseItems={loadedItems}
                  authorizationHeader={authorizationHeader}
                  authEnabled={enabled}
                  authLoading={authLoading}
                  authError={authError}
                />
              )}
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/5" />
          </div>

          <div className="max-w-screen-3xl flex flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
            {/* Sidebar */}
            <aside className="w-full rounded-lg p-4 lg:w-1/4" aria-label="Filters">
              {errorFetchData && (
                <div style={{ padding: 12 }}>
                  <strong>Filters unavailable:</strong> {errorFetchData}
                </div>
              )}

              {!errorFetchData && (
                <SideBar
                  manufacturersState={manufacturersState}
                  authorsState={authorsState}
                  repositoriesState={repositoriesState}
                  protocolsState={protocolsState}
                  onFilterChange={handleFilterChange}
                  onAddProtocol={(protocol) => {
                    setProtocolsState((prev) => [...prev, protocol]);
                  }}
                />
              )}
            </aside>

            {/* Results */}
            <section className="w-3/4 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-4 text-text-primary">
                <p className="text-lg">
                  {filteredItems.length} result
                  {filteredItems.length !== 1 ? 's' : ''} found
                </p>
                <Button
                  text="Reset filters"
                  onClick={resetFilters}
                  className="w-64 justify-center rounded border"
                  variant="default"
                />
                <label className="flex items-center gap-2 text-sm text-text-primary">
                  TMs per page:
                  <Dropdown
                    id="page-size"
                    label="TMs per page"
                    value={String(pageSize)}
                    onChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                    options={[10, 20, 50, 100].map((n) => ({
                      key: String(n),
                      value: String(n),
                    }))}
                    showChevron={true}
                    className="rounded bg-surface-canvas px-2 py-1 pr-10 text-sm"
                  />
                </label>
                {query && filteredItems.length === 0 && (
                  <span className="text-sm text-text-secondary">(No matches for "{query}")</span>
                )}
              </div>
              {loading && <Loader text="Loading catalog..." />}
              {!loading && (
                <GridList items={paginatedItems} loading={isLoading} error={inventoryError} />
              )}

              <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
