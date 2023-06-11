const path = require("path");

exports.onCreateWebpackConfig = ({ actions, stage, loaders }:any) => {
  const config: any = {
    resolve: {
      modules: [path.resolve(__dirname, "src"), "node_modules"],
    },
  };
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /mapbox-gl/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
  
  actions.setWebpackConfig(config);
};
