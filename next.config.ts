import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://3.214.20.215:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
