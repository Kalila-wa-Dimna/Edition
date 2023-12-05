console.log('\napplying server.webpack.config.js\n');

module.exports = {
  target: 'node',

  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
      // Add other rules as needed
    ],
  },
  plugins: [
    // Add plugins as needed
  ],
};
