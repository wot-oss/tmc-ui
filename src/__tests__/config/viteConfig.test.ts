// @vitest-environment node

import { describe, expect, test, vi } from 'vitest';
import type { ConfigEnv, UserConfig } from 'vite';

import viteConfig from '../../../vite.config.mjs';

interface ViteConfigDefines {
  readonly __APP_REPO_URL__?: string;
  readonly __CATALOG_REPO_URL__?: string;
  readonly __DEPLOY_SERVER_AVAILABLE__?: boolean;
  readonly __VITE_EDITDOR_URL__?: string;
  readonly __VITE_PLAYGROUND_URL__?: string;
  readonly __VITE_TOKEN_URL__?: string;
  readonly __VITE_SERVER_URL__?: string;
  readonly __VITE_SETUP_CREDENTIALS_MESSAGE__?: string;

  readonly __API_BASE__?: string;
  readonly __PIPELINE_CATALOG_URL__?: string;
  readonly __DEBUG__?: boolean;
  readonly __DEPLOY_TYPE__?: string;
}

const ENV_KEYS = [
  'APP_REPO_URL',
  'CATALOG_REPO_URL',
  'SERVER_AVAILABLE',
  'VITE_EDITDOR_URL',
  'VITE_PLAYGROUND_URL',
  'VITE_TOKEN_URL',
  'VITE_SERVER_URL',
  'VITE_SETUP_CREDENTIALS_MESSAGE',
] as const;

function clearConfigEnv(): void {
  ENV_KEYS.forEach((key) => vi.stubEnv(key, ''));
}

function resolveViteConfig(command: ConfigEnv['command'] = 'build'): UserConfig {
  if (typeof viteConfig === 'function') {
    return viteConfig({ command, mode: 'test', ssrBuild: false });
  }

  return viteConfig;
}

function getDefines(): ViteConfigDefines {
  return resolveViteConfig().define as ViteConfigDefines;
}

describe('Vite config file test the setup of globals', () => {
  test('maps env values to the build globals used by the app', () => {
    clearConfigEnv();
    vi.stubEnv('APP_REPO_URL', '');
    vi.stubEnv('CATALOG_REPO_URL', 'https://github.com/wot-oss/example-catalog.git');
    vi.stubEnv('SERVER_AVAILABLE', 'true');
    vi.stubEnv('VITE_EDITDOR_URL', 'https://eclipse-editor.github.io/editor/');
    vi.stubEnv('VITE_PLAYGROUND_URL', 'https://playground.thingweb.io/');
    vi.stubEnv('VITE_TOKEN_URL', 'https://vite.token.url/token');
    vi.stubEnv('VITE_SERVER_URL', 'https://vite.server.url/');
    vi.stubEnv('VITE_SETUP_CREDENTIALS_MESSAGE', 'This is a message.');

    const defines = getDefines();

    expect(defines.__APP_REPO_URL__).toBe(JSON.stringify(''));
    expect(defines.__CATALOG_REPO_URL__).toBe(
      JSON.stringify('https://github.com/wot-oss/example-catalog.git'),
    );
    expect(defines.__DEPLOY_SERVER_AVAILABLE__).toBe(true);
    expect(defines.__VITE_EDITDOR_URL__).toBe(
      JSON.stringify('https://eclipse-editor.github.io/editor/'),
    );
    expect(defines.__VITE_PLAYGROUND_URL__).toBe(JSON.stringify('https://playground.thingweb.io/'));
    expect(defines.__VITE_TOKEN_URL__).toBe(JSON.stringify('https://vite.token.url/token'));
    expect(defines.__VITE_SERVER_URL__).toBe(JSON.stringify('https://vite.server.url/'));
    expect(defines.__VITE_SETUP_CREDENTIALS_MESSAGE__).toBe(JSON.stringify('This is a message.'));

    expect(defines.__API_BASE__).toBe(JSON.stringify('https://vite.server.url/'));
    expect(defines.__PIPELINE_CATALOG_URL__).toBe(JSON.stringify('test-tm-ui'));
    //expect(defines.__DEBUG__).toBe(true);
    expect(defines.__DEPLOY_TYPE__).toBe(JSON.stringify('SERVER_AVAILABLE'));
  });

  test('falls back to the default localhost API base when VITE_SERVER_URL is not set', () => {
    clearConfigEnv();

    const defines = getDefines();

    expect(defines.__API_BASE__).toBe(JSON.stringify('http://localhost:8080'));
  });

  test('prefers VITE_SERVER_URL over the default API base', () => {
    clearConfigEnv();
    vi.stubEnv('VITE_SERVER_URL', 'https://configured-server.example.test');

    const defines = getDefines();

    expect(defines.__API_BASE__).toBe(JSON.stringify('https://configured-server.example.test'));
    expect(defines.__VITE_SERVER_URL__).toBe(
      JSON.stringify('https://configured-server.example.test'),
    );
  });

  test('routes API calls through the Vite proxy when serving locally', () => {
    clearConfigEnv();
    vi.stubEnv('VITE_SERVER_URL', 'http://localhost:8080');

    const defines = resolveViteConfig('serve').define as ViteConfigDefines;

    expect(defines.__API_BASE__).toBe(JSON.stringify('/__tmc_api__'));
  });

  test('sets SERVER_AVAILABLE deployment globals when SERVER_AVAILABLE is true', () => {
    clearConfigEnv();
    vi.stubEnv('SERVER_AVAILABLE', 'true');

    const defines = getDefines();

    expect(defines.__DEPLOY_SERVER_AVAILABLE__).toBe(true);
    expect(defines.__DEPLOY_TYPE__).toBe(JSON.stringify('SERVER_AVAILABLE'));
  });

  test('sets the external catalog deployment type when no catalog repo URL is configured', () => {
    clearConfigEnv();

    const defines = getDefines();

    expect(defines.__CATALOG_REPO_URL__).toBe(JSON.stringify(''));
    expect(defines.__DEPLOY_TYPE__).toBe(JSON.stringify('TYPE_CATALOG-TMC-UI'));
  });

  test('sets the embedded app catalog deployment type when CATALOG_REPO_URL is configured', () => {
    clearConfigEnv();
    vi.stubEnv('CATALOG_REPO_URL', 'https://example.test/catalog.git');

    const defines = getDefines();

    expect(defines.__CATALOG_REPO_URL__).toBe(JSON.stringify('https://example.test/catalog.git'));
    expect(defines.__DEPLOY_TYPE__).toBe(JSON.stringify('TYPE_TMC-UI-CATALOG'));
  });
});
