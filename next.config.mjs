/** @type {import('next').NextConfig} */
const backendOrigin = process.env.API_URL?.trim().replace(/\/$/, "");
const devBackendOrigin = "http://127.0.0.1:5000";

const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    const destination =
      backendOrigin ||
      (process.env.NODE_ENV === "production" ? null : devBackendOrigin);

    if (!destination) {
      return [];
    }

    return [
      {
        source: '/server/:path*',
        destination: `${destination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
