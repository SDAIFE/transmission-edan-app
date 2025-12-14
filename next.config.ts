import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  // Optimisation des performances
  poweredByHeader: false,
  generateEtags: false,
  // Configuration des images pour la production
  images: {
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Protection contre le  Clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Protection contre le MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Protection contre le XSS (Cross-Site Scripting)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referer Policy pour la confidentialité des données
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Content Security Policy pour la protection contre les attaques XSS
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self'",
              "connect-src 'self' https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
          : "http://localhost:3001/api/v1/:path*",
      },
    ];
  },
  // Configuration pour eviter les timeouts sur les requetes longues
  experimental: {
    proxyTimeout: 180000,
  },
};

export default nextConfig;
