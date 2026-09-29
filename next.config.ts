import type { NextConfig } from 'next';

const SERVER_URL = process.env.SERVER_URL ?? process.env.VITE_SERVER_URL;

const nextConfig: NextConfig = {
  /*
  IMPORTANT:
  The env vars defined here become public and you should not define secrets here.

  Some vars have been renamed and backwards compatibility is provided
  */
  env: {
    SERVER_URL,
    TOKEN_URL: process.env.TOKEN_URL ?? process.env.VITE_TOKEN_URL,
    EDITDOR_URL: process.env.EDITDOR_URL ?? process.env.VITE_EDITDOR_URL,
    PLAYGROUND_URL: process.env.PLAYGROUND_URL ?? process.env.VITE_PLAYGROUND_URL,
    CREDENTIALS_SETUP_MESSAGE:
      process.env.CREDENTIALS_SETUP_MESSAGE ?? process.env.VITE_SETUP_CREDENTIALS_MESSAGE,
    API_HOST: process.env.API_HOST ?? process.env.VITE_API_HOST,
    API_PORT: process.env.API_PORT ?? process.env.VITE_API_PORT,
    API_PROTOCOL: process.env.API_PROTOCOL ?? process.env.VITE_API_PROTOCOL,
    API_BASE: process.env.NODE_ENV === 'development' ? '/__tmc_api__' : SERVER_URL,
  },

  async rewrites() {
    return [
      {
        source: '/__tmc_api__/:path*',
        destination: `${SERVER_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
