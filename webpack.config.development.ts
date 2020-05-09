import * as webpack from 'webpack';
import path from 'path';
import merge from 'webpack-merge';
import autoprefixer from 'autoprefixer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackBuildNotifierPlugin from 'webpack-build-notifier';

import baseConfig from './webpack.config.base';

const config = merge(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, './.temp'),
    publicPath: '/',
  },
  devServer: {
    contentBase: '.temp',
    host: '0.0.0.0',
    disableHostCheck: true,
    hot: true,
    inline: true,
    overlay: true,
    port: 3050,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new WebpackBuildNotifierPlugin({
      suppressSuccess: true,
      suppressWarning: true,
    }),
  ],
} as webpack.Configuration);

config.module.rules.push({
  test: /\.(sass|scss)/,
  use: [
    'css-hot-loader',
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        // 0 => no loaders (default);
        // 1 => postcss-loader;
        // 2 => postcss-loader, sass-loader
        importLoaders: 2,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        plugins: () => [
          autoprefixer(),
        ],
      },
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
      },
    },
  ],
});

const ip = require('ip');
// eslint-disable-next-line no-console
console.log(`External: http://${ip.address()}:${config.devServer.port}`);

export default config;
