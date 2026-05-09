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
};

export default nextConfig;
