import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: [path.resolve('./src')],
  },
  images: {
    qualities: [75, 85, 90],
  },
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react', 'motion'],
  },
};

export default nextConfig;
