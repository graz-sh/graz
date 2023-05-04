// @ts-check

const { extendEslint } = require("@strangelovelabs/style-guide");

module.exports = extendEslint(["browser-node", "typescript"], {
  ignorePatterns: ["node_modules"],
  root: true,
});
