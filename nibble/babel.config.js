module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@components": "./src/components",
            "@database": "./src/database",
            "@services": "./src/services",
            "@utils": "./src/utils",
          },
        },
      ],
    ],
  };
};
