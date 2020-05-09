import path from 'path';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';

const config = merge(baseConfig, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: './',
  },
});

export default config;
