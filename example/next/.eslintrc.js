// @ts-check

const { extendEslint } = require("@strangelovelabs/style-guide");

module.exports = extendEslint(["browser-node", "react", "next", "typescript"], {
  ignorePatterns: [".next", "node_modules", "out"],
  root: true,
});
