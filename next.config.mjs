/** @type {import('next').NextConfig} */
const nextConfig = { async rewrites() { return { beforeFiles: [{ source: "/uploads/:path*", destination: "/api/uploads-denied" }] }; } };

export default nextConfig;
