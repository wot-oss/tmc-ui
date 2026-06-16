// @vitest-environment node

import { describe, expect, test, vi } from 'vitest';
import type { ConfigEnv, UserConfig } from 'vite';

import viteConfig from '../../../vite.config.mjs';

interface ViteConfigDefines {
  readonly __APP_REPO_URL__?: string;
  readonly __CATALOG_REPO_URL__?: string;
  readonly __DEPLOY_SERVER_AVAILABLE__?: boolean;
  readonly __VITE_SERVER_URL__?: string;
  readonly __API_BASE__?: string;
  readonly __DEBUG__?: boolean;
  readonly __DEPLOY_TYPE__?: string;
}

const ENV_KEYS = [
  'APP_REPO_URL',
  'CATALOG_REPO_URL',
  'SERVER_AVAILABLE',
  'VITE_API_HOST',
  'VITE_API_PORT',
  'VITE_API_PROTOCOL',
  'VITE_SERVER_URL',
  'VITE_TOKEN_URL',
  'VITE_EDITOR_URL',
  'VITE_PLAYGROUND_URL',
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

describe('vite config env mapping', () => {
  test('builds __API_BASE__ from VITE_API_HOST, VITE_API_PORT, and VITE_API_PROTOCOL', () => {
    clearConfigEnv();
    vi.stubEnv('VITE_API_HOST', 'api.example.test');
    vi.stubEnv('VITE_API_PORT', '9443');
    vi.stubEnv('VITE_API_PROTOCOL', 'https');

    const defines = getDefines();

    expect(defines.__API_BASE__).toBe(JSON.stringify('https://api.example.test:9443'));
  });

  test('prefers VITE_SERVER_URL over the host, port, and protocol values', () => {
    clearConfigEnv();
    vi.stubEnv('VITE_API_HOST', 'ignored-host.example.test');
    vi.stubEnv('VITE_API_PORT', '1234');
    vi.stubEnv('VITE_API_PROTOCOL', 'http');
    vi.stubEnv('VITE_SERVER_URL', 'https://configured-server.example.test');

    const defines = getDefines();

    expect(defines.__API_BASE__).toBe(JSON.stringify('https://configured-server.example.test'));
    expect(defines.__VITE_SERVER_URL__).toBe(
      JSON.stringify('https://configured-server.example.test'),
    );
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
