import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GUARDIAN_API_KEY: process.env.GUARDIAN_API_KEY,
  },
};

export default nextConfig;
