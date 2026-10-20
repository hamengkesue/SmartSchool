/** @type {import('next').NextConfig} */
const nextConfig = {
  // Shared Hosting & Static Export compatibility
  output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Ensure Ngrok and CORS headers are handled gracefully
  reactStrictMode: true,
};

export default nextConfig;
