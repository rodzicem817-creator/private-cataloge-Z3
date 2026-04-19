import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bzrisphgmhyvsocxvari.supabase.co',
      },
    ],
  },
};

export default nextConfig;
