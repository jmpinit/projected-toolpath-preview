const { DefinePlugin } = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('@effortlessmotion/html-webpack-inline-source-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.jsx',
  devtool: 'source-map',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.html$/i,
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: false,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'app.html',
      filename: 'index.html',
      inject: 'body',
      inlineSource: '.(js)$',
      cache: false,
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new DefinePlugin({
      COMMIT_HASH: JSON.stringify(process.env.COMMIT_HASH || 'unknown')
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      crypto: false,
      fs: false,
      path: false,
    },
  },
};
