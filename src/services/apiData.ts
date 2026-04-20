import { type ThingDescription } from 'wot-typescript-definitions';
import { INVENTORY_TIMEOUT_MS, INVENTORY_ENDPOINT, THING_MODEL_ENDPOINT } from '../utils/constants';

interface FetchInventoryOptions {
  readonly signal?: AbortSignal;
  readonly authorizationHeader?: string | null;
}

export async function fetchApiDataInventory(
  baseUrl: string | undefined,
  options: FetchInventoryOptions = {},
): Promise<unknown[]> {
  if (!baseUrl) {
    throw new Response('Catalog URL not configured', { status: 400 });
  }

  const { signal, authorizationHeader } = options;
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, INVENTORY_TIMEOUT_MS);

  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  try {
    console.log('Fetching inventory from API with authorization header:', authorizationHeader);
    const res = await fetch(`${baseUrl}/${INVENTORY_ENDPOINT}`, {
      signal: controller.signal,
      headers: {
        Authorization: authorizationHeader ?? '',
        'Content-Type': 'application/json',
      },
    });
    console.log(res);
    if (!res.ok) {
      throw new Response('Failed to fetch inventory', { status: res.status });
    }

    const json: unknown = await res.json();
    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      Array.isArray((json as { data?: unknown }).data)
    ) {
      return (json as { data: unknown[] }).data;
    }

    return [];
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (didTimeout) {
        throw new Response('Inventory request timed out', { status: 504 });
      }
      // Aborted due to navigation; let router handle it naturally
      throw err;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export async function fetchApiThingModel(
  baseUrl: string | undefined,
  itemName: string,
): Promise<ThingDescription> {
  if (!baseUrl) {
    throw new Error('Catalog URL not configured');
  }

  if (!itemName) {
    throw new Error('Missing item name');
  }

  try {
    const res = await fetch(`${baseUrl}/${THING_MODEL_ENDPOINT}/${encodeURIComponent(itemName)}`);

    if (!res.ok) {
      throw new Error('Item not found');
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Failed to load thing model');
  }
}
