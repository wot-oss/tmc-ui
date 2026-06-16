// @vitest-environment jsdom
//
// Env/global integration coverage for Vite deployment configuration.
// vite.config.mjs converts .env values into build-time globals such as
// __API_BASE__ and __DEPLOY_TYPE__. These tests render the real App tree and
// verify those values reach the visible app flow and service boundaries.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { MockedFunction } from 'vitest';
import { fetchApiDataInventory } from '../../../services/apiData';
import { fetchLocalDataFilters, fetchLocalDataInventory } from '../../../services/localData';
import { requestClientCredentialsToken } from '../../../services/auth';
import {
  TOKEN_RESULT,
  clearStoredSession,
  makeItem,
  okJsonResponse,
  renderApp,
  stubDeployGlobals,
} from '../helpers';

vi.mock('../../../services/localData', () => ({
  fetchLocalDataInventory: vi.fn(),
  fetchLocalDataFilters: vi.fn(),
  fetchDataFromTxT: vi.fn(),
  fetchLocalThingModel: vi.fn(),
}));

vi.mock('../../../services/apiData', () => ({
  fetchApiDataInventory: vi.fn(),
  fetchApiThingModel: vi.fn(),
}));

vi.mock('../../../services/auth', () => ({
  requestClientCredentialsToken: vi.fn(),
  buildTokenRequestError: vi.fn(),
}));

const mockFetchApiInventory = fetchApiDataInventory as MockedFunction<typeof fetchApiDataInventory>;
const mockFetchLocalInventory = fetchLocalDataInventory as MockedFunction<
  typeof fetchLocalDataInventory
>;
const mockFetchLocalFilters = fetchLocalDataFilters as MockedFunction<typeof fetchLocalDataFilters>;
const mockRequestToken = requestClientCredentialsToken as MockedFunction<
  typeof requestClientCredentialsToken
>;

function mockEmptyLocalFilters(): void {
  mockFetchLocalFilters.mockResolvedValue({
    nextProtocols: [],
    nextManufacturers: [],
    nextAuthors: [],
    nextRepositories: [],
  });
}

function mockBackendFilterRequests(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(okJsonResponse({ data: [] }))),
  );
}

