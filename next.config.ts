import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pokemontcg.io",
        pathname: "/**",
      },
    ],
  },
  typedRoutes: true,
  serverExternalPackages: ["firebase-admin", "@google-cloud/logging"],
};

export default nextConfig;
