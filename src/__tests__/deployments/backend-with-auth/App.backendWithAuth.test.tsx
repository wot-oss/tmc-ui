// @vitest-environment jsdom
//
// Deployment mode 3: BACKEND WITH AUTH
// __DEPLOY_TYPE__ is 'SERVER_AVAILABLE' with both VITE_SERVER_URL and
// VITE_TOKEN_URL configured. App.tsx computes authConfigured = true, so it gates
// the catalog behind an OAuth2 client-credentials prompt. After valid
// credentials are submitted, it authenticates and renders the catalog.

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

const TOKEN_URL = 'http://test-api/token';

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

function submitCredentials(clientId: string, clientSecret: string): void {
  fireEvent.change(screen.getByLabelText('Client ID'), { target: { value: clientId } });
  fireEvent.change(screen.getByLabelText('Client Secret'), { target: { value: clientSecret } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

async function authenticateCatalog(): Promise<void> {
  await screen.findByText('Enter API credentials');
  submitCredentials('test-client', 'test-secret');

  await waitFor(() =>
    expect(mockRequestToken).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenUrl: TOKEN_URL,
        clientId: 'test-client',
        clientSecret: 'test-secret',
      }),
    ),
  );
}

beforeEach(() => {
  clearStoredSession();
  stubDeployGlobals({ deployType: 'SERVER_AVAILABLE', serverAvailable: true });

  // Both server URL and token URL present → backend with auth.
  vi.stubEnv('VITE_SERVER_URL', TEST_API_BASE);
  vi.stubEnv('VITE_TOKEN_URL', TOKEN_URL);
  vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');

  mockBackendFilters();
  mockRequestToken.mockResolvedValue(TOKEN_RESULT);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('Backend with auth (SERVER_AVAILABLE, server + token URL)', () => {
  test('Landing page navigation, filters, and results no items after valid credentials', async () => {
    mockFetchApiInventory.mockResolvedValue({ data: [], totalElements: 0 });

    renderApp();

    expect(await screen.findByText('Enter API credentials')).toBeTruthy();
    expect(screen.queryByText('Environment not configured')).toBeNull();

    await authenticateCatalog();

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
    expect(mockFetchApiInventory).toHaveBeenCalledWith(
      TEST_API_BASE,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test('Landing page with one item after valid credentials', async () => {
    mockFetchApiInventory.mockResolvedValue({ data: [makeItem('ThingasLamp')], totalElements: 1 });

    renderApp();
    expect(await screen.findByText('Enter API credentials')).toBeTruthy();
    await authenticateCatalog();

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

  test('Settings page from landing page with one authenticated item', async () => {
    mockFetchApiInventory.mockResolvedValue({ data: [makeItem('ThingasLamp')], totalElements: 1 });

    renderApp();
    await authenticateCatalog();

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

  test('Details page for an authenticated backend Thing Model', async () => {
    mockFetchApiInventory.mockResolvedValue({ data: [makeItem('ThingasLamp')], totalElements: 1 });
    mockFetchApiThingModel.mockResolvedValue({
      id: 'lampuser/lampcorp/thingaslamp',
      title: 'ThingasLamp',
      '@context': 'https://www.w3.org/2022/wot/td/v1.1',
      '@type': 'tm:ThingModel',
      version: {
        model: 'v1.0.0',
        instance: 'v1.0.0',
      },
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
      properties: {
        temperature: {
          description: 'temperature (degrees C)',
          type: 'number',
          readOnly: true,
          forms: [{ href: 'https://example.test/properties/temperature' }],
        },
        humidity: {
          description: 'relative humidity (%)',
          type: 'number',
          readOnly: true,
          forms: [{ href: 'https://example.test/properties/humidity' }],
        },
      },
      actions: {
        resetLamp: {
          description: 'Reset the lamp state',
          forms: [{ href: 'https://example.test/actions/resetLamp' }],
        },
      },
      events: {
        overheated: {
          description: 'Lamp temperature threshold exceeded',
          forms: [{ href: 'https://example.test/events/overheated' }],
        },
      },
    });

    renderApp();
    await authenticateCatalog();

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
    expect(await screen.findByRole('heading', { name: 'MPN' })).toBeTruthy();
    expect(await screen.findByText('LampMpn')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Current Version' })).toBeTruthy();
    expect(await screen.findAllByText('v1.0.0')).toHaveLength(2);
    expect(await screen.findByRole('heading', { name: 'Number of Versions' })).toBeTruthy();
    expect(await screen.findByText('1')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'ID' })).toBeTruthy();
    expect(await screen.findByText('lampuser/lampcorp/thingaslamp')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Product image of ThingasLamp' })).toBeTruthy();
    expect(screen.getByLabelText('version')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Additional details' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Properties' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Events' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open full details' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open with …' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Properties' }));
    expect(await screen.findByText('temperature')).toBeTruthy();
    expect(await screen.findByText('humidity')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(await screen.findByText('resetLamp')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Events' }));
    expect(await screen.findByText('overheated')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open with …' }));
    expect(await screen.findByRole('heading', { name: 'Open with …' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'EdiTDor' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'TD Playground' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    expect(mockFetchApiThingModel).toHaveBeenCalledWith(
      TEST_API_BASE,
      'ThingasLamp',
      expect.objectContaining({ authorizationHeader: 'Bearer test-access-token' }),
    );
    expect(screen.queryByText('Enter API credentials')).toBeNull();
  });

  test('prompts for API credentials when none are stored', async () => {
    renderApp();

    await screen.findByText('Enter API credentials');
    expect(screen.getByLabelText('Client ID')).toBeTruthy();
    expect(screen.getByLabelText('Client Secret')).toBeTruthy();
    expect(mockFetchApiInventory).not.toHaveBeenCalled();
  });

  test('shows the environment-not-configured error when the server URL is missing', async () => {
    vi.stubEnv('VITE_SERVER_URL', '');

    renderApp();

    await screen.findByText('Environment not configured');
    expect(screen.queryByText('Enter API credentials')).toBeNull();
  });

  test('authenticates and renders the catalog after valid credentials are submitted', async () => {
    mockFetchApiInventory.mockResolvedValue({ data: [makeItem('lightall-mk2')], totalElements: 1 });

    renderApp();

    await authenticateCatalog();

    await screen.findByRole('heading', { name: 'lightall-mk2', level: 3 });
    expect(screen.queryByText('Enter API credentials')).toBeNull();
  });

  test('keeps the prompt and shows an error when credential validation fails', async () => {
    mockRequestToken.mockRejectedValue(new Error('Invalid credentials'));

    renderApp();

    await screen.findByText('Enter API credentials');
    submitCredentials('bad-client', 'bad-secret');

    await screen.findByText('Error on credentials');
    expect(screen.getByText('Enter API credentials')).toBeTruthy();
    expect(mockFetchApiInventory).not.toHaveBeenCalled();
  });
});
