import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:2568/api/v1/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:2568/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
