// @ts-check

const { extendEslint } = require("@graz-sh/style-guide");

module.exports = extendEslint(["browser-node", "react", "typescript", "tsup"], {
  ignorePatterns: ["chains/**", "compiled/**", "dist/**"],
  root: true,
});
