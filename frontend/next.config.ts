import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Monorepo support: explicitly set workspace root to avoid multiple lockfile warning
  outputFileTracingRoot: path.join(__dirname, '../'),

  experimental: {
    // Optimize barrel imports for better tree-shaking
    // This transforms: import { X } from 'lucide-react' -> import X from 'lucide-react/dist/esm/icons/X'
    optimizePackageImports: [
      'lucide-react',
      '@/components/ui',
      '@/shared/components/form',
      '@/features/events',
      '@/features/auth',
      '@/features/appearance',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /**
   * API Proxy Configuration
   *
   * Proxies /api requests through Next.js to avoid CORS issues with cookies.
   * This allows httpOnly cookies to work correctly in development where
   * frontend (port 3000) and backend (port 8000) are on different ports.
   *
   * In production, configure your reverse proxy (nginx) to handle this.
   */
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    return [
      {
        // Proxy all /api/v1/* requests to the backend
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
