#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";

import { CodeGenerator } from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import type { ChainInfo } from "@keplr-wallet/types";
import { globby } from "globby";
import pMap from "p-map";
import tiged from "tiged";

import { registryToChainInfo } from "../registry/keplr";
import type { AssetList, Chain } from "../types/registry";

const concurrency = Math.max(1, (os.cpus() || { length: 1 }).length - 1);
const invalidSet = new Set<string>();

const generateChains = async () => {
  const src = process.env.GRAZ_REGISTRY_SRC || "github:cosmos/chain-registry";
  const emitter = tiged(src, { force: true, mode: "tar" });
  await emitter.clone("registry/");

  const mainnetPaths = await globby(["*", "!_*", "!testnets"], { cwd: "registry/", onlyDirectories: true });
  const testnetPaths = await globby(["testnets/*", "!testnets/_*"], { cwd: "registry/", onlyDirectories: true });

  await fs.rm("chains/", { recursive: true, force: true });
  await pMap([...mainnetPaths, ...testnetPaths], makeSources, { concurrency });
  await makeRootSources({ mainnetPaths, testnetPaths });
};

const makeSources = async (chainPath: string) => {
  const actualChainPath = chainPath.replace("testnets/", "");

  await fs.mkdir(`chains/${actualChainPath}`, { recursive: true });

  let assetlist: AssetList;
  try {
    const assetlistContent = await fs.readFile(`registry/${chainPath}/assetlist.json`, "utf-8");
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
  await fs.writeFile(`chains/${actualChainPath}/assetlist.js`, `/* eslint-disable */\n${assetlistCode}`, "utf-8");

  const chainContent = await fs.readFile(`registry/${chainPath}/chain.json`, "utf-8");
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
  await fs.writeFile(`chains/${actualChainPath}/chain.js`, `/* eslint-disable */\n${chainCode}`, "utf-8");

  let chainInfo: ChainInfo | undefined;
  if (assetlist.assets.length < 1) {
    invalidSet.add(chainPath);
  } else {
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
  await fs.writeFile(`chains/${actualChainPath}/index.js`, `/* eslint-disable */\n${indexCode}`, "utf-8");

  await Promise.all([
    fs.copyFile("stubs/chain-assetlist.d.ts.stub", `chains/${actualChainPath}/assetlist.d.ts`),
    fs.copyFile("stubs/chain-chain.d.ts.stub", `chains/${actualChainPath}/chain.d.ts`),
    fs.copyFile("stubs/chain-index.d.ts.stub", `chains/${actualChainPath}/index.d.ts`),
  ]);
};

const makeRootSources = async ({ mainnetPaths, testnetPaths }: { mainnetPaths: string[]; testnetPaths: string[] }) => {
  const chainsIndexStub = await fs.readFile("stubs/chains-index.js.stub", "utf-8");
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
  await fs.writeFile("chains/index.js", chainsIndexCode, "utf-8");

  const allPaths = [...mainnetPaths, ...testnetPaths];
  const normalizedPaths = allPaths.map((path) => path.replace("testnets/", ""));
  const uniquePaths = [...new Set(normalizedPaths)];

  const chainsDtsStub = await fs.readFile("stubs/chains-index.d.ts.stub", "utf-8");
  const chainsDtsAst = parse(chainsDtsStub, { sourceType: "module", plugins: [["typescript", { dts: true }]] });

  traverse(chainsDtsAst, {
    TSTypeAliasDeclaration: (current) => {
      if (t.isIdentifier(current.node.id, { name: "ChainName" })) {
        current.node.typeAnnotation = t.tsUnionType(uniquePaths.map((path) => t.tsLiteralType(t.stringLiteral(path))));
        current.stop();
      }
    },
  });

  const { code: chainsDtsCode } = new CodeGenerator(chainsDtsAst).generate();
  await fs.writeFile("chains/index.d.ts", chainsDtsCode, "utf-8");
};

void generateChains();
