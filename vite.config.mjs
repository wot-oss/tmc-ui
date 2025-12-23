import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const host = env.VITE_API_HOST ?? 'localhost';
  const port = env.VITE_API_PORT ?? '8080';
  const protocol = env.VITE_API_PROTOCOL ?? 'http';
  const API_BASE = `${protocol}://${host}:${port}`;

  return {
    plugins: [react()],
    define: {
      __API_BASE__: JSON.stringify(API_BASE),
    },
    // server: {
    //   proxy: {
    //     '/api': {
    //       target: API_BASE,
    //       changeOrigin: true,
    //     },
    //   },
    // },
  };
});
