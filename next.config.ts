import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-a104d975-f463-479b-8fd6-c85ddc8e186a.space-z.ai",
    ".space-z.ai",
    ".space.chatglm.site",
  ],
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ];
  },
};

export default nextConfig;
