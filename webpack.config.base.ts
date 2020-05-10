import path from 'path';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import AutoDllWebpackPlugin from 'autodll-webpack-plugin';

export default {
  entry: {
    index: [path.resolve(__dirname, './src/scripts/entry.ts')],
  },
  output: {
    path: './dist',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src/scripts/'),
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './src/pug/index.pug'),
      hash: true,
      inject: true,
    }),
    new AutoDllWebpackPlugin({
      inject: true,
      filename: '[name].js',
      entry: {
        vendor: [
          'three',
        ],
      },
    }),
  ],
} as webpack.Configuration;
