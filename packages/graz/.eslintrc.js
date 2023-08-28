// @ts-check

const { extendEslint } = require("@graz-sh/style-guide");

module.exports = extendEslint(["browser-node", "react", "typescript", "tsup"], {
  rules: {
    "@typescript-eslint/no-non-null-assertion": "warn",
  },
  ignorePatterns: ["chains/**", "compiled/**", "dist/**"],
  root: true,
});
