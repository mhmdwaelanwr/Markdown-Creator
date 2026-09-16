const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const appDir = __dirname;
const transpileModules = [
  'react-native',
  '@react-native',
  '@react-native-community',
  '@react-navigation',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-vector-icons',
  'react-native-paper',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-svg',
  'react-native-markdown-display',
  '@react-native-async-storage',
];

const transpileRegex = new RegExp(
  `node_modules[\\\\/](${transpileModules.join('|')})([\\\\/]|$)`
);

module.exports = (_env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    entry: path.resolve(appDir, 'index.web.js'),
    output: {
      path: path.resolve(appDir, 'dist'),
      filename: 'bundle.js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      alias: {
        'react-native$': 'react-native-web',
        '@react-native-vector-icons/material-design-icons': 'react-native-vector-icons/MaterialCommunityIcons',
        '@expo/vector-icons/MaterialCommunityIcons': 'react-native-vector-icons/MaterialCommunityIcons',
      },
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.web.jsx', '.ts', '.tsx', '.js', '.jsx'],
      fallback: {
        punycode: require.resolve('punycode/'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: (modulePath) => {
            if (modulePath.includes('node_modules')) {
              return !transpileRegex.test(modulePath);
            }
            return false;
          },
          use: {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(appDir, 'babel.config.js'),
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.ttf$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProd),
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(appDir, 'web/index.html'),
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(appDir, 'dist'),
      },
      historyApiFallback: true,
      port: 8080,
      hot: true,
    },
    devtool: isProd ? 'source-map' : 'eval-source-map',
  };
};
