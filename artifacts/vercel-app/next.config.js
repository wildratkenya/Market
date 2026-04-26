/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:path((?!api/|_next/|assets/|favicon/).*)",
        destination: "/",
      },
    ];
  },
};

module.exports = nextConfig;