import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Re-enabled after fixing infinite loop in useInternalCalendarEvents hook
  images: {
    // Allow external images from any domain for user-uploaded content
    // In production, you should restrict this to specific domains for security
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
    // Fallback for unknown domains
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
