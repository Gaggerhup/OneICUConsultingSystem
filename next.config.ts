import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