function submitCredentials(clientId: string, clientSecret: string): void {
  fireEvent.change(screen.getByLabelText('Client ID'), { target: { value: clientId } });
  fireEvent.change(screen.getByLabelText('Client Secret'), { target: { value: clientSecret } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

beforeEach(() => {
  clearStoredSession();
  vi.stubEnv('APP_REPO_URL', '');
  vi.stubEnv('CATALOG_REPO_URL', '');
  vi.stubEnv('VITE_TOKEN_URL', '');
  vi.stubEnv('SERVER_AVAILABLE', '');
  vi.stubEnv('VITE_EDITOR_URL', '');
  vi.stubEnv('VITE_PLAYGROUND_URL', '');
  vi.stubEnv('VITE_SERVER_URL', '');
  vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');
  vi.stubEnv('BASE_URL', '/');
  mockRequestToken.mockResolvedValue(TOKEN_RESULT);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

interface TestGlobals {
  readonly __APP_REPO_URL__: string;
  readonly __CATALOG_REPO_URL__: string;
  readonly __DEPLOY_SERVER_AVAILABLE__: boolean;
  readonly __SERVER_AVAILABLE__: boolean;
  readonly __VITE_EDITOR_URL__: string;
  readonly __VITE_PLAYGROUND_URL__: string;
  readonly __VITE_TOKEN_URL__: string;
  readonly __VITE_SERVER_URL__: string;
  readonly __VITE_SETUP_CREDENTIALS_MESSAGE__: string;
  readonly __API_BASE__: string;
  readonly __PIPELINE_CATALOG_URL__: string;
  readonly __DEBUG__: boolean;
  readonly __DEPLOY_TYPE__: string;
}

interface TestEnv {
  readonly APP_REPO_URL: string;
  readonly CATALOG_REPO_URL: string;
  readonly SERVER_AVAILABLE: string;
  readonly VITE_API_HOST: string;
  readonly VITE_API_PORT: string;
  readonly VITE_API_PROTOCOL: string;
  readonly VITE_EDITOR_URL: string;
  readonly VITE_PLAYGROUND_URL: string;
  readonly VITE_TOKEN_URL: string;
  readonly VITE_SERVER_URL: string;
  readonly VITE_SETUP_CREDENTIALS_MESSAGE: string;
}

describe('Vite env values exposed to App as deployment globals', () => {
  test('default test - To DELETE', () => {
    expect(true).toBe(true);
  });
  test('uses env values and deployment globals to render the credentials prompt', async () => {
    vi.stubEnv('APP_REPO_URL', '');
    vi.stubEnv('CATALOG_REPO_URL', 'https://github.com/wot-oss/example-catalog.git');
    vi.stubEnv('SERVER_AVAILABLE', 'true');
    vi.stubEnv('VITE_API_HOST', 'localhost');
    vi.stubEnv('VITE_API_PORT', '8080');
    vi.stubEnv('VITE_API_PROTOCOL', 'http');
    vi.stubEnv('VITE_EDITOR_URL', 'https://eclipse-editor.github.io/editor/');
    vi.stubEnv('VITE_PLAYGROUND_URL', 'https://playground.thingweb.io/');
    vi.stubEnv('VITE_TOKEN_URL', 'https://tmcprod.eu1.sws.siemens.com/oauth/token');
    vi.stubEnv('VITE_SERVER_URL', 'https://eu1.thingmodels.siemens.cloud');
    vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');

    stubDeployGlobals({
      appRepoUrl: '',
      catalogRepoUrl: 'https://github.com/wot-oss/example-catalog.git',
      deployServerAvailable: true,
      serverAvailable: true,
      viteEditorUrl: 'https://eclipse-editor.github.io/editor/',
      vitePlaygroundUrl: 'https://playground.thingweb.io/',
      viteTokenUrl: 'https://tmcprod.eu1.sws.siemens.com/oauth/token',
      viteServerUrl: 'https://eu1.thingmodels.siemens.cloud',
      viteSetupCredentialsMessage: '',
      apiBase: 'https://eu1.thingmodels.siemens.cloud',
      pipelineCatalogUrl: 'test-tm-ui',
      debug: true,
      deployType: 'SERVER_AVAILABLE',
    });

    renderApp();
    const globals = globalThis as typeof globalThis & TestGlobals;
    const env = import.meta.env as ImportMetaEnv & TestEnv;

    expect(env.APP_REPO_URL).toBe('');
    expect(env.CATALOG_REPO_URL).toBe('https://github.com/wot-oss/example-catalog.git');
    expect(env.SERVER_AVAILABLE).toBe('true');
    expect(env.VITE_API_HOST).toBe('localhost');
    expect(env.VITE_API_PORT).toBe('8080');
    expect(env.VITE_API_PROTOCOL).toBe('http');
    expect(env.VITE_EDITOR_URL).toBe('https://eclipse-editor.github.io/editor/');
    expect(env.VITE_PLAYGROUND_URL).toBe('https://playground.thingweb.io/');
    expect(env.VITE_TOKEN_URL).toBe('https://tmcprod.eu1.sws.siemens.com/oauth/token');
    expect(env.VITE_SERVER_URL).toBe('https://eu1.thingmodels.siemens.cloud');
    expect(env.VITE_SETUP_CREDENTIALS_MESSAGE).toBe('');

    expect(globals.__APP_REPO_URL__).toBe('');
    expect(globals.__CATALOG_REPO_URL__).toBe('https://github.com/wot-oss/example-catalog.git');
    expect(globals.__DEPLOY_SERVER_AVAILABLE__).toBe(true);
    expect(globals.__SERVER_AVAILABLE__).toBe(true);
    expect(globals.__VITE_EDITOR_URL__).toBe('https://eclipse-editor.github.io/editor/');
    expect(globals.__VITE_PLAYGROUND_URL__).toBe('https://playground.thingweb.io/');
    expect(globals.__VITE_TOKEN_URL__).toBe('https://tmcprod.eu1.sws.siemens.com/oauth/token');
    expect(globals.__VITE_SERVER_URL__).toBe('https://eu1.thingmodels.siemens.cloud');
    expect(globals.__VITE_SETUP_CREDENTIALS_MESSAGE__).toBe('');
    expect(globals.__API_BASE__).toBe('https://eu1.thingmodels.siemens.cloud');
    expect(globals.__PIPELINE_CATALOG_URL__).toBe('test-tm-ui');
    expect(globals.__DEBUG__).toBe(true);
    expect(globals.__DEPLOY_TYPE__).toBe('SERVER_AVAILABLE');

    await screen.findByRole('heading', { name: 'Enter API credentials' });
    expect(screen.getByLabelText('Client ID')).toBeTruthy();
    expect(screen.getByLabelText('Client Secret')).toBeTruthy();
    expect(screen.queryByText('Environment not configured')).toBeNull();
  });
});
/*
describe.skip('static deployments', () => {
  test('passes BASE_URL from the env to local catalog services in static deployments', async () => {
    vi.stubEnv('BASE_URL', '/tmc-ui/');
    stubDeployGlobals({ deployType: 'TYPE_TMC-UI-CATALOG', serverAvailable: false });
    mockEmptyLocalFilters();
    mockFetchLocalInventory.mockResolvedValue([makeItem('lightall'), makeItem('senseall')]);

    renderApp();

    await screen.findByRole('heading', { name: 'lightall', level: 3 });
    expect(screen.getByRole('heading', { name: 'senseall', level: 3 })).toBeTruthy();
    expect(mockFetchLocalInventory).toHaveBeenCalledWith('/tmc-ui/');
    expect(mockFetchLocalFilters).toHaveBeenCalledWith('/tmc-ui/');
    expect(mockFetchApiInventory).not.toHaveBeenCalled();
  });

  test('shows a loading state while the env-driven local catalog request is pending', async () => {
    let resolveInventory!: (items: unknown[]) => void;
    vi.stubEnv('BASE_URL', '/tmc-ui/');
    stubDeployGlobals({ deployType: 'TYPE_TMC-UI-CATALOG', serverAvailable: false });
    mockEmptyLocalFilters();
    mockFetchLocalInventory.mockReturnValue(
      new Promise<unknown[]>((resolve) => {
        resolveInventory = resolve;
      }),
    );

    renderApp();

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);

    resolveInventory([makeItem('lightall')]);
    await screen.findByRole('heading', { name: 'lightall', level: 3 });
  });

  test('passes __API_BASE__ from the configured server URL to backend inventory services', async () => {
    vi.stubEnv('VITE_SERVER_URL', 'https://catalog-api.example.test');
    vi.stubEnv('VITE_TOKEN_URL', '');
    stubDeployGlobals({
      deployType: 'SERVER_AVAILABLE',
      apiBase: 'https://catalog-api.example.test',
      serverAvailable: true,
    });
    mockBackendFilterRequests();
    mockFetchApiInventory.mockResolvedValue([makeItem('lightall-mk2')]);

    renderApp();

    await screen.findByRole('heading', { name: 'lightall-mk2', level: 3 });
    await waitFor(() =>
      expect(mockFetchApiInventory).toHaveBeenCalledWith(
        'https://catalog-api.example.test',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );
    expect(screen.queryByText('Enter API credentials')).toBeNull();
  });

  test('surfaces an environment error when SERVER_AVAILABLE is true but VITE_SERVER_URL is missing', async () => {
    vi.stubEnv('VITE_SERVER_URL', '');
    stubDeployGlobals({
      deployType: 'SERVER_AVAILABLE',
      apiBase: '',
      serverAvailable: true,
    });

    renderApp();

    await screen.findByRole('heading', { name: 'Environment not configured' });
    expect(screen.queryByText('Enter API credentials')).toBeNull();
    expect(mockFetchApiInventory).not.toHaveBeenCalled();
    expect(mockFetchLocalInventory).not.toHaveBeenCalled();
  });

  test('uses VITE_TOKEN_URL and the setup message during the credential submission flow', async () => {
    vi.stubEnv('VITE_SERVER_URL', 'https://catalog-api.example.test');
    vi.stubEnv('VITE_TOKEN_URL', 'https://catalog-api.example.test/oauth/token');
    vi.stubEnv(
      'VITE_SETUP_CREDENTIALS_MESSAGE',
      ' Use the credentials from the catalog administrator.',
    );
    stubDeployGlobals({
      deployType: 'SERVER_AVAILABLE',
      apiBase: 'https://catalog-api.example.test',
      serverAvailable: true,
    });
    mockBackendFilterRequests();
    mockRequestToken.mockResolvedValue(TOKEN_RESULT);
    mockFetchApiInventory.mockResolvedValue([makeItem('senseall')]);

    renderApp();

    await screen.findByRole('heading', { name: 'Enter API credentials' });
    expect(screen.getByText(/credentials from the catalog administrator/i)).toBeTruthy();
    expect(screen.getByLabelText('Client ID')).toBeTruthy();
    expect(screen.getByLabelText('Client Secret')).toBeTruthy();

    submitCredentials('test-client', 'test-secret');

    await waitFor(() =>
      expect(mockRequestToken).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenUrl: 'https://catalog-api.example.test/oauth/token',
          clientId: 'test-client',
          clientSecret: 'test-secret',
        }),
      ),
    );
    await screen.findByRole('heading', { name: 'senseall', level: 3 });
  });
});
*/
