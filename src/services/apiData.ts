import { type ThingDescription } from 'wot-typescript-definitions';
import { INVENTORY_TIMEOUT_MS, INVENTORY_ENDPOINT, THING_MODEL_ENDPOINT } from '../utils/constants';

interface FetchInventoryOptions {
  readonly signal?: AbortSignal;
  readonly authorizationHeader?: string | null;
  readonly filters?: {
    readonly author?: readonly string[];
    readonly protocol?: readonly string[];
    readonly manufacturer?: readonly string[];
    readonly repository?: readonly string[];
  };
}

interface FetchThingModelOptions {
  readonly signal?: AbortSignal;
  readonly authorizationHeader?: string | null;
}

function buildRequestHeaders(authorizationHeader?: string | null): HeadersInit {
  return {
    ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
    'Content-Type': 'application/json',
  };
}

function buildInventoryUrl(baseUrl: string, filters?: FetchInventoryOptions['filters']): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const searchParams = new URLSearchParams();

  if (filters?.author?.length) {
    searchParams.set('filter.author', filters.author.join(','));
  }

  if (filters?.protocol?.length) {
    searchParams.set('filter.protocol', filters.protocol.join(','));
  }

  if (filters?.manufacturer?.length) {
    searchParams.set('filter.manufacturer', filters.manufacturer.join(','));
  }

  if (filters?.repository?.length) {
    searchParams.set('filter.repository', filters.repository.join(','));
  }

  const query = searchParams.toString();
  return query
    ? `${normalizedBaseUrl}/${INVENTORY_ENDPOINT}?${query}`
    : `${normalizedBaseUrl}/${INVENTORY_ENDPOINT}`;
}

export async function fetchApiDataInventory(
  baseUrl: string | undefined,
  options: FetchInventoryOptions = {},
): Promise<unknown[]> {
  if (!baseUrl) {
    throw new Response('Catalog URL not configured', { status: 400 });
  }

  const { signal, authorizationHeader, filters } = options;
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, INVENTORY_TIMEOUT_MS);

  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  try {
    const res = await fetch(buildInventoryUrl(baseUrl, filters), {
      signal: controller.signal,
      headers: buildRequestHeaders(authorizationHeader),
    });

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
  options: FetchThingModelOptions = {},
): Promise<ThingDescription> {
  if (!baseUrl) {
    throw new Error('Catalog URL not configured');
  }

  if (!itemName) {
    throw new Error('Missing item name');
  }

  try {
    const res = await fetch(`${baseUrl}/${THING_MODEL_ENDPOINT}/${encodeURIComponent(itemName)}`, {
      signal: options.signal,
      headers: buildRequestHeaders(options.authorizationHeader),
    });

    if (!res.ok) {
      throw new Error('Item not found');
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Failed to load thing model');
  }
}
