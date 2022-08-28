// @ts-check

const { getTsconfigPath } = require("@grikomsn/style-guide/eslint/helpers");

/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    require.resolve("@grikomsn/style-guide/eslint/base"),
    require.resolve("@grikomsn/style-guide/eslint/react"),
    require.resolve("@grikomsn/style-guide/eslint/typescript"),
  ],
  ignorePatterns: ["dist/**"],
  parserOptions: {
    project: getTsconfigPath(),
  },
  overrides: [
    {
      files: ["tsup.config.{js,ts}"],
      rules: {
        "import/no-default-export": ["off"],
      },
    },
  ],
  root: true,
};

module.exports = eslintConfig;
