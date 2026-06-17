// @vitest-environment jsdom
//
// Env/global integration coverage for Vite deployment configuration.
// vite.config.mjs converts .env values into build-time globals such as
// __API_BASE__ and __DEPLOY_TYPE__. These tests render the real App tree and
// verify those values reach the visible app flow and service boundaries.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { MockedFunction } from 'vitest';
import { requestClientCredentialsToken } from '../../../services/auth';
import { TOKEN_RESULT, clearStoredSession, renderApp, stubDeployGlobals } from '../helpers';

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

interface TestEnv {
  readonly APP_REPO_URL: string;
  readonly CATALOG_REPO_URL: string;
  readonly SERVER_AVAILABLE: string;
  readonly VITE_API_HOST: string;
  readonly VITE_API_PORT: string;
  readonly VITE_API_PROTOCOL: string;
  readonly VITE_EDITDOR_URL: string;
  readonly VITE_PLAYGROUND_URL: string;
  readonly VITE_TOKEN_URL: string;
  readonly VITE_SERVER_URL: string;
  readonly VITE_SETUP_CREDENTIALS_MESSAGE: string;
}

describe('Vite env values exposed to App as deployment globals', () => {
  test('uses env values and deployment globals to render the credentials prompt', async () => {
    vi.stubEnv('APP_REPO_URL', '');
    vi.stubEnv('CATALOG_REPO_URL', 'https://github.com/wot-oss/example-catalog.git');
    vi.stubEnv('SERVER_AVAILABLE', 'true');
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
      deployServerAvailable: true,
      serverAvailable: true,
      viteEditdorUrl: 'https://eclipse-editor.github.io/editor/',
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
    const env = import.meta.env as ImportMetaEnv & TestEnv;

    expect(env.APP_REPO_URL).toBe('');
    expect(env.CATALOG_REPO_URL).toBe('https://github.com/wot-oss/example-catalog.git');
    expect(env.SERVER_AVAILABLE).toBe('true');
    expect(env.VITE_API_HOST).toBe('localhost');
    expect(env.VITE_API_PORT).toBe('8080');
    expect(env.VITE_API_PROTOCOL).toBe('http');
    expect(env.VITE_EDITDOR_URL).toBe('https://eclipse-editor.github.io/editor/');
    expect(env.VITE_PLAYGROUND_URL).toBe('https://playground.thingweb.io/');
    expect(env.VITE_TOKEN_URL).toBe('https://tmcprod.eu1.sws.siemens.com/oauth/token');
    expect(env.VITE_SERVER_URL).toBe('https://eu1.thingmodels.siemens.cloud');
    expect(env.VITE_SETUP_CREDENTIALS_MESSAGE).toBe('');

    await screen.findByRole('heading', { name: 'Enter API credentials' });
    expect(screen.getByLabelText('Client ID')).toBeTruthy();
    expect(screen.getByLabelText('Client Secret')).toBeTruthy();
    expect(screen.queryByText('Environment not configured')).toBeNull();
  });
});
