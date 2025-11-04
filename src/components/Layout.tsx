import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import GridList from './GridList';
import Search from './Search';

const TMC_URL = 'http://0.0.0.0:8080';

const Layout: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

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

  const filteredItems = useMemo<Item[]>(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return items.filter((item) => item.tmName.toLowerCase().includes(q));
  }, [items, query]);

  const displayItems = filteredItems.length > 0 ? filteredItems : items;

  return (
    <>
      <Navbar></Navbar>
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"></div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl bg-[#F6F6F6] px-4 py-8 sm:px-6 lg:px-8">
            <Search query={query} onSearch={setQuery} filteredItems={filteredItems} />
          </div>
          <div className="mx-auto max-w-7xl bg-[#F6F6F6] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex">
              <p className="mb-2 text-lg">
                {displayItems.length} result{displayItems.length !== 1 ? 's' : ''} found
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                disabled={!query}
                className="mb-2 ml-4 rounded text-lg text-black underline hover:bg-gray-800 hover:text-white"
              >
                Reset filters
              </button>
            </div>
            <GridList items={displayItems} loading={loading} error={error} />
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
