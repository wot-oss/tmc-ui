import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEV_API_PROXY_PREFIX = ;

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const remoteApiBase = env.SERVER_URL || `http://localhost:8080`;
  const isDevServer = env.LOCAL === 'true';

  const apiBase = isDevServer ? DEV_API_PROXY_PREFIX : remoteApiBase;

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
      __PIPELINE_CATALOG_URL__: JSON.stringify('test-tm-ui'), // TODO: ??
    },
  };
});
