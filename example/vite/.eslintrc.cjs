// @ts-check

const { extendEslint } = require("@strangelovelabs/style-guide");

module.exports = extendEslint(["browser-node", "react", "typescript"], {
  ignorePatterns: ["node_modules"],
  root: true,
});
