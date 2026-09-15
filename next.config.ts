import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "TU-PROYECTO.supabase.co" },
    ],
  },
};

export default nextConfig;
