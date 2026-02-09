import {
  ensureTrailingSlash,
  normalizeRelativePathSegment,
} from "../utils/strings";
import {
  REPOSITORY_CATALOG_DEFAULT_FOLDER,
  INVENTORY_FILENAME,
  AUTHORS_FILENAME,
  MANUFACTURERS_FILENAME,
  PROTOCOLS_FILENAME,
} from "../utils/constants";
import { type ThingDescription } from "wot-typescript-definitions";

export async function fetchLocalDataFilters(baseUrl: string): Promise<{
  nextProtocols: FilterData[];
  nextManufacturers: FilterData[];
  nextAuthors: FilterData[];
  nextRepositories: FilterData[];
}> {
  const nextProtocols: FilterData[] = await fetchDataFromTxT(
    baseUrl,
    PROTOCOLS_FILENAME
  );
  const nextManufacturers: FilterData[] = await fetchDataFromTxT(
    baseUrl,
    MANUFACTURERS_FILENAME
  );

  const nextAuthors: FilterData[] = await fetchDataFromTxT(
    baseUrl,
    AUTHORS_FILENAME
  );
  const nextRepositories: FilterData[] = [];

  return { nextProtocols, nextManufacturers, nextAuthors, nextRepositories };
}

export async function fetchLocalDataInventory(
  baseUrl: string
): Promise<unknown[]> {
  const folder = ensureTrailingSlash(
    normalizeRelativePathSegment(REPOSITORY_CATALOG_DEFAULT_FOLDER)
  );
  const filename = normalizeRelativePathSegment(INVENTORY_FILENAME);

  const relativePath = `${normalizeRelativePathSegment(baseUrl)}${folder}${filename}`;
  const url = new URL(
    `/${normalizeRelativePathSegment(relativePath)}`,
    window.location.origin
  );

  console.log("Fetching local inventory from URL:", url.toString());
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Response("Failed to fetch local inventory", {
      status: res.status,
    });
  }

  const json: unknown = await res.json();
  console.log("Fetched local inventory JSON:", json);

  if (
    typeof json === "object" &&
    json !== null &&
    "data" in json &&
    Array.isArray((json as { data?: Item[] }).data)
  ) {
    console.log("Local inventory loaded:", json);
    return (json as { data: Item[] }).data;
  }

  return [];
}

export async function fetchDataFromTxT(
  baseUrl: string,
  textFilename: string
): Promise<FilterData[]> {
  const folder = ensureTrailingSlash(
    normalizeRelativePathSegment(REPOSITORY_CATALOG_DEFAULT_FOLDER)
  );
  const filename = normalizeRelativePathSegment(textFilename);

  const relativePath = `${normalizeRelativePathSegment(baseUrl)}${folder}${filename}`;
  const url = new URL(
    `/${normalizeRelativePathSegment(relativePath)}`,
    window.location.origin
  );

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(
      `Failed to fetch data from ${textFilename} (${res.status})`
    );
  }

  const text = await res.text();

  const data = Array.from(
    new Set(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    )
  );

  return data.map((valueLine) => ({
    value: valueLine,
    label: valueLine.charAt(0).toUpperCase() + valueLine.slice(1),
    checked: false,
  }));
}

export async function fetchLocalThingModel(
  fullpath: string
): Promise<ThingDescription> {
  console.log("Fetching local Thing Model from path:", fullpath);

  const basePath = import.meta.env.BASE_URL || "/";
  const urlBase = `${basePath}${fullpath.startsWith("/") ? fullpath.slice(1) : fullpath}`;
  console.log("Computed URL base for Thing Model:", urlBase);
  const url = new URL(`${urlBase}`, window.location.origin);

  console.log("Fetching local Thing Model from URL:", url.toString());
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Response("Failed to fetch local Thing Model", {
      status: res.status,
    });
  }

  const json: unknown = await res.json();
  console.log("Fetched local Thing Model JSON:", json);

  return json as ThingDescription;
}
