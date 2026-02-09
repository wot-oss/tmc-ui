import { type ThingDescription } from "wot-typescript-definitions";
import {
  INVENTORY_TIMEOUT_MS,
  INVENTORY_ENDPOINT,
  REPOSITORY_ENDPOINT,
  MANUFACTURER_ENDPOINT,
  AUTHOR_ENDPOINT,
  THING_MODEL_ENDPOINT,
} from "../utils/constants";

export async function fetchApiDataFilters(): Promise<{
  nextProtocols: FilterData[];
  nextManufacturers: FilterData[];
  nextAuthors: FilterData[];
  nextRepositories: FilterData[];
}> {
  let nextProtocols: FilterData[] = [];
  let nextManufacturers: FilterData[] = [];
  let nextAuthors: FilterData[] = [];
  let nextRepositories: FilterData[] = [];

  try {
    const [reposRes, manufacturersRes, authorsRes] = await Promise.all([
      fetch(`${__API_BASE__}/${REPOSITORY_ENDPOINT}`),
      fetch(`${__API_BASE__}/${MANUFACTURER_ENDPOINT}`),
      fetch(`${__API_BASE__}/${AUTHOR_ENDPOINT}`),
    ]);

    if (!reposRes.ok || !manufacturersRes.ok || !authorsRes.ok) {
      throw new Error("Failed to fetch filter data");
    }

    const [reposJson, manufacturersJson, authorsJson] = await Promise.all([
      reposRes.json(),
      manufacturersRes.json(),
      authorsRes.json(),
    ]);

    nextManufacturers = (manufacturersJson.data || []).map(
      (manufacturer: string) => ({
        value: manufacturer,
        label: manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1),
        checked: false,
      })
    );

    nextAuthors = (authorsJson.data || []).map((author: string) => ({
      value: author,
      label: author.charAt(0).toUpperCase() + author.slice(1),
      checked: false,
    }));

    nextRepositories = (reposJson.data || []).map((repo: { name: string }) => ({
      value: repo.name,
      label: repo.name.charAt(0).toUpperCase() + repo.name.slice(1),
      checked: false,
    }));

    if (
      nextAuthors.length === 0 &&
      nextManufacturers.length === 0 &&
      nextRepositories.length === 0
    ) {
      throw new Error("No filter data available");
    }
  } catch (err: unknown) {
    throw new Error(
      err instanceof Error ? err.message : "fecthApiDataFilters unknown error"
    );
  }
  return { nextProtocols, nextManufacturers, nextAuthors, nextRepositories };
}

export async function fetchApiDataInventory(
  baseUrl: string | undefined,
  request: Request
): Promise<unknown[]> {
  if (!baseUrl) {
    throw new Response("Catalog URL not configured", { status: 400 });
  }
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, INVENTORY_TIMEOUT_MS);

  const abortFromRouter = () => controller.abort();
  request.signal.addEventListener("abort", abortFromRouter);

  try {
    const res = await fetch(`${baseUrl}/${INVENTORY_ENDPOINT}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Response("Failed to fetch inventory", { status: res.status });
    }

    const json: unknown = await res.json();
    if (
      typeof json === "object" &&
      json !== null &&
      "data" in json &&
      Array.isArray((json as { data?: unknown }).data)
    ) {
      return (json as { data: unknown[] }).data;
    }

    return [];
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      if (didTimeout) {
        throw new Response("Inventory request timed out", { status: 504 });
      }
      // Aborted due to navigation; let router handle it naturally
      throw err;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    request.signal.removeEventListener("abort", abortFromRouter);
  }
}

export async function fetchApiThingModel(
  baseUrl: string | undefined,
  itemName: string
): Promise<ThingDescription> {
  if (!baseUrl) {
    throw new Error("Catalog URL not configured");
  }

  if (!itemName) {
    throw new Error("Missing item name");
  }

  try {
    const res = await fetch(
      `${baseUrl}/${THING_MODEL_ENDPOINT}/${encodeURIComponent(itemName)}`
    );

    if (!res.ok) {
      throw new Error("Item not found");
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (err: unknown) {
    throw new Error(
      err instanceof Error ? err.message : "Failed to load thing model"
    );
  }
}
