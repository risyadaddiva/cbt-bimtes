import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs", "xlsx", "pdf-parse"],
  images: {
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/robot.txt",
        destination: "/robots.txt",
        permanent: true,
      },
    ];
  },
  output: "standalone",
};

export default nextConfig;
