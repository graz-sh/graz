"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAccount, useSendTokens, useStargateSigningClient, useActiveChains } from "graz";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Send, Copy, ExternalLink, CheckCheck } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

export default function SendTokensPage() {
  const { isConnected, data: accounts } = useAccount();
  const activeChains = useActiveChains();

  const { data: signingClients } = useStargateSigningClient();
  const { sendTokens, isPending, isSuccess, isError, error, data, reset } = useSendTokens();

  const [selectedChain, setSelectedChain] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [denom, setDenom] = useState("");
  const [gasFee, setGasFee] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedChainInfo = activeChains?.find((c) => c.chainId === selectedChain);

  // Initialize selectedChain to the first connected chain
  useEffect(() => {
    if (activeChains && activeChains.length > 0 && !selectedChain) {
      const firstChain = activeChains[0];
      setSelectedChain(firstChain.chainId);
      setDenom(firstChain.currencies?.[0]?.coinMinimalDenom || "");
      setGasFee(firstChain.currencies?.[0]?.coinMinimalDenom || "");
    }
  }, [activeChains, selectedChain]);

  // Update gas fee denom when selected chain changes
  useEffect(() => {
    if (selectedChainInfo?.currencies?.[0]?.coinMinimalDenom) {
      setGasFee(selectedChainInfo.currencies[0].coinMinimalDenom);
    }
  }, [selectedChainInfo]);

  const handleSend = () => {
    if (!recipient || !amount) return;

    const signingClient = signingClients?.[selectedChain];
    const senderAddress = accounts?.[selectedChain]?.bech32Address;
    console.log("signingClient", signingClient);
    console.log("senderAddress", senderAddress);
    if (!signingClient || !senderAddress) return;

    // Reset copied state when sending new transaction
    setCopied(false);

    sendTokens({
      signingClient,
      senderAddress,
      recipientAddress: recipient,
      amount: [{ denom, amount }],
      fee: {
        amount: [{ denom: gasFee, amount: "500" }],
        gas: "200000",
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExplorerUrl = (txHash: string) => {
    // Map of chain IDs to explorer URLs
    const explorerMap: Record<string, string> = {
      "cosmoshub-4": `https://www.mintscan.io/cosmos/txs/${txHash}`,
      "osmosis-1": `https://www.mintscan.io/osmosis/txs/${txHash}`,
      "juno-1": `https://www.mintscan.io/juno/txs/${txHash}`,
      "stargaze-1": `https://www.mintscan.io/stargaze/txs/${txHash}`,
      "akashnet-2": `https://www.mintscan.io/akash/txs/${txHash}`,
    };
    return explorerMap[selectedChain] || `https://www.mintscan.io/txs/${txHash}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Send Tokens</h1>
          <p className="text-muted-foreground mt-2">
            Transfer tokens across multiple chains using{" "}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">useSendTokens()</code> hook
          </p>
        </div>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>No Wallet Connected</CardTitle>
              <CardDescription>Connect your wallet to send tokens</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                <CardTitle>Send Transaction</CardTitle>
              </div>
              <CardDescription>Transfer tokens to another address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Chain</label>
                <div className="grid grid-cols-3 gap-2">
                  {activeChains?.map((chain) => {
                    const isChainConnected = !!accounts?.[chain.chainId];
                    return (
                      <Button
                        key={chain.chainId}
                        variant={selectedChain === chain.chainId ? "default" : "outline"}
                        onClick={() => {
                          setSelectedChain(chain.chainId);
                          setDenom(chain.currencies?.[0]?.coinMinimalDenom || "");
                        }}
                        disabled={!isChainConnected}
                        className="w-full"
                      >
                        {chain.chainName}
                      </Button>
                    );
                  })}
                </div>
                {selectedChainInfo && (
                  <p className="text-xs text-muted-foreground">Chain ID: {selectedChainInfo.chainId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder={`${selectedChainInfo?.bech32Config?.bech32PrefixAccAddr || ""}1...`}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Denom</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder={selectedChainInfo?.currencies?.[0]?.coinMinimalDenom}
                    value={denom}
                    onChange={(e) => setDenom(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gas Fee Denom (Auto-selected)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
                  value={gasFee}
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground">Gas fee will be 500 {gasFee}</p>
              </div>

              {isSuccess && data && (
                <div className="space-y-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">
                      ✓ Transaction Successful
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Transaction Hash</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background px-3 py-2 rounded border break-all">
                        {data.transactionHash}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(data.transactionHash)}
                        title="Copy transaction hash"
                      >
                        {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(getExplorerUrl(data.transactionHash), "_blank")}
                        title="View in explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(data.transactionHash), "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View in Explorer
                    </Button>
                    <Button variant="outline" size="sm" onClick={reset}>
                      Send Another
                    </Button>
                  </div>
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

              <Button className="w-full" onClick={handleSend} disabled={isPending || !recipient || !amount}>
                {isPending ? "Sending..." : "Send Tokens"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hook Usage</CardTitle>
            <CardDescription>Example code for this page</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              language="typescript"
              code={`import { useSendTokens, useStargateSigningClient, useAccount } from "graz";

const { data: accounts } = useAccount();
const { data: signingClients } = useStargateSigningClient();

// All React Query mutation properties are available
const {
  sendTokens,
  isPending,
  isSuccess,
  isError,
  error,
  data,      // DeliverTxResponse with transactionHash
  reset,     // Reset mutation state
  variables, // Last mutation variables
} = useSendTokens();

// Send tokens on any connected chain
const signingClient = signingClients?.["cosmoshub-4"];
const senderAddress = accounts?.["cosmoshub-4"]?.bech32Address;

sendTokens({
  signingClient,
  senderAddress,
  recipientAddress: "cosmos1...",
  amount: [{ denom: "uatom", amount: "1000000" }],
  fee: "auto",
});

// Display transaction hash after success
if (isSuccess && data) {
  console.log("Tx hash:", data.transactionHash);
  console.log("Block height:", data.height);
  console.log("Gas used:", data.gasUsed);

  // Copy to clipboard
  navigator.clipboard.writeText(data.transactionHash);

  // Open in explorer
  window.open(\`https://mintscan.io/cosmos/txs/\${data.transactionHash}\`);
}`}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
