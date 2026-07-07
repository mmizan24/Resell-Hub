/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/server/:path*',
        destination: 'http://localhost:5000/:path*',
      },
    ];
  },
};

export default nextConfig;
