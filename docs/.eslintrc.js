// @ts-check

const { extendEslint } = require("@strangelovelabs/style-guide");

module.exports = extendEslint(["browser-node", "react", "typescript"], {
  ignorePatterns: [".docusaurus", "build", "node_modules"],
  root: true,
});
