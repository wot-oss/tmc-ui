import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEV_API_PROXY_PREFIX = '/__tmc_api__';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const host = env.API_HOST || 'localhost';
  const port = env.API_PORT || '8080';
  const protocol = env.API_PROTOCOL || 'http';
  const remoteApiBase = env.VITE_SERVER_URL || `${protocol}://${host}:${port}`;
  const isDevServer = command === 'serve';
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
  //console.log('Base url ;D ', import.meta.env.BASE_URL);

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
      __API_BASE__: JSON.stringify(apiBase),
      __CATALOG_URL__: JSON.stringify('test-tm-ui'),
      __DEBUG__: true,
      __SERVER_AVAILABLE__: serverAvailable,
      __APP_REPO_URL__: JSON.stringify(appRepoUrl),
      __CATALOG_REPO_URL__: JSON.stringify(catalogRepoUrl),
      __DEPLOY_TYPE__: JSON.stringify(deployType),
    },
  };
});
