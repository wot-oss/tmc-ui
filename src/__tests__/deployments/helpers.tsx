// Shared helpers for App.tsx deployment-configuration integration tests.
//
// The three deployment modes are driven entirely by build-time globals and
// Vite env variables that App.tsx reads at runtime:
//   - static                → __DEPLOY_TYPE__ = 'TYPE_TMC-UI-CATALOG' | 'TYPE_CATALOG-TMC-UI'
//   - backend no auth       → __DEPLOY_TYPE__ = 'SERVER_AVAILABLE', VITE_SERVER_URL set, no VITE_TOKEN_URL
//   - backend with auth     → __DEPLOY_TYPE__ = 'SERVER_AVAILABLE', VITE_SERVER_URL + VITE_TOKEN_URL set
//
// These helpers stub those globals/env values so each test can render the real
// App component (router, contexts, hooks) while only the network boundaries are
// mocked inside the individual test files.

import { render } from '@testing-library/react';
import { vi } from 'vitest';

import App from '../../App';

export type DeployType = 'TYPE_TMC-UI-CATALOG' | 'TYPE_CATALOG-TMC-UI' | 'SERVER_AVAILABLE';

export const TEST_API_BASE = 'http://test-api';

export const TOKEN_RESULT = {
  accessToken: 'test-access-token',
  expiresAt: Date.now() + 3_600_000,
};

interface DeployGlobalsOptions {
  readonly serverAvailable?: boolean;
  readonly appRepoUrl?: string;
  readonly catalogRepoUrl?: string;
  readonly deployServerAvailable?: boolean;
  readonly viteEditdorUrl?: string;
  readonly vitePlaygroundUrl?: string;
  readonly viteTokenUrl?: string;
  readonly viteServerUrl?: string;
  readonly viteSetupCredentialsMessage?: string;
  readonly apiBase?: string;

  readonly pipelineCatalogUrl?: string;
  readonly debug?: boolean;
  readonly deployType: DeployType;
}

interface TestImportMetaEnv {
  readonly APP_REPO_URL?: string;
  readonly CATALOG_REPO_URL?: string;
  readonly VITE_EDITDOR_URL?: string;
  readonly VITE_PLAYGROUND_URL?: string;
  readonly VITE_TOKEN_URL?: string;
  readonly VITE_SERVER_URL?: string;
  readonly VITE_SETUP_CREDENTIALS_MESSAGE?: string;
}

/**
 * Stubs the Vite-injected build globals that App.tsx and its children read at
 * runtime. Call inside `beforeEach`; pair with `vi.unstubAllGlobals()` in
 * `afterEach`.
 */
export function stubDeployGlobals({
  deployType,
  apiBase = TEST_API_BASE,
  serverAvailable = false,
  appRepoUrl,
  catalogRepoUrl,
  deployServerAvailable,
  viteEditdorUrl,
  vitePlaygroundUrl,
  viteTokenUrl,
  viteServerUrl,
  viteSetupCredentialsMessage,
  pipelineCatalogUrl = 'test-tm-ui',
  debug = false,
}: DeployGlobalsOptions): void {
  const env = import.meta.env as ImportMetaEnv & TestImportMetaEnv;

  vi.stubGlobal('__APP_REPO_URL__', appRepoUrl ?? env.APP_REPO_URL ?? '');
  vi.stubGlobal('__CATALOG_REPO_URL__', catalogRepoUrl ?? env.CATALOG_REPO_URL ?? '');
  vi.stubGlobal('__DEPLOY_SERVER_AVAILABLE__', deployServerAvailable ?? serverAvailable);
  vi.stubGlobal('__SERVER_AVAILABLE__', serverAvailable);
  vi.stubGlobal('__VITE_EDITDOR_URL__', viteEditdorUrl ?? env.VITE_EDITDOR_URL ?? '');
  vi.stubGlobal('__VITE_PLAYGROUND_URL__', vitePlaygroundUrl ?? env.VITE_PLAYGROUND_URL ?? '');
  vi.stubGlobal('__VITE_TOKEN_URL__', viteTokenUrl ?? env.VITE_TOKEN_URL ?? '');
  vi.stubGlobal('__VITE_SERVER_URL__', viteServerUrl ?? env.VITE_SERVER_URL ?? '');
  vi.stubGlobal(
    '__VITE_SETUP_CREDENTIALS_MESSAGE__',
    viteSetupCredentialsMessage ?? env.VITE_SETUP_CREDENTIALS_MESSAGE ?? '',
  );
  vi.stubGlobal('__API_BASE__', apiBase);
  vi.stubGlobal('__PIPELINE_CATALOG_URL__', pipelineCatalogUrl);
  vi.stubGlobal('__DEBUG__', debug);
  vi.stubGlobal('__DEPLOY_TYPE__', deployType);
}

/**
 * Builds a minimal inventory item with the shape App's catalog (GridList → Card)
 * needs to render a visible <h3> title.
 */
export function makeItem(name: string): Record<string, unknown> {
  return {
    links: { self: `/inventory/${name}` },
    repo: 'test-repo',
    name: name,
    tmName: name,
    '@context': [
      'https://www.w3.org/2022/wot/td/v1.1',
      {
        schema: 'https://schema.org/',
      },
    ],
    '@type': 'tm:ThingModel',
    title: 'MyLampThing',
    'schema:mpn': 'LampMpn',
    'schema:manufacturer': {
      'schema:name': 'LampManufacturer',
    },
    'schema:author': {
      'schema:name': 'LampAuthor',
    },
    properties: {
      temperature: {
        description: 'temperature (degrees C)',
        type: 'number',
        readOnly: true,
      },
      humidity: {
        description: 'relative humidity (%)',
        type: 'number',
        readOnly: true,
      },
      pressure: {
        description: 'atmospheric pressure (hPa)',
        type: 'number',
        readOnly: true,
      },
    },
    version: {
      model: 'v1.0.0',
    },
    versions: [
      {
        links: {
          content: `/omnicorp/omnicorp/lightall/${name}.tm.json`,
        },
        version: {
          model: 'v1.0.0',
        },
      },
    ],
    id: 'lampuser/lampcorp/lampmodel/v1.0.0-20241008124326-15af48381cf7.tm.json',
  };
}

/**
 * A successful JSON `fetch` response double used to satisfy FilterContext's
 * direct repos/manufacturers/authors requests in backend deployments.
 */
export function okJsonResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response;
}

export function renderApp() {
  return render(<App />);
}

/** Clears any session-stored credentials so each test starts unauthenticated. */
export function clearStoredSession(): void {
  window.sessionStorage.clear();
}
