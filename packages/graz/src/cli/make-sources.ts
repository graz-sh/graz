import fs from "node:fs/promises";
import path from "node:path";

import { CodeGenerator } from "@babel/generator";
import * as t from "@babel/types";
import type { ChainInfo } from "@keplr-wallet/types";

import { registryToChainInfo } from "../registry/keplr";
import type { AssetList, Chain } from "../types/registry";

export const makeSources = async (chainPath: string) => {
  const actualChainPath = chainPath.replace("testnets/", "");

  await fs.mkdir(path.resolve(__dirname, `../../chains/${actualChainPath}`), { recursive: true });

  let assetlist: AssetList;
  try {
    const assetlistContent = await fs.readFile(
      path.resolve(__dirname, `../../registry/${chainPath}/assetlist.json`),
      "utf-8",
    );
    assetlist = JSON.parse(assetlistContent) as AssetList;
  } catch {
    assetlist = {
      assets: [],
      chain_name: chainPath,
    };
  }

  /**
   * chains/[chainPath]/assetlist.js
   * ```js
   * const { defineAssetList } = require("../../dist");
   * module.exports = defineAssetList({ ... });
   * ```
   */
  const assetlistAst = t.program([
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.objectPattern([
          t.objectProperty(t.identifier("defineAssetList"), t.identifier("defineAssetList"), false, true),
        ]),
        t.callExpression(t.identifier("require"), [t.stringLiteral("../../dist")]),
      ),
    ]),
    t.expressionStatement(
      t.assignmentExpression(
        "=",
        t.memberExpression(t.identifier("module"), t.identifier("exports")),
        t.callExpression(t.identifier("defineAssetList"), [t.valueToNode(assetlist)]),
      ),
    ),
  ]);

  const { code: assetlistCode } = new CodeGenerator(assetlistAst).generate();
  await fs.writeFile(
    path.resolve(__dirname, `../../chains/${actualChainPath}/assetlist.js`),
    `/* eslint-disable */\n${assetlistCode}`,
    "utf-8",
  );

  const chainContent = await fs.readFile(path.resolve(__dirname, `../../registry/${chainPath}/chain.json`), "utf-8");
  const chain = JSON.parse(chainContent) as Chain;

  /**
   * chains/[chainPath]/chain.js
   * ```js
   * const { defineRegistryChain } = require("../../dist");
   * module.exports = defineRegistryChain({ ... });
   * ```
   */
  const chainAst = t.program([
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.objectPattern([
          t.objectProperty(t.identifier("defineRegistryChain"), t.identifier("defineRegistryChain"), false, true),
        ]),
        t.callExpression(t.identifier("require"), [t.stringLiteral("../../dist")]),
      ),
    ]),
    t.expressionStatement(
      t.assignmentExpression(
        "=",
        t.memberExpression(t.identifier("module"), t.identifier("exports")),
        t.callExpression(t.identifier("defineRegistryChain"), [t.valueToNode(chain)]),
      ),
    ),
  ]);

  const { code: chainCode } = new CodeGenerator(chainAst).generate();
  await fs.writeFile(
    path.resolve(__dirname, `../../chains/${actualChainPath}/chain.js`),
    `/* eslint-disable */\n${chainCode}`,
    "utf-8",
  );

  let chainInfo: ChainInfo | undefined;
  if (assetlist.assets.length > 0) {
    chainInfo = registryToChainInfo({ assetlist, chain });
  }

  /**
   * chains/[chainPath]/index.js
   * ```js
   * const { defineChainInfo } = require("../../dist");
   * module.exports = defineChainInfo({ ... });
   * ```
   */
  const indexAst = t.program(
    chainInfo
      ? [
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.objectPattern([
                t.objectProperty(t.identifier("defineChainInfo"), t.identifier("defineChainInfo"), false, true),
              ]),
              t.callExpression(t.identifier("require"), [t.stringLiteral("../../dist")]),
            ),
          ]),
          t.expressionStatement(
            t.assignmentExpression(
              "=",
              t.memberExpression(t.identifier("module"), t.identifier("exports")),
              t.callExpression(t.identifier("defineChainInfo"), [t.valueToNode(chainInfo)]),
            ),
          ),
        ]
      : [
          t.expressionStatement(
            t.callExpression(t.memberExpression(t.identifier("console"), t.identifier("error")), [
              t.stringLiteral(`chain info for '${chain.chain_name}' is not generated due to invalid assetlist`),
            ]),
          ),
          t.expressionStatement(
            t.assignmentExpression(
              "=",
              t.memberExpression(t.identifier("module"), t.identifier("exports")),
              t.objectExpression([]),
            ),
          ),
        ],
  );

  const { code: indexCode } = new CodeGenerator(indexAst).generate();
  await fs.writeFile(
    path.resolve(__dirname, `../../chains/${actualChainPath}/index.js`),
    `/* eslint-disable */\n${indexCode}`,
    "utf-8",
  );

  await Promise.all([
    fs.copyFile(
      path.resolve(__dirname, "../../stubs/chain-assetlist.d.ts.stub"),
      path.resolve(__dirname, `../../chains/${actualChainPath}/assetlist.d.ts`),
    ),
    fs.copyFile(
      path.resolve(__dirname, "../../stubs/chain-chain.d.ts.stub"),
      path.resolve(__dirname, `../../chains/${actualChainPath}/chain.d.ts`),
    ),
    fs.copyFile(
      path.resolve(__dirname, "../../stubs/chain-index.d.ts.stub"),
      path.resolve(__dirname, `../../chains/${actualChainPath}/index.d.ts`),
    ),
  ]);
};
