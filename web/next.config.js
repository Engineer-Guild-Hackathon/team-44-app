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

    // MUIの最適化
    config.resolve.alias = {
      ...config.resolve.alias,
      // '@mui/material': '@mui/material/esm',
      // '@mui/icons-material': '@mui/icons-material/esm',
    };

    // バンドルアナライザー
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },
  // バンドルサイズ最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 不要なpolyfillを除外
  excludeDefaultMomentLocales: true,
}

module.exports = nextConfig
