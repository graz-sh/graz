"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccount, useQuerySmart, useExecuteContract, useCosmWasmSigningClient } from "graz";
import { CodeBlock } from "@/components/code-block";
import { useState } from "react";
import { FileCode, Play } from "lucide-react";
import { chains } from "@/utils/graz";

export default function ContractsPage() {
  const { isConnected, data: accounts } = useAccount();
  const { data: signingClients } = useCosmWasmSigningClient();
  const [selectedChain, setSelectedChain] = useState("neutron-1");
  const [contractAddress, setContractAddress] = useState("");
  const [queryMsg, setQueryMsg] = useState('{"get_config":{}}');
  const [executeMsg, setExecuteMsg] = useState('{"increment":{}}');

  const {
    data: queryResult,
    refetch: executeQuery,
    isLoading: isQuerying,
    error: queryError,
  } = useQuerySmart({
    address: contractAddress,
    queryMsg: queryMsg ? JSON.parse(queryMsg) : {},
  });

  const {
    executeContract,
    isPending,
    isSuccess,
    isError,
    error,
    data: executeResult,
    reset,
  } = useExecuteContract({
    contractAddress: contractAddress || "",
  });

  const handleExecute = () => {
    if (!contractAddress || !executeMsg) return;

    const signingClient = signingClients?.[selectedChain];
    const senderAddress = accounts?.[selectedChain]?.bech32Address;

    if (!signingClient || !senderAddress) return;

    executeContract({
      signingClient,
      senderAddress,
      msg: JSON.parse(executeMsg),
      fee: "auto",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Contracts</h1>
          <p className="text-muted-foreground mt-2">
            Interact with CosmWasm contracts across chains using{" "}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">useQuerySmart()</code> and{" "}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">useExecuteContract()</code>
          </p>
        </div>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>No Wallet Connected</CardTitle>
              <CardDescription>Connect your wallet to interact with contracts</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Select Chain</CardTitle>
                <CardDescription>Choose which chain to interact with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {chains.map((chain) => {
                    const isChainConnected = !!accounts?.[chain.chainId];
                    return (
                      <Button
                        key={chain.chainId}
                        variant={selectedChain === chain.chainId ? "default" : "outline"}
                        onClick={() => setSelectedChain(chain.chainId)}
                        disabled={!isChainConnected}
                        className="w-full"
                      >
                        {chain.chainName}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  <CardTitle>Query Contract</CardTitle>
                </div>
                <CardDescription>
                  Read data from a smart contract on {chains.find((c) => c.chainId === selectedChain)?.chainName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contract Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
                    placeholder={`${chains.find((c) => c.chainId === selectedChain)?.bech32Config.bech32PrefixAccAddr}1...`}
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Query Message (JSON)</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md bg-background font-mono text-xs"
                    rows={4}
                    value={queryMsg}
                    onChange={(e) => setQueryMsg(e.target.value)}
                  />
                </div>

                {queryResult ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Result</label>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto font-mono">
                      {JSON.stringify(queryResult as Record<string, unknown>, null, 2)}
                    </pre>
                  </div>
                ) : null}

                {queryError ? (
                  <Badge variant="destructive" className="w-full justify-center py-2">
                    Error: {(queryError as Error).message}
                  </Badge>
                ) : null}

                <Button onClick={() => executeQuery()} disabled={isQuerying || !contractAddress} className="w-full">
                  {isQuerying ? "Querying..." : "Query Contract"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  <CardTitle>Execute Contract</CardTitle>
                </div>
                <CardDescription>
                  Send a transaction to modify contract state on{" "}
                  {chains.find((c) => c.chainId === selectedChain)?.chainName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contract Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
                    placeholder={`${chains.find((c) => c.chainId === selectedChain)?.bech32Config.bech32PrefixAccAddr}1...`}
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Execute Message (JSON)</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md bg-background font-mono text-xs"
                    rows={4}
                    value={executeMsg}
                    onChange={(e) => setExecuteMsg(e.target.value)}
                  />
                </div>

                {isSuccess && executeResult && (
                  <div className="space-y-2">
                    <Badge variant="default" className="w-full justify-center py-2">
                      ✓ Execution successful!
                    </Badge>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Tx Hash: <code className="text-xs">{executeResult.transactionHash}</code>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Height: {executeResult.height} | Gas Used: {executeResult.gasUsed}
                      </p>
                    </div>
                    {executeResult.logs && executeResult.logs.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Logs</label>
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto font-mono max-h-40">
                          {JSON.stringify(executeResult.logs, null, 2)}
                        </pre>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={reset} className="w-full">
                      Reset
                    </Button>
                  </div>
                )}

                {isError && error && (
                  <div className="space-y-2">
                    <Badge variant="destructive" className="w-full justify-center py-2">
                      Error: {error.message}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={reset} className="w-full">
                      Try Again
                    </Button>
                  </div>
                )}

                <Button onClick={handleExecute} disabled={isPending || !contractAddress} className="w-full">
                  {isPending ? "Executing..." : "Execute Contract"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hook Usage</CardTitle>
            <CardDescription>Example code for this page</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`import {
  useQuerySmart,
  useExecuteContract,
  useAccount,
  useCosmWasmSigningClient
} from "graz";

const { data: accounts } = useAccount();
const { data: signingClients } = useCosmWasmSigningClient();

// Query contract (read-only, no wallet needed)
const { data, refetch, isLoading, error } = useQuerySmart({
  address: contractAddress,
  queryMsg: { get_config: {} },
});

// Execute contract (requires wallet and signing)
// Now returns all React Query mutation properties!
const {
  executeContract,
  isPending,
  isSuccess,
  isError,
  error: executeError,
  data: result,      // ExecuteResult with transactionHash, logs, etc.
  reset,             // Reset mutation state
  variables,         // Last execution parameters
} = useExecuteContract({ contractAddress });

const signingClient = signingClients?.["neutron-1"];
const senderAddress = accounts?.["neutron-1"]?.bech32Address;

executeContract({
  signingClient,
  senderAddress, // Required
  msg: { increment: {} },
  fee: "auto",
});

// Access execution result
if (isSuccess && result) {
  console.log("Tx hash:", result.transactionHash);
  console.log("Gas used:", result.gasUsed);
  console.log("Logs:", result.logs);
}`}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
