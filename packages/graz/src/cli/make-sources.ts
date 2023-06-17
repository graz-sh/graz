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
   * chains/[chainPath]/assetlist.ts
   * ```js
   * import { defineAssetList } from "../../dist";
   * export default defineAssetList({ ... });
   * ```
   */
  const assetlistAst = t.program([
    t.importDeclaration(
      [t.importSpecifier(t.identifier("defineAssetList"), t.identifier("defineAssetList"))],
      t.stringLiteral("../../dist"),
    ),
    t.exportDefaultDeclaration(t.callExpression(t.identifier("defineAssetList"), [t.valueToNode(assetlist)])),
  ]);

  const { code: assetlistCode } = new CodeGenerator(assetlistAst).generate();
  await fs.writeFile(
    path.resolve(__dirname, `../../chains/${actualChainPath}/assetlist.ts`),
    `/* eslint-disable */\n${assetlistCode}`,
    "utf-8",
  );

  const chainContent = await fs.readFile(path.resolve(__dirname, `../../registry/${chainPath}/chain.json`), "utf-8");
  const chain = JSON.parse(chainContent) as Chain;

  /**
   * chains/[chainPath]/chain.ts
   * ```js
   * import { defineRegistryChain } from "../../dist";
   * export default defineRegistryChain({ ... });
   * ```
   */
  const chainAst = t.program([
    t.importDeclaration(
      [t.importSpecifier(t.identifier("defineRegistryChain"), t.identifier("defineRegistryChain"))],
      t.stringLiteral("../../dist"),
    ),
    t.exportDefaultDeclaration(t.callExpression(t.identifier("defineRegistryChain"), [t.valueToNode(chain)])),
  ]);

  const { code: chainCode } = new CodeGenerator(chainAst).generate();
  await fs.writeFile(
    path.resolve(__dirname, `../../chains/${actualChainPath}/chain.ts`),
    `/* eslint-disable */\n${chainCode}`,
    "utf-8",
  );

  let chainInfo: ChainInfo | undefined;
  if (assetlist.assets.length > 0) {
    chainInfo = registryToChainInfo({ assetlist, chain });
  }

  /**
   * chains/[chainPath]/index.ts
   * ```js
   * import { defineChainInfo } from "../../dist";
   * export default defineChainInfo({ ... });
   * ```
   */
  const indexAst = t.program(
    chainInfo
      ? [
          t.importDeclaration(
            [t.importSpecifier(t.identifier("defineChainInfo"), t.identifier("defineChainInfo"))],
            t.stringLiteral("../../dist"),
          ),
          t.exportDefaultDeclaration(t.callExpression(t.identifier("defineChainInfo"), [t.valueToNode(chainInfo)])),
        ]
      : [
          t.expressionStatement(
            t.callExpression(t.memberExpression(t.identifier("console"), t.identifier("error")), [
              t.stringLiteral(`chain info for '${chain.chain_name}' is not generated due to invalid assetlist`),
            ]),
          ),
          t.exportDefaultDeclaration(t.objectExpression([])),
        ],
  );

  const { code: indexCode } = new CodeGenerator(indexAst).generate();
  await fs.writeFile(
    path.resolve(__dirname, `../../chains/${actualChainPath}/index.ts`),
    `/* eslint-disable */\n${indexCode}`,
    "utf-8",
  );
};
