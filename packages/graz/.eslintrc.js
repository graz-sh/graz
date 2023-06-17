// @ts-check

const { extendEslint } = require("@strangelovelabs/style-guide");

module.exports = extendEslint(["browser-node", "react", "typescript", "tsup"], {
  ignorePatterns: ["chains/**", "dist/**", "*_experimental/**"],
  root: true,
});
