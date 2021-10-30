const webpack = require('webpack');
const path = require('path');
const version = require('./package.json').version;

// Custom webpack rules
const rules = [
  // { test: /\.ts$/, loader: 'ts-loader' },
  {
    test: /\.js$/,
    loader: 'source-map-loader',
    exclude: path.resolve(__dirname, 'node_modules'),
  },
  { test: /\.css$/, use: ['style-loader', 'css-loader'] },
  { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader' }
];

// Packages that shouldn't be bundled but loaded at runtime
const externals = ['@jupyter-widgets/base'];

const resolve = {
  // Add '.ts' and '.tsx' as resolvable extensions.
  extensions: ['.webpack.js', '.web.js', '.js'],
};

const plugins =  [
  new webpack.ProvidePlugin({
         process: 'process/browser',
  }),
];

module.exports = [
  /**
   * Notebook extension
   *
   * This bundle only contains the part of the JavaScript that is run on load of
   * the notebook.
   */
  {
    entry: './lib/extension.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'ipyflex', 'nbextension'),
      libraryTarget: 'amd',
      publicPath: '',
    },
    module: {
      rules: rules,
    },
    // devtool: 'source-map',
    externals,
    resolve,
    plugins
  },

  /**
   * Embeddable ipyflex bundle
   *
   * This bundle is almost identical to the notebook extension bundle. The only
   * difference is in the configuration of the webpack public path for the
   * static assets.
   *
   * The target bundle is always `dist/index.js`, which is the path required by
   * the custom widget embedder.
   */
  {
    entry: './lib/index.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'amd',
      library: 'ipyflex',
      publicPath: 'https://unpkg.com/ipyflex@' + version + '/dist/',
    },
    devtool: 'source-map',
    module: {
      rules: rules,
    },
    externals,
    resolve,
    plugins
  },

  /**
   * Documentation widget bundle
   *
   * This bundle is used to embed widgets in the package documentation.
   */
  {
    entry: './lib/index.js',
    output: {
      filename: 'embed-bundle.js',
      path: path.resolve(__dirname, 'docs', 'source', '_static'),
      library: 'ipyflex',
      libraryTarget: 'amd',
    },
    module: {
      rules: rules,
    },
    devtool: 'source-map',
    externals,
    resolve,
    plugins
  },
];
