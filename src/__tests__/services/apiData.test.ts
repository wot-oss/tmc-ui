// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from 'vitest';
import { fetchApiDataInventory } from '../../services/apiData';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchApiDataInventory', () => {
  test('serializes the changedSince filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          meta: { lastUpdated: '', page: { pageNumber: 1, pageSize: 10, totalElements: 0 } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchApiDataInventory('https://catalog.example', {
      filters: { changedSince: '20260908' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://catalog.example/inventory?filter.changedSince=20260908',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
