import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEV_API_PROXY_PREFIX = '/__tmc_api__';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const host = env.VITE_API_HOST || 'localhost';
  const port = env.VITE_API_PORT || '8080';
  const protocol = env.VITE_API_PROTOCOL || 'http';
  const remoteApiBase = env.VITE_SERVER_URL || `${protocol}://${host}:${port}`;
  const isDevServer = false; // TODO needs to be changed in production
  const apiBase = isDevServer ? DEV_API_PROXY_PREFIX : remoteApiBase;

  const appRepoUrl = env.APP_REPO_URL || '';
  const catalogRepoUrl = env.CATALOG_REPO_URL || '';
  const serverAvailable = env.SERVER_AVAILABLE === 'true';

  let deployType = '';

  if (serverAvailable) {
    deployType = 'SERVER_AVAILABLE';
  } else if (!catalogRepoUrl) {
    deployType = 'TYPE_CATALOG-TMC-UI';
  } else {
    deployType = 'TYPE_TMC-UI-CATALOG';
  }

  return {
    plugins: [react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],
    server: {
      proxy: {
        [DEV_API_PROXY_PREFIX]: {
          target: remoteApiBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${DEV_API_PROXY_PREFIX}`), ''),
        },
      },
    },
    define: {
      __APP_REPO_URL__: JSON.stringify(appRepoUrl),
      __CATALOG_REPO_URL__: JSON.stringify(catalogRepoUrl),
      __DEPLOY_SERVER_AVAILABLE__: serverAvailable,
      __VITE_EDITDOR_URL__: JSON.stringify(env.VITE_EDITDOR_URL),
      __VITE_PLAYGROUND_URL__: JSON.stringify(env.VITE_PLAYGROUND_URL),
      __VITE_TOKEN_URL__: JSON.stringify(env.VITE_TOKEN_URL),
      __VITE_SERVER_URL__: JSON.stringify(env.VITE_SERVER_URL),
      __VITE_SETUP_CREDENTIALS_MESSAGE__: JSON.stringify(env.VITE_SETUP_CREDENTIALS_MESSAGE),
      __API_BASE__: JSON.stringify(apiBase),
      __PIPELINE_CATALOG_URL__: JSON.stringify('test-tm-ui'), // TODO: ??
      __DEBUG__: true,
      __DEPLOY_TYPE__: JSON.stringify(deployType),
    },
  };
});
