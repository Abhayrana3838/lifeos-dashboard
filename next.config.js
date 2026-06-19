/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  experimental: {
    serverComponentsExternalPackages: [],
  },
  webpack: (config, { isServer }) => {
    // Prevent Three.js from being processed on the server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'three']
    }
    return config
  },
}

module.exports = nextConfig
