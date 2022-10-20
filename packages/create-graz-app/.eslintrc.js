// @ts-check

const { getTsconfigPath } = require("@strangelovelabs/style-guide/eslint/helpers");

/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  extends: [
    require.resolve("@strangelovelabs/style-guide/eslint/browser-node"),
    require.resolve("@strangelovelabs/style-guide/eslint/typescript"),
  ],
  ignorePatterns: [".next", "node_modules", "out"],
  parserOptions: {
    project: getTsconfigPath(),
  },
  root: true,
};

module.exports = eslintConfig;
