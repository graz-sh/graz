import fs from "node:fs/promises";
import path from "node:path";

import { CodeGenerator } from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

interface MakeRootSourcesArgs {
  mainnetPaths: string[];
  testnetPaths: string[];
}

export const makeRootSources = async ({ mainnetPaths, testnetPaths }: MakeRootSourcesArgs) => {
  // eslint-disable-next-line no-param-reassign
  testnetPaths = testnetPaths.map((p) => p.replace("testnets/", ""));

  await makeGeneratedJs({ mainnetPaths, testnetPaths });
  await makeGeneratedDts({ mainnetPaths, testnetPaths });
  await makeIndexJs();
  await makeIndexDts();
};

const makeGeneratedJs = async ({ mainnetPaths, testnetPaths }: MakeRootSourcesArgs) => {
  const makeGetters = ({ chainPath = "", suffix = "" }) => {
    return t.objectMethod(
      "get",
      t.stringLiteral(chainPath),
      [],
      t.blockStatement([
        t.returnStatement(
          t.memberExpression(
            t.callExpression(t.identifier("require"), [t.stringLiteral(`./${chainPath}${suffix}`)]),
            t.identifier("default"),
          ),
        ),
      ]),
    );
  };

  const chainsGeneratedStub = await fs.readFile(
    path.resolve(__dirname, "../../stubs/chains-generated.js.stub"),
    "utf-8",
  );
  const chainsGeneratedAst = parse(chainsGeneratedStub, { sourceType: "module" });

  traverse(chainsGeneratedAst, {
    VariableDeclarator: (current) => {
      if (t.isIdentifier(current.node.id, { name: "mainnetChains" })) {
        current.node.init = t.objectExpression(
          mainnetPaths.sort().map((chainPath) => makeGetters({ chainPath, suffix: "/chain" })),
        );
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "testnetChains" })) {
        current.node.init = t.objectExpression(
          testnetPaths.sort().map((chainPath) => makeGetters({ chainPath, suffix: "/chain" })),
        );
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "chains" })) {
        current.node.init = t.objectExpression(
          [...mainnetPaths, ...testnetPaths].sort().map((chainPath) => makeGetters({ chainPath, suffix: "/chain" })),
        );
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "mainnetChainInfos" })) {
        current.node.init = t.objectExpression(mainnetPaths.sort().map((chainPath) => makeGetters({ chainPath })));
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "testnetChainInfos" })) {
        current.node.init = t.objectExpression(testnetPaths.sort().map((chainPath) => makeGetters({ chainPath })));
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "chainInfos" })) {
        current.node.init = t.objectExpression(
          [...mainnetPaths, ...testnetPaths].sort().map((chainPath) => makeGetters({ chainPath })),
        );
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

  const { code: chainsGeneratedCode } = new CodeGenerator(chainsGeneratedAst).generate();
  await fs.writeFile(path.resolve(__dirname, "../../chains/generated.js"), chainsGeneratedCode, "utf-8");
};

const makeGeneratedDts = async ({ mainnetPaths, testnetPaths }: MakeRootSourcesArgs) => {
  const chainsGeneratedDtsStub = await fs.readFile(
    path.resolve(__dirname, "../../stubs/chains-generated.d.ts.stub"),
    "utf-8",
  );
  const chainsGeneratedDtsAst = parse(chainsGeneratedDtsStub, {
    sourceType: "module",
    plugins: [["typescript", { dts: true }]],
  });

  traverse(chainsGeneratedDtsAst, {
    TSTypeAliasDeclaration: (current) => {
      if (t.isIdentifier(current.node.id, { name: "MainnetChainName" })) {
        current.node.typeAnnotation = t.tsUnionType(mainnetPaths.map((p) => t.tsLiteralType(t.stringLiteral(p))));
        current.skip();
      }
      if (t.isIdentifier(current.node.id, { name: "TestnetChainName" })) {
        current.node.typeAnnotation = t.tsUnionType(testnetPaths.map((p) => t.tsLiteralType(t.stringLiteral(p))));
        current.skip();
      }
    },
  });

  const { code: chainsGeneratedDtsCode } = new CodeGenerator(chainsGeneratedDtsAst).generate();
  await fs.writeFile(path.resolve(__dirname, "../../chains/generated.d.ts"), chainsGeneratedDtsCode, "utf-8");
};

const makeIndexJs = async () => {
  await fs.copyFile(
    path.resolve(__dirname, "../../stubs/chains-index.js.stub"),
    path.resolve(__dirname, "../../chains/index.js"),
  );
};

const makeIndexDts = async () => {
  await fs.copyFile(
    path.resolve(__dirname, "../../stubs/chains-index.d.ts.stub"),
    path.resolve(__dirname, "../../chains/index.d.ts"),
  );
};
