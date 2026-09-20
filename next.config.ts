import type { NextConfig } from "next";

import withPWA from "@ducanh2912/next-pwa";

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Evita interferencias mientras desarrollas
  register: true,
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "TU-PROYECTO.supabase.co" },
    ],
  },
};

export default withPWAConfig(nextConfig);
