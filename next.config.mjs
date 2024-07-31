/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = ['mongoose']; // Exclude mongoose from client-side build
    }

    return config;
  },
};

export default nextConfig;
