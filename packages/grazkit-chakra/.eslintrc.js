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
    require.resolve("@strangelovelabs/style-guide/eslint/react"),
    require.resolve("@strangelovelabs/style-guide/eslint/typescript"),
  ],
  ignorePatterns: ["chains/**", "compiled/**", "dist/**"],
  parserOptions: {
    project: getTsconfigPath(),
  },
  rules: {
    "no-console": ["warn"],
    "prefer-named-capture-group": ["warn"],
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
