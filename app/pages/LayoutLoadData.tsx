import { useEffect, useState } from 'react';
import Layout from './Layout';
import { FilterProvider } from '../context/FilterContext';
import { useAuth } from '../hooks/useAuth';
import { fetchApiDataInventory } from '../../lib/services/apiData';
import { fetchLocalDataInventory } from '../../lib/services/localData';

const PAGE_ONE = 1;
const DEFAULT_PAGE_SIZE = 10;
const isDevelopment = process.env.NODE_ENV === 'development';

const LayoutLoadData = () => {
  const { authorizationHeader, enabled, error, isLoading } = useAuth();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);

  if (isDevelopment) {
    console.warn('Vite globals', {
      authorizationHeader: authorizationHeader,
      enabled: enabled,
      error: error,
      isLoading: isLoading,
    });
  }

  useEffect(() => {
    const controller = new AbortController();

    if (error) {
      setInventoryLoading(false);
      setInventoryError(error);
      return () => controller.abort();
    }

    const loadInventory = async () => {
      setInventoryLoading(true);
      setInventoryError(null);

      try {
        if (__SERVER_AVAILABLE__) {
          if (enabled && !authorizationHeader) {
            return;
          }
          const { data, meta } = await fetchApiDataInventory(
            __API_BASE__,
            {
              signal: controller.signal,
              authorizationHeader,
            },
            PAGE_ONE,
            DEFAULT_PAGE_SIZE,
          );

          setInventory(data as InventoryItem[]);
          setTotalItems(meta.page.totalElements);
          return;
        }

        const response = await fetchLocalDataInventory(import.meta.env.BASE_URL);
        const nexInventoryFiltered = response.filter((item) => item['schema:mpn'] !== '');
        setInventory(nexInventoryFiltered);
        setTotalItems(nexInventoryFiltered.length);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        if (err instanceof Response) {
          setInventoryError(err.statusText || 'Failed to find inventory');
          return;
        }

        setInventoryError(err instanceof Error ? err.message : 'Failed to find local inventory');
      } finally {
        setInventoryLoading(false);
      }
    };

    void loadInventory();

    return () => controller.abort();
  }, [authorizationHeader, enabled, error, isLoading]);

  return (
    <FilterProvider>
      <Layout
        loadedItems={inventory}
        inventoryError={inventoryError}
        inventoryLoading={inventoryLoading}
        totalItems={totalItems}
      />
    </FilterProvider>
  );
};

export default LayoutLoadData;
