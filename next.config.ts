import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración recomendada por Next.js para túneles
  devIndicators: {
    appIsrStatus: true,
  },
  // Según el log, debe ir en la raíz para Next 15/16
  // @ts-ignore
  allowedDevOrigins: ['lks2p0vbr.localto.net'],
  
  serverExternalPackages: ['puppeteer'],

  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'http://127.0.0.1:3001/storage/:path*', // Proxy to Laravel
      },
    ];
  },
};

export default nextConfig;
