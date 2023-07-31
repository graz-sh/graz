// @ts-check

const { extendEslint } = require("@graz-sh/style-guide");

module.exports = extendEslint(["browser-node", "react", "typescript"], {
  ignorePatterns: ["node_modules"],
  root: true,
});
