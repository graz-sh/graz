// @ts-check

const { getTsconfigPath } = require("@strangelovelabs/style-guide/eslint/helpers");

/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    require.resolve("@strangelovelabs/style-guide/eslint/base"),
    require.resolve("@strangelovelabs/style-guide/eslint/typescript"),
  ],
  ignorePatterns: [".next", "node_modules", "out"],
  parserOptions: {
    project: getTsconfigPath(),
  },
  rules: {
    "no-console": ["off"],
    "prefer-const": ["off"],
    "@typescript-eslint/no-unsafe-assignment": ["off"],
  },
  root: true,
};

module.exports = eslintConfig;
