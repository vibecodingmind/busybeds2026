import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // output: 'standalone', // Not needed for dev mode
  allowedDevOrigins: [
    "preview-chat-a104d975-f463-479b-8fd6-c85ddc8e186a.space-z.ai",
    ".space-z.ai",
    ".space.chatglm.site",
  ],
};

export default nextConfig;
