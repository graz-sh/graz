import { execFileSync } from "node:child_process";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

const packageRoot = path.resolve(__dirname, "../..");
const pnpmBin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const expectedRuntimeExports = [
  "GrazEvents",
  "GrazProvider",
  "LOG_CATEGORIES",
  "LOG_FUNCTIONS",
  "LOG_HOOKS",
  "LogCategory",
  "LogLevel",
  "WALLET_TYPES",
  "WalletType",
  "addChain",
  "checkWallet",
  "clearRecentChain",
  "clearSession",
  "configureGraz",
  "configureLogger",
  "connect",
  "defineChainInfo",
  "defineChains",
  "disconnect",
  "executeContract",
  "getAvailableWallets",
  "getCactusCosmos",
  "getChainInfo",
  "getChainInfos",
  "getCosmostation",
  "getKeplr",
  "getLogger",
  "getOfflineSigners",
  "getOkx",
  "getPara",
  "getQueryRaw",
  "getQuerySmart",
  "getRecentChainIds",
  "getRecentChains",
  "getVectis",
  "getWCCosmostation",
  "getWCKeplr",
  "getWallet",
  "getWalletConnect",
  "instantiateContract",
  "isPara",
  "isWalletConnect",
  "reconnect",
  "sendIbcTokens",
  "sendTokens",
  "signAndBroadcast",
  "signArbitrary",
  "subscribeWalletEvents",
  "suggestChain",
  "suggestChainAndConnect",
  "useAccount",
  "useActiveChainCurrency",
  "useActiveChainIds",
  "useActiveChains",
  "useActiveWalletType",
  "useAddChain",
  "useBalance",
  "useBalanceStaked",
  "useBalances",
  "useChainInfo",
  "useChainInfos",
  "useCheckWallet",
  "useConnect",
  "useCosmWasmClient",
  "useCosmWasmSigningClient",
  "useDisconnect",
  "useExecuteContract",
  "useGrazEvents",
  "useInstantiateContract",
  "useOfflineSigners",
  "useQueryClientValidators",
  "useQueryRaw",
  "useQuerySmart",
  "useRecentChainIds",
  "useRecentChains",
  "useSendIbcTokens",
  "useSendTokens",
  "useSignAndBroadcast",
  "useSignArbitrary",
  "useStargateClient",
  "useStargateSigningClient",
  "useSuggestChain",
  "useSuggestChainAndConnect",
  "useVerifyArbitrary",
  "useWalletEvents",
  "verifyArbitrary",
];

const runNode = (code: string) =>
  execFileSync(process.execPath, ["-e", code], {
    cwd: packageRoot,
    encoding: "utf-8",
  });

describe("published package runtime shape", () => {
  beforeAll(() => {
    execFileSync(pnpmBin, ["build"], {
      cwd: packageRoot,
      encoding: "utf-8",
    });
  }, 120_000);

  it("loads the CJS entry and preserves the complete runtime API", () => {
    const output = runNode(`
      const graz = require("./dist/index.js");
      if ("disconnectWithReason" in graz) throw new Error("Internal disconnect helper was exported");
      console.log(JSON.stringify(Object.keys(graz).sort()));
    `);

    expect(JSON.parse(output)).toEqual(expectedRuntimeExports);
  });

  it("loads the ESM entry and preserves the complete runtime API", () => {
    const output = runNode(`
      (async () => {
        const graz = await import("./dist/index.mjs");
        if ("disconnectWithReason" in graz) throw new Error("Internal disconnect helper was exported");
        console.log(JSON.stringify(Object.keys(graz).sort()));
      })();
    `);

    expect(JSON.parse(output)).toEqual(expectedRuntimeExports);
  });

  it("does not publish generated chain indexes", () => {
    const output = execFileSync(pnpmBin, ["pack", "--dry-run", "--json"], {
      cwd: packageRoot,
      encoding: "utf-8",
    });
    const pack = JSON.parse(output) as { files: Array<{ path: string }> };
    const files = pack.files.map((file) => file.path);

    expect(files).toContain("chains/index.js.stub");
    expect(files).toContain("chains/index.mjs.stub");
    expect(files).not.toContain("chains/index.js");
    expect(files).not.toContain("chains/index.mjs");
    expect(files).not.toContain("chains/index.ts");
  });
});
