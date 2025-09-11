/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // 一時的に無効化
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  transpilePackages: ['undici'],
  experimental: {
    // ファイルパスの問題を回避するための設定
    esmExternals: 'loose',
    // webpack のトレースを無効化
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer }) => {
    // undiciのprivate field syntaxを扱うための設定
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // next-trace-entrypoints-plugin を無効化
    config.plugins = config.plugins.filter(plugin => {
      return !plugin.constructor.name.includes('TraceEntryPointsPlugin');
    });

    return config;
  },
}

module.exports = nextConfig
