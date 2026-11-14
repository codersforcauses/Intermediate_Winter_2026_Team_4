import type { NextConfig } from "next";

// Where the Django backend lives. The browser never talks to it directly:
// it calls same-origin `/django/...` URLs, which Next proxies to Django. That
// keeps the session and CSRF cookies on a single origin.
const DJANGO_ORIGIN = process.env.DJANGO_ORIGIN || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/django/:path*",
        // Django routes end in a slash, but Next strips trailing slashes from
        // incoming URLs, so the slash is added back here.
        destination: `${DJANGO_ORIGIN}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
