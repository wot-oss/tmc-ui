import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import GridList from './GridList';
import Search from './Search';
import SideBar from './SideBar';
import capitalizeFirstChar from '../utils/strings';

const TMC_URL = 'http://0.0.0.0:8080';

const Layout: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetClicked, setIsResetClicked] = useState(false);

  const [query, setQuery] = useState('');

  const [repositoriesState, setRepositoriesState] = useState<FilterData[]>([]);
  const [manufacturersState, setManufacturersState] = useState<FilterData[]>([]);
  const [authorsState, setAuthorsState] = useState<FilterData[]>([]);

  useEffect(() => {
    fetch(`${TMC_URL}/inventory`)
      .then((res) => res.json())
      .then((json) => {
        throw Error('BUMP');
        setItems(Array.isArray(json.data) ? json.data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch inventory.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const uniqueRepoNames = new Set(items.filter((item) => item.repo).map((item) => item.repo));
    setRepositoriesState(
      Array.from(uniqueRepoNames).map((repo) => ({
        value: repo,
        label: capitalizeFirstChar(repo),
        checked: false,
      })),
    );

    const uniqueManufacturers = new Set(
      items
        .filter((item) => item['schema:manufacturer']['schema:name'])
        .map((item) => item['schema:manufacturer']['schema:name']),
    );
    setManufacturersState(
      Array.from(uniqueManufacturers).map((manufacturer) => ({
        value: manufacturer,
        label: capitalizeFirstChar(manufacturer),
        checked: false,
      })),
    );

    const uniqueAuthors = new Set(
      items
        .filter((item) => item['schema:author']['schema:name'])
        .map((item) => item['schema:author']['schema:name']),
    );
    setAuthorsState(
      Array.from(uniqueAuthors).map((author) => ({
        value: author,
        label: capitalizeFirstChar(author),
        checked: false,
      })),
    );
  }, [items]);

  const filteredItems = useMemo<Item[]>(() => {
    const checkedCatalogs = repositoriesState.filter((opt) => opt.checked).map((opt) => opt.value);
    const checkedManufacturers = manufacturersState
      .filter((opt) => opt.checked)
      .map((opt) => opt.value);
    const checkedAuthors = authorsState.filter((opt) => opt.checked).map((opt) => opt.value);

    const hasFilters =
      checkedCatalogs.length > 0 || checkedManufacturers.length > 0 || checkedAuthors.length > 0;

    let result = items;

    if (hasFilters) {
      result = items.filter((item) => {
        const matchesCatalog = checkedCatalogs.length === 0 || checkedCatalogs.includes(item.repo);
        const matchesManufacturer =
          checkedManufacturers.length === 0 ||
          checkedManufacturers.includes(item['schema:manufacturer']?.['schema:name']);
        const matchesAuthor =
          checkedAuthors.length === 0 ||
          checkedAuthors.includes(item['schema:author']?.['schema:name']);

        return matchesCatalog && matchesManufacturer && matchesAuthor;
      });
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((item) => item.tmName.toLowerCase().includes(q));
    }

    return result;
  }, [items, query, repositoriesState, manufacturersState, authorsState]);

  const handleFilterChange = (sectionId: string, optionValue: string, checked: boolean) => {
    const updateOptions = (prev: FilterData[]) =>
      prev.map((opt) => (opt.value === optionValue ? { ...opt, checked } : opt));

    if (sectionId === 'repository') {
      setRepositoriesState(updateOptions);
    } else if (sectionId === 'manufacturer') {
      setManufacturersState(updateOptions);
    } else if (sectionId === 'author') {
      setAuthorsState(updateOptions);
    }
  };
  const resetFilters = () => {
    setQuery('');
    setRepositoriesState((prev) => prev.map((opt) => ({ ...opt, checked: false })));
    setManufacturersState((prev) => prev.map((opt) => ({ ...opt, checked: false })));
    setAuthorsState((prev) => prev.map((opt) => ({ ...opt, checked: false })));
    setIsResetClicked(true);
    setTimeout(() => setIsResetClicked(false), 150);
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="py-10">
        <main>
          <div className="mb-4 flex flex-row">
            <div className="basis-64"></div>
            <div className="basis-128 grow">
              <Search
                query={query}
                onSearch={setQuery}
                filteredItems={!query ? [] : filteredItems}
              />
            </div>
            <div className="basis-64"></div>
          </div>

          <div className="max-w-screen-3xl flex flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
            {/* Sidebar */}
            <aside
              className="w-full rounded-lg bg-white p-4 shadow-sm outline outline-1 -outline-offset-1 outline-gray-200 lg:w-1/4"
              aria-label="Filters"
            >
              <SideBar
                manufacturersState={manufacturersState}
                authorsState={authorsState}
                catalogsState={repositoriesState}
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
                  className={`w-64 rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-40 ${
                    isResetClicked
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  Reset filters
                </button>
                {query && filteredItems.length === 0 && (
                  <span className="text-sm text-gray-500">(No matches for "{query}")</span>
                )}
              </div>
              <GridList items={filteredItems} loading={loading} error={error} />
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
