// @vitest-environment jsdom
//
// Env/global integration coverage for Vite deployment configuration.
// vite.config.mjs converts .env values into build-time globals such as
// __API_BASE__ and __DEPLOY_TYPE__. These tests render the real App tree and
// verify those values reach the visible app flow and service boundaries.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { MockedFunction } from 'vitest';
import {
  fetchLocalDataFilters,
  fetchLocalDataInventory,
  fetchLocalThingModel,
} from '../../../services/localData';
import { requestClientCredentialsToken } from '../../../services/auth';
import {
  TOKEN_RESULT,
  clearStoredSession,
  renderApp,
  stubDeployGlobals,
  makeItem,
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

const mockRequestToken = requestClientCredentialsToken as MockedFunction<
  typeof requestClientCredentialsToken
>;
const mockFetchLocalInventory = fetchLocalDataInventory as MockedFunction<
  typeof fetchLocalDataInventory
>;
const mockFetchLocalFilters = fetchLocalDataFilters as MockedFunction<typeof fetchLocalDataFilters>;
const mockFetchLocalThingModel = fetchLocalThingModel as MockedFunction<
  typeof fetchLocalThingModel
>;

beforeEach(() => {
  clearStoredSession();
  vi.stubEnv('APP_REPO_URL', '');
  vi.stubEnv('CATALOG_REPO_URL', '');
  vi.stubEnv('VITE_TOKEN_URL', '');
  vi.stubEnv('SERVER_AVAILABLE', '');
  vi.stubEnv('VITE_EDITDOR_URL', '');
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

describe('Static deployment integration tests', () => {
  test('Landing page navigation, filters, and results no items', async () => {
    vi.stubEnv('APP_REPO_URL', '');
    vi.stubEnv('CATALOG_REPO_URL', 'https://github.com/wot-oss/example-catalog.git');
    vi.stubEnv('SERVER_AVAILABLE', 'false');
    vi.stubEnv('VITE_API_HOST', 'localhost');
    vi.stubEnv('VITE_API_PORT', '8080');
    vi.stubEnv('VITE_API_PROTOCOL', 'http');
    vi.stubEnv('VITE_EDITDOR_URL', 'https://eclipse-editor.github.io/editor/');
    vi.stubEnv('VITE_PLAYGROUND_URL', 'https://playground.thingweb.io/');
    vi.stubEnv('VITE_TOKEN_URL', 'https://tmcprod.eu1.sws.siemens.com/oauth/token');
    vi.stubEnv('VITE_SERVER_URL', 'https://eu1.thingmodels.siemens.cloud');
    vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');

    stubDeployGlobals({
      appRepoUrl: '',
      catalogRepoUrl: 'https://github.com/wot-oss/example-catalog.git',
      deployServerAvailable: false,
      serverAvailable: false,
      viteEditdorUrl: 'https://eclipse-editor.github.io/editor/',
      vitePlaygroundUrl: 'https://playground.thingweb.io/',
      viteTokenUrl: 'https://tmcprod.eu1.sws.siemens.com/oauth/token',
      viteServerUrl: 'https://eu1.thingmodels.siemens.cloud',
      viteSetupCredentialsMessage: '',
      apiBase: 'https://eu1.thingmodels.siemens.cloud',
      pipelineCatalogUrl: 'test-tm-ui',
      debug: false,
      deployType: 'TYPE_CATALOG-TMC-UI',
    });

    mockFetchLocalInventory.mockResolvedValue([]);
    mockFetchLocalFilters.mockResolvedValue({
      nextProtocols: [{ value: 'http', label: 'HTTP', checked: false }],
      nextManufacturers: [{ value: 'siemens', label: 'Siemens', checked: false }],
      nextAuthors: [{ value: 'wot-oss', label: 'WoT OSS', checked: false }],
      nextRepositories: [],
    });

    renderApp();

    expect(await screen.findByRole('heading', { name: 'Filters' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Settings' })).toBeTruthy();
    expect(await screen.findByText('Protocol')).toBeTruthy();
    expect(await screen.findByText('Manufacturer')).toBeTruthy();
    expect(await screen.findByText('Author')).toBeTruthy();
  });
  test('Landing page with one item', async () => {
    vi.stubEnv('APP_REPO_URL', '');
    vi.stubEnv('CATALOG_REPO_URL', 'https://github.com/wot-oss/example-catalog.git');
    vi.stubEnv('SERVER_AVAILABLE', 'false');
    vi.stubEnv('VITE_API_HOST', 'localhost');
    vi.stubEnv('VITE_API_PORT', '8080');
    vi.stubEnv('VITE_API_PROTOCOL', 'http');
    vi.stubEnv('VITE_EDITDOR_URL', 'https://eclipse-editor.github.io/editor/');
    vi.stubEnv('VITE_PLAYGROUND_URL', 'https://playground.thingweb.io/');
    vi.stubEnv('VITE_TOKEN_URL', 'https://tmcprod.eu1.sws.siemens.com/oauth/token');
    vi.stubEnv('VITE_SERVER_URL', 'https://eu1.thingmodels.siemens.cloud');
    vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');

    stubDeployGlobals({
      appRepoUrl: '',
      catalogRepoUrl: 'https://github.com/wot-oss/example-catalog.git',
      deployServerAvailable: false,
      serverAvailable: false,
      viteEditdorUrl: 'https://eclipse-editor.github.io/editor/',
      vitePlaygroundUrl: 'https://playground.thingweb.io/',
      viteTokenUrl: 'https://tmcprod.eu1.sws.siemens.com/oauth/token',
      viteServerUrl: 'https://eu1.thingmodels.siemens.cloud',
      viteSetupCredentialsMessage: '',
      apiBase: 'https://eu1.thingmodels.siemens.cloud',
      pipelineCatalogUrl: 'test-tm-ui',
      debug: false,
      deployType: 'TYPE_TMC-UI-CATALOG',
    });

    const item = makeItem('ThingasLamp');
    mockFetchLocalInventory.mockResolvedValue([item]);
    mockFetchLocalFilters.mockResolvedValue({
      nextProtocols: [{ value: 'http', label: 'HTTP', checked: false }],
      nextManufacturers: [{ value: 'siemens', label: 'Siemens', checked: false }],
      nextAuthors: [{ value: 'wot-oss', label: 'WoT OSS', checked: false }],
      nextRepositories: [],
    });

    renderApp();

    expect(await screen.findByRole('heading', { name: 'Filters' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeTruthy();
    expect(await screen.findByRole('link', { name: 'Settings' })).toBeTruthy();
    expect(await screen.findByText('Protocol')).toBeTruthy();
    expect(await screen.findByText('Manufacturer')).toBeTruthy();
    expect(await screen.findByText('Author')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'ThingasLamp', level: 3 })).toBeTruthy();
    await waitFor(() => {
      expect(document.body.textContent?.replace(/\s+/g, ' ')).toContain('1 result found');
    });
  });

  test('Settings page from landing page with one item', async () => {
    vi.stubEnv('APP_REPO_URL', '');
    vi.stubEnv('CATALOG_REPO_URL', 'https://github.com/wot-oss/example-catalog.git');
    vi.stubEnv('SERVER_AVAILABLE', 'false');
    vi.stubEnv('VITE_API_HOST', 'localhost');
    vi.stubEnv('VITE_API_PORT', '8080');
    vi.stubEnv('VITE_API_PROTOCOL', 'http');
    vi.stubEnv('VITE_EDITDOR_URL', 'https://eclipse-editor.github.io/editor/');
    vi.stubEnv('VITE_PLAYGROUND_URL', 'https://playground.thingweb.io/');
    vi.stubEnv('VITE_TOKEN_URL', 'https://tmcprod.eu1.sws.siemens.com/oauth/token');
    vi.stubEnv('VITE_SERVER_URL', 'https://eu1.thingmodels.siemens.cloud');
    vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');

    stubDeployGlobals({
      appRepoUrl: '',
      catalogRepoUrl: 'https://github.com/wot-oss/example-catalog.git',
      deployServerAvailable: false,
      serverAvailable: false,
      viteEditdorUrl: 'https://eclipse-editor.github.io/editor/',
      vitePlaygroundUrl: 'https://playground.thingweb.io/',
      viteTokenUrl: 'https://tmcprod.eu1.sws.siemens.com/oauth/token',
      viteServerUrl: 'https://eu1.thingmodels.siemens.cloud',
      viteSetupCredentialsMessage: '',
      apiBase: 'https://eu1.thingmodels.siemens.cloud',
      pipelineCatalogUrl: 'test-tm-ui',
      debug: false,
      deployType: 'TYPE_TMC-UI-CATALOG',
    });

    const item = makeItem('ThingasLamp');
    mockFetchLocalInventory.mockResolvedValue([item]);
    mockFetchLocalFilters.mockResolvedValue({
      nextProtocols: [{ value: 'http', label: 'HTTP', checked: false }],
      nextManufacturers: [{ value: 'siemens', label: 'Siemens', checked: false }],
      nextAuthors: [{ value: 'wot-oss', label: 'WoT OSS', checked: false }],
      nextRepositories: [],
    });

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

  test('Details page for a local Thing Model', async () => {
    vi.stubEnv('APP_REPO_URL', '');
    vi.stubEnv('CATALOG_REPO_URL', 'https://github.com/wot-oss/example-catalog.git');
    vi.stubEnv('SERVER_AVAILABLE', 'false');
    vi.stubEnv('VITE_API_HOST', 'localhost');
    vi.stubEnv('VITE_API_PORT', '8080');
    vi.stubEnv('VITE_API_PROTOCOL', 'http');
    vi.stubEnv('VITE_EDITDOR_URL', 'https://eclipse-editor.github.io/editor/');
    vi.stubEnv('VITE_PLAYGROUND_URL', 'https://playground.thingweb.io/');
    vi.stubEnv('VITE_TOKEN_URL', 'https://tmcprod.eu1.sws.siemens.com/oauth/token');
    vi.stubEnv('VITE_SERVER_URL', 'https://eu1.thingmodels.siemens.cloud');
    vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', '');

    stubDeployGlobals({
      appRepoUrl: '',
      catalogRepoUrl: 'https://github.com/wot-oss/example-catalog.git',
      deployServerAvailable: false,
      serverAvailable: false,
      viteEditdorUrl: 'https://eclipse-editor.github.io/editor/',
      vitePlaygroundUrl: 'https://playground.thingweb.io/',
      viteTokenUrl: 'https://tmcprod.eu1.sws.siemens.com/oauth/token',
      viteServerUrl: 'https://eu1.thingmodels.siemens.cloud',
      viteSetupCredentialsMessage: '',
      apiBase: 'https://eu1.thingmodels.siemens.cloud',
      pipelineCatalogUrl: 'test-tm-ui',
      debug: false,
      deployType: 'TYPE_TMC-UI-CATALOG',
    });

    const item = makeItem('ThingasLamp');
    mockFetchLocalInventory.mockResolvedValue([item]);
    mockFetchLocalFilters.mockResolvedValue({
      nextProtocols: [{ value: 'http', label: 'HTTP', checked: false }],
      nextManufacturers: [{ value: 'siemens', label: 'Siemens', checked: false }],
      nextAuthors: [{ value: 'wot-oss', label: 'WoT OSS', checked: false }],
      nextRepositories: [],
    });
    mockFetchLocalThingModel.mockResolvedValue({
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
    expect(mockFetchLocalThingModel).toHaveBeenCalledWith(
      '/omnicorp/omnicorp/lightall/ThingasLamp.tm.json',
    );
  });
});
