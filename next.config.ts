import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production validation without clearing an active development directory.
  distDir: process.env.JMS_BUILD_DIR || '.next',
  turbopack: {
    root: __dirname,
  },
  devIndicators: false,
  allowedDevOrigins: [
    'localhost:3060',
    'localhost:3050',
    '10.5.1.84',
    '10.5.1.84:3060',
    '10.5.1.137',
    '10.5.1.137:3060',
  ],
};

export default nextConfig;
