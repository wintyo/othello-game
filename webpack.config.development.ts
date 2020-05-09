import * as webpack from 'webpack';
import path from 'path';
import merge from 'webpack-merge';
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
    new WebpackBuildNotifierPlugin({
      suppressSuccess: true,
      suppressWarning: true,
    }),
  ],
} as webpack.Configuration);

const ip = require('ip');
// eslint-disable-next-line no-console
console.log(`External: http://${ip.address()}:${config.devServer.port}`);

export default config;
