import { ensureTrailingSlash, normalizeRelativePathSegment } from '../utils/strings';
import { REPOSITORY_CATALOG_DEFAULT_FOLDER, INVENTORY_FILENAME } from '../utils/constants';
import { type ThingDescription } from 'wot-typescript-definitions';

const isDevelopment = process.env.NODE_ENV === 'development';

export async function fetchLocalDataInventory(): Promise<InventoryItem[]> {
  const baseUrl = process.env.API_BASE;
  if (!baseUrl) {
    throw new Error('Base url not set');
  }
  const folder = ensureTrailingSlash(
    normalizeRelativePathSegment(REPOSITORY_CATALOG_DEFAULT_FOLDER),
  );
  const filename = normalizeRelativePathSegment(INVENTORY_FILENAME);

  const relativePath = `${normalizeRelativePathSegment(baseUrl)}${folder}${filename}`;
  const url = new URL(`/${normalizeRelativePathSegment(relativePath)}`, window.location.origin);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Response('Failed to fetch local inventory', {
      status: res.status,
    });
  }

  const json: unknown = await res.json();

  isDevelopment && console.warn('Fetched local inventory JSON:', json);

  if (
    typeof json === 'object' &&
    json !== null &&
    'data' in json &&
    Array.isArray((json as { data?: InventoryItem[] }).data)
  ) {
    return (json as { data: InventoryItem[] }).data;
  }

  return [];
}

export async function fetchDataFromTxT(baseUrl: string, textFilename: string): Promise<string[]> {
  const folder = ensureTrailingSlash(
    normalizeRelativePathSegment(REPOSITORY_CATALOG_DEFAULT_FOLDER),
  );
  const filename = normalizeRelativePathSegment(textFilename);

  const relativePath = `${normalizeRelativePathSegment(baseUrl)}${folder}${filename}`;
  const url = new URL(`/${normalizeRelativePathSegment(relativePath)}`, window.location.origin);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch data from ${textFilename} (${res.status})`);
  }

  const text = await res.text();

  const data = Array.from(
    new Set(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  );

  return data;
}

export async function fetchLocalThingModel(fullpath: string): Promise<ThingDescription> {
  isDevelopment && console.warn('Fetching local Thing Model from path:', fullpath);

  const basePath = import.meta.env.BASE_URL || '/';
  const urlBase = `${basePath}${fullpath.startsWith('/') ? fullpath.slice(1) : fullpath}`;
  isDevelopment && console.warn('Computed URL base for Thing Model:', urlBase);
  const url = new URL(`${urlBase}`, window.location.origin);

  isDevelopment && console.warn('Fetching local Thing Model from URL:', url.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Response('Failed to fetch local Thing Model', {
      status: res.status,
    });
  }

  const json: unknown = await res.json();
  isDevelopment && console.warn('Fetched local Thing Model JSON:', json);

  return json as ThingDescription;
}
