import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: [path.resolve('./src')],
  },
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react', 'motion'],
  },
};

export default nextConfig;
