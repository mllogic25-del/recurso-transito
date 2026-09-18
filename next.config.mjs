/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "dist",
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
