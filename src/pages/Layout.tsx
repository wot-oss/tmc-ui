import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFilters } from '../context/FilterContext';
import { useLoaderData, useNavigation } from 'react-router-dom';
import GridList from '../components/GridList';
import Search from '../components/Search';
import SideBar from '../components/SideBar';
import Pagination from '../components/Pagination';
import { INVENTORY_ENDPOINT, PROTOCOLS, PROTOCOLS_FILTER } from '../utils/constants';

const Layout: React.FC = () => {
  const loadedItems = useLoaderData() as Item[];
  const [items, setItems] = useState<Item[]>(loadedItems);

  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  const [error, setError] = useState<string | null>(null);
  const [isResetClicked, setIsResetClicked] = useState(false);

  const [query, setQuery] = useState('');

  const { repositories, manufacturers, authors, loading: filtersLoading } = useFilters();

  const [repositoriesState, setRepositoriesState] = useState<FilterData[]>([]);
  const [manufacturersState, setManufacturersState] = useState<FilterData[]>([]);
  const [authorsState, setAuthorsState] = useState<FilterData[]>([]);
  const [protocolsState, setProtocolsState] = useState<FilterData[]>(PROTOCOLS);

  const [protocolFilteredItems, setProtocolFilteredItems] = useState<Item[] | null>(null);
  const selectedProtocols = useMemo(
    () => protocolsState.filter((p) => p.checked).map((p) => p.value),
    [protocolsState],
  );
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  useEffect(() => {
    if (repositories.length > 0 && repositoriesState.length === 0) {
      setRepositoriesState(repositories);
    }
  }, [repositories]);

  useEffect(() => {
    if (manufacturers.length > 0 && manufacturersState.length === 0) {
      setManufacturersState(manufacturers);
    }
  }, [manufacturers]);

  useEffect(() => {
    if (authors.length > 0 && authorsState.length === 0) {
      setAuthorsState(authors);
    }
  }, [authors]);

  useEffect(() => {
    if (!__API_BASE__) return;
    if (selectedProtocols.length === 0) {
      setProtocolFilteredItems(null);
      return;
    }
    const filterProtocols: string = selectedProtocols ? selectedProtocols.join(',') : '';

    const controller = new AbortController();
    const fetchProtocols = async () => {
      try {
        const fp = encodeURIComponent(filterProtocols);
        const res = await fetch(`${__API_BASE__}/${INVENTORY_ENDPOINT}?${PROTOCOLS_FILTER}${fp}`, {
          signal: controller.signal,
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
  }, [selectedProtocols]);

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
          checkedAuthors.includes(item['schema:author']?.['schema:name']);

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
    setIsResetClicked(true);
    setTimeout(() => setIsResetClicked(false), 150);
    setPage(1);
  };

  return (
    <>
      <div className="bg-bgBodyPrimary py-10">
        <main>
          <div
            id="search-bar"
            className="mb-10 flex flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center"
          >
            <div className="hidden md:block md:w-1/4 lg:w-1/5" />
            <div className="w-full md:w-2/4 lg:w-3/5">
              <Search
                query={query}
                onSearch={setQuery}
                onResultsChange={handleSearchResults}
                baseItems={loadedItems}
              />
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/5" />
          </div>

          <div className="max-w-screen-3xl flex flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
            {/* Sidebar */}
            <aside
              className="w-full rounded-lg p-4 shadow-sm outline outline-1 -outline-offset-1 outline-gray-200 lg:w-1/4"
              aria-label="Filters"
            >
              <SideBar
                manufacturersState={manufacturersState}
                authorsState={authorsState}
                repositoriesState={repositoriesState}
                protocolsState={protocolsState}
                onFilterChange={handleFilterChange}
              />
            </aside>

            {/* Results */}
            <section className="w-3/4 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <p className="text-lg">
                  {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} found
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`w-64 rounded bg-buttonPrimary px-3 py-2 text-sm text-textWhite disabled:opacity-40 ${
                    isResetClicked
                      ? 'bg-buttonOnClick hover:bg-buttonOnClick'
                      : 'bg-buttonPrimary hover:bg-buttonOnHover'
                  }`}
                >
                  Reset filters
                </button>
                <label className="flex items-center gap-2 text-sm text-textValue">
                  TMs per page:
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded border border-buttonBorder bg-bgBodyPrimary px-2 py-1 text-sm hover:border-buttonOnHover"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                {query && filteredItems.length === 0 && (
                  <span className="text-sm text-textLabel">(No matches for "{query}")</span>
                )}
              </div>
              <GridList items={paginatedItems} loading={isLoading} error={error} />

              <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
