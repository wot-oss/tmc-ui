import { type DetailedInventoryItem } from '@/app/_components/inventory/types';
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

export interface InventoryResponse {
  data: unknown[];
  meta: MetaResponse;
}
export interface MetaResponse {
  lastUpdated: string;
  page: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
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

function buildInventoryUrl(
  baseUrl: string,
  filters?: FetchInventoryOptions['filters'],
  page?: number,
  pageSize?: number,
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const searchParams = new URLSearchParams();

  if (page !== undefined) {
    searchParams.set('page', String(page));
  }

  if (pageSize !== undefined) {
    searchParams.set('pageSize', String(pageSize));
  }

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
    searchParams.set('repo', filters.repository.join(','));
  }

  const query = searchParams.toString();
  return `${normalizedBaseUrl}/${INVENTORY_ENDPOINT}?${query}`;
}

export async function fetchApiDataInventory(
  baseUrl: string | undefined,
  options: FetchInventoryOptions = {},
  page?: number,
  pageSize?: number,
): Promise<InventoryResponse> {
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
    const res = await fetch(buildInventoryUrl(baseUrl, filters, page, pageSize), {
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
      const data = (json as { data: unknown[] }).data;
      const meta = (json as { meta?: MetaResponse }).meta;

      return {
        data,
        meta: meta ?? { lastUpdated: '', page: { pageNumber: 0, pageSize: 0, totalElements: 0 } },
      };
    }

    return {
      data: [],
      meta: { lastUpdated: '', page: { pageNumber: 0, pageSize: 0, totalElements: 0 } },
    };
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

// TODO: use a separate type for the response
export async function fetchTmContentFromServer(
  id: string,
  options: FetchThingModelOptions = {},
): Promise<DetailedInventoryItem> {
  try {
    const tmName = id.split('/').slice(0, 3).join('/');

    const getTmNameNAttachments = async () => {
      return await fetch(`${process.env.API_BASE}/${INVENTORY_ENDPOINT}/.tmName/${tmName}`, {
        signal: options.signal,
        headers: buildRequestHeaders(options.authorizationHeader),
      });
    };

    const getTmContent = async () => {
      return await fetch(`${process.env.API_BASE}/${THING_MODEL_ENDPOINT}/${id}`, {
        signal: options.signal,
        headers: buildRequestHeaders(options.authorizationHeader),
      });
    };

    const [tmNameNAttachmentsRes, tmContentRes] = await Promise.all([
      getTmNameNAttachments(),
      getTmContent(),
    ]);

    if (!tmNameNAttachmentsRes.ok || !tmContentRes.ok) {
      throw new Error("Coudn't fetch TM");
    }
    const { data: tmNameNAttachmentsArray } = await tmNameNAttachmentsRes.json();
    console.log(tmNameNAttachmentsArray);
    const tmContent = await tmContentRes.json();
    console.log(tmContent);

    if (!tmNameNAttachmentsArray || tmNameNAttachmentsArray.length === 0) return tmContent;

    const tmNameNAttachments = tmNameNAttachmentsArray[0];
    tmContent.tmName = tmNameNAttachments.tmName;
    tmContent.attachments = tmNameNAttachments.attachments;
    tmContent.versions = tmNameNAttachments.versions;

    return tmContent;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Failed to load thing model');
  }
}
