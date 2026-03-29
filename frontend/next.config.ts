import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
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
      '@/shared/components/display',
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
    ],
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /**
   * Security Headers
   *
   * Applied to every response. CSP lives in the middleware (nonce-aware);
   * these headers cover the remaining baseline hardening.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
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
    const backendUrl = process.env.INTERNAL_API_URL
      || process.env.NEXT_PUBLIC_API_URL
      || 'http://localhost:8000';

    return [
      {
        // Proxy all /api/v1/* requests to the backend
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        // Proxy storage files (event images) to the backend
        source: '/storage/:path*',
        destination: `${backendUrl}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
