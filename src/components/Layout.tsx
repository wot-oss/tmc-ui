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
  const [query, setQuery] = useState('');
  const [catalogsState, setCatalogsState] = useState<
    Array<{ value: string; label: string; checked: boolean }>
  >([]);
  const [manufacturersState, setManufacturersState] = useState<
    Array<{ value: string; label: string; checked: boolean }>
  >([]);
  const [authorsState, setAuthorsState] = useState<
    Array<{ value: string; label: string; checked: boolean }>
  >([]);

  useEffect(() => {
    fetch(`${TMC_URL}/inventory`)
      .then((res) => res.json())
      .then((json) => {
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
    setCatalogsState(
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
    if (!query) return [];
    const q = query.toLowerCase();
    return items.filter((item) => item.tmName.toLowerCase().includes(q));
  }, [items, query]);

  const displayItems = filteredItems.length > 0 ? filteredItems : items;

  const filters: Filters = [
    {
      id: 'protocol',
      name: 'Protocol',
      options: [],
    },
    {
      id: 'manufacturer',
      name: 'Manufacturer',
      options: manufacturersState,
    },
    {
      id: 'author',
      name: 'Author',
      options: authorsState,
    },
    {
      id: 'catalog',
      name: 'Catalog',
      options: catalogsState,
    },
  ];

  const handleFilterChange = (sectionId: string, optionValue: string, checked: boolean) => {
    console.log('filter change detected', checked);
    console.log(sectionId);
    console.log(optionValue);

    const updateOptions = (prev: Array<{ value: string; label: string; checked: boolean }>) =>
      prev.map((opt) => (opt.value === optionValue ? { ...opt, checked } : opt));

    if (sectionId === 'catalog') {
      setCatalogsState(updateOptions);
    } else if (sectionId === 'manufacturer') {
      setManufacturersState(updateOptions);
    } else if (sectionId === 'author') {
      setAuthorsState(updateOptions);
    }
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="py-10">
        <main>
          <div className="mb-4 flex flex-row">
            <div className="basis-64"></div>
            <div className="basis-128 grow">
              <Search query={query} onSearch={setQuery} filteredItems={filteredItems} />
            </div>
            <div className="basis-64"></div>
          </div>

          <div className="max-w-screen-3xl flex flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
            {/* Sidebar */}
            <aside
              className="w-1/4 rounded-lg bg-white p-4 shadow-sm outline outline-1 -outline-offset-1 outline-gray-200"
              aria-label="Filters"
            >
              <SideBar filters={filters} onFilterChange={handleFilterChange} />
            </aside>

            {/* Results */}
            <section className="w-3/4 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <p className="text-lg">
                  {displayItems.length} result{displayItems.length !== 1 ? 's' : ''} found
                </p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  disabled={!query}
                  className="mt-4 w-64 rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  Reset filters
                </button>
                {query && filteredItems.length === 0 && (
                  <span className="text-sm text-gray-500">(No matches for "{query}")</span>
                )}
              </div>
              <GridList items={displayItems} loading={loading} error={error} />
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
