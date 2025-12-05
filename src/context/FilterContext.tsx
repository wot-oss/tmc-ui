import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLocalStorage } from '../utils/utils';
import { AUTHOR_ENDPOINT, MANUFACTURER_ENDPOINT, REPOSITORY_ENDPOINT } from '../utils/constants';

interface FilterContextType {
  repositories: FilterData[];
  manufacturers: FilterData[];
  authors: FilterData[];
  loading: boolean;
  error: string | null;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [repositories, setRepositories] = useState<FilterData[]>([]);
  const [manufacturers, setManufacturers] = useState<FilterData[]>([]);
  const [authors, setAuthors] = useState<FilterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFilters = async () => {
      try {
        if (!__API_BASE__) throw new Error('Catalog URL not configured');

        // Parallel fetch all filter options
        const [reposRes, manufacturersRes, authorsRes] = await Promise.all([
          fetch(`${__API_BASE__}/${REPOSITORY_ENDPOINT}`, { signal: controller.signal }),
          fetch(`${__API_BASE__}/${MANUFACTURER_ENDPOINT}`, { signal: controller.signal }),
          fetch(`${__API_BASE__}/${AUTHOR_ENDPOINT}`, { signal: controller.signal }),
        ]);

        if (!reposRes.ok || !manufacturersRes.ok || !authorsRes.ok) {
          throw new Error('Failed to fetch filter data');
        }

        const [reposJson, manufacturersJson, authorsJson] = await Promise.all([
          reposRes.json(),
          manufacturersRes.json(),
          authorsRes.json(),
        ]);

        setRepositories(
          (reposJson.data || []).map((repo: { name: string }) => ({
            value: repo.name,
            label: repo.name.charAt(0).toUpperCase() + repo.name.slice(1),
            checked: false,
          })),
        );

        setManufacturers(
          (manufacturersJson.data || []).map((manufacturer: string) => ({
            value: manufacturer,
            label: manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1),
            checked: false,
          })),
        );

        setAuthors(
          (authorsJson.data || []).map((author: string) => ({
            value: author,
            label: author.charAt(0).toUpperCase() + author.slice(1),
            checked: false,
          })),
        );
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          console.error('Error fetching filters:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
    return () => controller.abort();
  }, []);

  return (
    <FilterContext.Provider value={{ repositories, manufacturers, authors, loading, error }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider');
  return ctx;
};
