/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  typescript: {
    ignoreBuildErrors: false
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Prevent XSS attacks
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Enforce HTTPS (only in production)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Permissions policy - restrict dangerous features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy - prevent XSS and data injection
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sleeper.app https://*.clerk.accounts.dev https://*.clerk.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://sleeper.app https://*.clerk.accounts.dev https://*.clerk.com https://api.sleeper.app https://clerk-telemetry.com",
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
      {
        // More relaxed CSP for development API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig