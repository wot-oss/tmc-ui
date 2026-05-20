import { useEffect, useState } from 'react';
import Layout from './Layout';
import { FilterProvider } from '../context/FilterContext';
import { useAuth } from '../hooks/useAuth';
import { fetchApiDataInventory } from '../services/apiData';
import { fetchLocalDataInventory } from '../services/localData';

export default function LayoutLoadData() {
  const { authorizationHeader, enabled, error, isLoading } = useAuth();

  const [inventory, setInventory] = useState<Item[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    if (__DEPLOY_TYPE__ === 'SERVER_AVAILABLE' && enabled && isLoading && !authorizationHeader) {
      return () => controller.abort();
    }

    const loadInventory = async () => {
      setInventoryLoading(true);
      setInventoryError(null);

      try {
        switch (__DEPLOY_TYPE__) {
          case 'SERVER_AVAILABLE': {
            if (enabled && !authorizationHeader) {
              return;
            }

            const nextInventory = await fetchApiDataInventory(__API_BASE__, {
              signal: controller.signal,
              authorizationHeader,
            });

            setInventory(nextInventory as Item[]);
            return;
          }
          case 'TYPE_TMC-UI-CATALOG': {
            const nextInventory = await fetchLocalDataInventory(import.meta.env.BASE_URL);
            setInventory(nextInventory as Item[]);
            return;
          }
          case 'TYPE_CATALOG-TMC-UI': {
            setInventory([]);
            return;
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        if (err instanceof Response) {
          setInventoryError(err.statusText || 'Failed to find local inventory');
          return;
        }

        setInventoryError(err instanceof Error ? err.message : 'Failed to find local inventory');
      } finally {
        setInventoryLoading(false);
      }
    };

    if (error) {
      setInventoryLoading(false);
      setInventoryError(error);
      return () => controller.abort();
    }

    if (__DEPLOY_TYPE__ === 'SERVER_AVAILABLE' && enabled && !authorizationHeader) {
      setInventoryLoading(true);
      return () => controller.abort();
    }

    void loadInventory();

    return () => controller.abort();
  }, [authorizationHeader, enabled, error, isLoading]);

  return (
    <FilterProvider>
      <Layout
        loadedItems={inventory}
        inventoryError={inventoryError}
        inventoryLoading={inventoryLoading}
      />
    </FilterProvider>
  );
}
