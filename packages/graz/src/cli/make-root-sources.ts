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
  const chainsIndexStub = await fs.readFile(path.resolve(__dirname, "../../stubs/chains-index.js.stub"), "utf-8");
  const chainsIndexAst = parse(chainsIndexStub, { sourceType: "module" });

  traverse(chainsIndexAst, {
    VariableDeclarator: (current) => {
      if (t.isIdentifier(current.node.id, { name: "mainnetChains" })) {
        current.node.init = t.objectExpression(
          mainnetPaths.map((chainPath) => {
            return t.objectMethod(
              "get",
              t.stringLiteral(chainPath),
              [],
              t.blockStatement([
                t.returnStatement(t.callExpression(t.identifier("require"), [t.stringLiteral(`./${chainPath}`)])),
              ]),
            );
          }),
        );
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "testnetChains" })) {
        current.node.init = t.objectExpression(
          testnetPaths.map((chainPath) => {
            const actualChainPath = chainPath.replace("testnets/", "");
            return t.objectMethod(
              "get",
              t.stringLiteral(actualChainPath),
              [],
              t.blockStatement([
                t.returnStatement(t.callExpression(t.identifier("require"), [t.stringLiteral(`./${actualChainPath}`)])),
              ]),
            );
          }),
        );
        current.skip();
      }
    },
  });

  const { code: chainsIndexCode } = new CodeGenerator(chainsIndexAst).generate();
  await fs.writeFile(path.resolve(__dirname, "../../chains/index.js"), chainsIndexCode, "utf-8");

  const allPaths = [...mainnetPaths, ...testnetPaths];
  const normalizedPaths = allPaths.map((p) => p.replace("testnets/", ""));
  const uniquePaths = [...new Set(normalizedPaths)];

  const chainsDtsStub = await fs.readFile(path.resolve(__dirname, "../../stubs/chains-index.d.ts.stub"), "utf-8");
  const chainsDtsAst = parse(chainsDtsStub, { sourceType: "module", plugins: [["typescript", { dts: true }]] });

  traverse(chainsDtsAst, {
    TSTypeAliasDeclaration: (current) => {
      if (t.isIdentifier(current.node.id, { name: "ChainName" })) {
        current.node.typeAnnotation = t.tsUnionType(uniquePaths.map((p) => t.tsLiteralType(t.stringLiteral(p))));
        current.stop();
      }
    },
  });

  const { code: chainsDtsCode } = new CodeGenerator(chainsDtsAst).generate();
  await fs.writeFile(path.resolve(__dirname, "../../chains/index.d.ts"), chainsDtsCode, "utf-8");
};
