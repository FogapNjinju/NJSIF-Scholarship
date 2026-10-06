/** @type {import('next').NextConfig} */
const apiBackendUrl = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
