// @vitest-environment jsdom
//
// Deployment mode 2: BACKEND NO AUTH
// __DEPLOY_TYPE__ is 'SERVER_AVAILABLE' and a server URL is configured, but no
// VITE_TOKEN_URL is provided. App.tsx computes authConfigured = false, so the
// credentials prompt is never shown and the catalog is loaded straight from the
// backend inventory endpoint.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { MockedFunction } from 'vitest';

import { fetchApiDataInventory, fetchApiThingModel } from '../../../services/apiData';
import { requestClientCredentialsToken } from '../../../services/auth';
import {
  TEST_API_BASE,
  TOKEN_RESULT,
  clearStoredSession,
  makeItem,
  okJsonResponse,
  renderApp,
  stubDeployGlobals,
} from '../helpers';

vi.mock('../../../services/apiData', () => ({
  fetchApiDataInventory: vi.fn(),
  fetchApiThingModel: vi.fn(),
}));

vi.mock('../../../services/localData', () => ({
  fetchLocalDataInventory: vi.fn(),
  fetchLocalDataFilters: vi.fn(),
  fetchDataFromTxT: vi.fn(),
  fetchLocalThingModel: vi.fn(),
}));

vi.mock('../../../services/auth', () => ({
  requestClientCredentialsToken: vi.fn(),
  buildTokenRequestError: vi.fn(),
}));

const mockFetchApiInventory = fetchApiDataInventory as MockedFunction<typeof fetchApiDataInventory>;
const mockFetchApiThingModel = fetchApiThingModel as MockedFunction<typeof fetchApiThingModel>;
const mockRequestToken = requestClientCredentialsToken as MockedFunction<
  typeof requestClientCredentialsToken
>;

function mockBackendFilters(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.endsWith('/repos')) {
        return Promise.resolve(okJsonResponse({ data: [{ name: 'test-repo' }] }));
      }

      if (url.endsWith('/manufacturers')) {
        return Promise.resolve(okJsonResponse({ data: ['LampManufacturer'] }));
      }

      if (url.endsWith('/authors')) {
        return Promise.resolve(okJsonResponse({ data: ['LampAuthor'] }));
      }

      return Promise.resolve(okJsonResponse({ data: [] }));
    }),
  );
}

beforeEach(() => {
  clearStoredSession();
  stubDeployGlobals({ deployType: 'SERVER_AVAILABLE', serverAvailable: true });

  // Server URL present, token URL absent → backend no auth.
  vi.stubEnv('VITE_SERVER_URL', TEST_API_BASE);
  vi.stubEnv('VITE_TOKEN_URL', '');
  vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');

  mockBackendFilters();

  // The token effect still runs with an empty token URL; keep it resolved so it
  // does not surface a spurious error during catalog rendering.
  mockRequestToken.mockResolvedValue(TOKEN_RESULT);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('Backend No Auth (SERVER_AVAILABLE, no token URL)', () => {
  test('Landing page navigation, filters, and results no items', async () => {
    mockFetchApiInventory.mockResolvedValue([]);

    renderApp();

    expect(await screen.findByRole('heading', { name: 'Filters' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Settings' })).toBeTruthy();
    expect(await screen.findByText('Protocol')).toBeTruthy();
    expect(await screen.findByText('Manufacturer')).toBeTruthy();
    expect(await screen.findByText('Author')).toBeTruthy();
    expect(await screen.findByText('Repository')).toBeTruthy();
    expect(await screen.findByText('0 results found')).toBeTruthy();
    expect(screen.queryByText('Enter API credentials')).toBeNull();
    expect(screen.queryByText('Environment not configured')).toBeNull();
  });

  test('Landing page with one item', async () => {
    mockFetchApiInventory.mockResolvedValue([makeItem('ThingasLamp')]);

    renderApp();

    expect(await screen.findByRole('heading', { name: 'Filters' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Settings' })).toBeTruthy();
    expect(await screen.findByText('Protocol')).toBeTruthy();
    expect(await screen.findByText('Manufacturer')).toBeTruthy();
    expect(await screen.findByText('Author')).toBeTruthy();
    expect(await screen.findByText('Repository')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'ThingasLamp', level: 3 })).toBeTruthy();
    await waitFor(() => {
      expect(document.body.textContent?.replace(/\s+/g, ' ')).toContain('1 result found');
    });
    expect(mockFetchApiInventory).toHaveBeenCalledWith(
      TEST_API_BASE,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test('Settings page from landing page with one item', async () => {
    mockFetchApiInventory.mockResolvedValue([makeItem('ThingasLamp')]);

    renderApp();

    expect(await screen.findByRole('heading', { name: 'Filters' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'ThingasLamp', level: 3 })).toBeTruthy();
    await waitFor(() => {
      expect(document.body.textContent?.replace(/\s+/g, ' ')).toContain('1 result found');
    });

    fireEvent.click(screen.getByRole('link', { name: 'Settings' }));

    await waitFor(() => {
      expect(window.location.hash).toBe('#/settings');
    });
    expect(await screen.findByRole('heading', { name: 'Manage API credentials' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Update API credentials' })).toBeTruthy();
    expect(screen.getByLabelText('Client ID')).toBeTruthy();
    expect(screen.getByLabelText('Client Secret')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save credentials' })).toBeTruthy();
    expect(
      screen.getByText(
        'Changes are saved to this browser tab and applied immediately after re-authentication.',
      ),
    ).toBeTruthy();
  });

  test('Details page for a backend Thing Model without auth', async () => {
    mockFetchApiInventory.mockResolvedValue([makeItem('ThingasLamp')]);
    mockFetchApiThingModel.mockResolvedValue({
      id: 'lampuser/lampcorp/thingaslamp',
      title: 'ThingasLamp',
      '@context': 'https://www.w3.org/2022/wot/td/v1.1',
      '@type': 'tm:ThingModel',
      'schema:mpn': 'LampMpn',
      'schema:manufacturer': {
        'schema:name': 'LampManufacturer',
      },
      'schema:author': {
        'schema:name': 'LampAuthor',
      },
      securityDefinitions: {
        nosec_sc: {
          scheme: 'nosec',
        },
      },
      security: ['nosec_sc'],
      properties: {},
    });

    renderApp();

    const cardHeading = await screen.findByRole('heading', { name: 'ThingasLamp', level: 3 });
    const cardLink = cardHeading.closest('a');

    expect(cardLink).not.toBeNull();
    fireEvent.click(cardLink as HTMLAnchorElement);

    expect(await screen.findByRole('heading', { name: 'Title' })).toBeTruthy();
    expect(await screen.findByText('ThingasLamp')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Manufacturer' })).toBeTruthy();
    expect(await screen.findByText('LampManufacturer')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Author' })).toBeTruthy();
    expect(await screen.findByText('LampAuthor')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Additional details' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open full details' })).toBeTruthy();
    expect(mockFetchApiThingModel).toHaveBeenCalledWith(
      TEST_API_BASE,
      'ThingasLamp',
      expect.objectContaining({ authorizationHeader: null }),
    );
    expect(screen.queryByText('Enter API credentials')).toBeNull();
  });
});
