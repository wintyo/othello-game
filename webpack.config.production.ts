import path from 'path';
import * as webpack from 'webpack';
import merge from 'webpack-merge';
import autoprefixer from 'autoprefixer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import baseConfig from './webpack.config.base';

const config = merge(baseConfig, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: './',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
} as webpack.Configuration);

config.module.rules.push({
  test: /\.(sass|scss)/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        // 0 => no loaders (default);
        // 1 => postcss-loader;
        // 2 => postcss-loader, sass-loader
        importLoaders: 2,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [
          autoprefixer(),
        ],
      },
    },
    {
      loader: 'sass-loader',
    },
  ],
});

export default config;
