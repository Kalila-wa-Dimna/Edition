console.log('\napplying client.webpack.config.js\n');

module.exports = {
  resolve: {
    alias: {
      // Aliases for any Node.js modules that should not be included in the client bundle
      canvas: false,
    },
  },
  module: {
    rules: [
      // Add other rules as needed
    ],
  },
};
