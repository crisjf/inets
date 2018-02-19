module.exports = function() {
  return {
    entry: "./index.jsx",
    output: {
      path: __dirname + "/../public",
      filename: "bundle.js"
    },
    devtool: "eval-source-map",
    module: {
      loaders: [
        {
          test: /\.jsx$/,
          loader: "babel-loader",
          query: {
            "presets": ["es2015", "react"]
          }
        }
      ]
    }
  }
};
