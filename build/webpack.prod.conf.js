'use strict';
const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const env =
  process.env.NODE_ENV === 'testing'
    ? require('../config/test.env')
    : require('../config/prod.env');

// Sentry の Loader Script の公開キー（vars.SENTRY_LOADER_KEY）。未設定なら Sentry のタグを出さない
const sentryLoaderKey = process.env.SENTRY_LOADER_KEY || '';

// Sentry の release に使うコミット SHA（deploy.yml の SENTRY_RELEASE）。
// index.html のスクリプトに埋め込むため、40 桁の 16 進数だけを受け付ける。
// キーがあるのに値が無い・不正なときは、release を付けずに警告だけ出してビルドを続ける
const rawSentryRelease = process.env.SENTRY_RELEASE || '';
const sentryRelease = /^[0-9a-f]{40}$/.test(rawSentryRelease)
  ? rawSentryRelease
  : '';
if (sentryLoaderKey && !sentryRelease) {
  console.warn(
    'SENTRY_RELEASE が未設定か 40 桁の 16 進数ではないため、Sentry の release を付けずにビルドします',
  );
}

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true,
    }),
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[contenthash].js'),
    chunkFilename: utils.assetsPath('js/[id].[contenthash].js'),
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          priority: 10,
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  // バンドルサイズのバジェット。超過すると compilation error になり build.mjs が
  // exit 1 で落ちる。依存更新 (Renovate の minor/patch 自動マージ) や実装変更による
  // 無音の肥大化を build ジョブで止める (#489)。
  // 判定は gzip 前のサイズ。CloudFront の転送量ではなく相対的な退行検知として使う。
  performance: {
    hints: 'error',
    // 画像は依存更新では増減しないため対象外にし、JS/CSS の退行だけを見る
    assetFilter: (assetFilename) => /\.(js|css)$/.test(assetFilename),
    // 2026-11 時点の実測: bootstrap-vue-next コンポーネント（BNavbar 等 8 種）を
    // 明示登録した後の最大アセット (js/vendor) 456,209 B / entrypoint 合計 1,133,498 B。
    // 約 13% の余裕を持たせている。
    // 正当な機能追加で超える場合は、同じ PR でこの値を意識して引き上げる。
    // lighthouserc.json にも転送量の上限 (広告込み・warn) があるため併せて見直す。
    maxAssetSize: 520000,
    maxEntrypointSize: 1280000,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      chunkFilename: utils.assetsPath('css/[id].[contenthash].css'),
    }),
    new HtmlWebpackPlugin({
      filename:
        process.env.NODE_ENV === 'testing' ? 'index.html' : config.build.index,
      template: 'index.html',
      inject: true,
      sentryLoaderKey,
      sentryRelease,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../static'),
          to: config.build.assetsSubDirectory,
          globOptions: {
            ignore: ['**/.*'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
});

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin');

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      filename: '[path][base].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' + config.build.productionGzipExtensions.join('|') + ')$'
      ),
      threshold: 10240,
      minRatio: 0.8,
    })
  );
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
