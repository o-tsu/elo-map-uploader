module.exports = {
  "env": {
    "development": {
      "sourceMaps": true,
      "retainLines": true,
    }
  },
  presets: [
    '@babel/env',
    '@vue/cli-plugin-babel/preset',
    ["@vue/babel-preset-jsx", { injectH: false }],
  ],
}
