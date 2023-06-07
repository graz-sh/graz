import fs from "node:fs/promises";
import path from "node:path";

import { CodeGenerator } from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export const makeRootSources = async ({
  mainnetPaths,
  testnetPaths,
}: {
  mainnetPaths: string[];
  testnetPaths: string[];
}) => {
  // eslint-disable-next-line no-param-reassign
  testnetPaths = testnetPaths.map((p) => p.replace("testnets/", ""));

  const chainsIndexStub = await fs.readFile(path.resolve(__dirname, "../../stubs/chains-index.js.stub"), "utf-8");
  const chainsIndexAst = parse(chainsIndexStub, { sourceType: "module" });

  const mainnetAstKeyvals = mainnetPaths.map((chainPath) => {
    return t.objectMethod(
      "get",
      t.stringLiteral(chainPath),
      [],
      t.blockStatement([
        t.returnStatement(t.callExpression(t.identifier("require"), [t.stringLiteral(`./${chainPath}`)])),
      ]),
    );
  });

  const testnetAstKeyvals = testnetPaths.map((chainPath) => {
    return t.objectMethod(
      "get",
      t.stringLiteral(chainPath),
      [],
      t.blockStatement([
        t.returnStatement(t.callExpression(t.identifier("require"), [t.stringLiteral(`./${chainPath}`)])),
      ]),
    );
  });

  traverse(chainsIndexAst, {
    VariableDeclarator: (current) => {
      if (t.isIdentifier(current.node.id, { name: "mainnetChains" })) {
        current.node.init = t.objectExpression(mainnetAstKeyvals.sort());
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "testnetChains" })) {
        current.node.init = t.objectExpression(testnetAstKeyvals.sort());
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "chains" })) {
        current.node.init = t.objectExpression([...mainnetAstKeyvals, ...testnetAstKeyvals].sort());
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "mainnetChainNames" })) {
        current.node.init = t.arrayExpression(mainnetPaths.map((p) => t.stringLiteral(p)));
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "testnetChainNames" })) {
        current.node.init = t.arrayExpression(testnetPaths.map((p) => t.stringLiteral(p)));
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "chainNames" })) {
        current.node.init = t.arrayExpression([...mainnetPaths, ...testnetPaths].map((p) => t.stringLiteral(p)));
        current.skip();
      }
    },
  });

  const { code: chainsIndexCode } = new CodeGenerator(chainsIndexAst).generate();
  await fs.writeFile(path.resolve(__dirname, "../../chains/index.js"), chainsIndexCode, "utf-8");

  let chainsDtsStub = await fs.readFile(path.resolve(__dirname, "../../stubs/chains-index.d.ts.stub"), "utf-8");

  // replace via string due to @babel/parser doesn't recognize `const` keyword on generics
  // todo: find a way to replace via ast
  chainsDtsStub = chainsDtsStub.replace('"REPLACE_MAINNET_CHAIN_NAME"', mainnetPaths.map((p) => `"${p}"`).join(" | "));
  chainsDtsStub = chainsDtsStub.replace('"REPLACE_TESTNET_CHAIN_NAME"', testnetPaths.map((p) => `"${p}"`).join(" | "));

  await fs.writeFile(path.resolve(__dirname, "../../chains/index.d.ts"), chainsDtsStub, "utf-8");
};
