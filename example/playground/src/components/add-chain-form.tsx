"use client";

import { useState } from "react";
import { useAddChain } from "graz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { ChainInfo } from "@keplr-wallet/types";

const defaultFormData = {
  chainId: "",
  chainName: "",
  rpc: "",
  rest: "",
  coinDenom: "",
  coinMinimalDenom: "",
  coinDecimals: "6",
  coinType: "118",
  bech32Prefix: "",
  gasPriceLow: "0.01",
  gasPriceAverage: "0.025",
  gasPriceHigh: "0.04",
};

export function AddChainForm() {
  const [formData, setFormData] = useState(defaultFormData);
  const { addChain, isLoading, isSuccess, error } = useAddChain({
    onSuccess: (chainInfo) => {
      console.log("Chain added successfully:", chainInfo);
      // Reset form after successful addition
      setTimeout(() => {
        setFormData(defaultFormData);
      }, 2000);
    },
    onError: (err) => {
      console.error("Failed to add chain:", err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chainInfo: ChainInfo = {
      chainId: formData.chainId,
      chainName: formData.chainName,
      rpc: formData.rpc,
      rest: formData.rest,
      bip44: {
        coinType: parseInt(formData.coinType),
      },
      bech32Config: {
        bech32PrefixAccAddr: formData.bech32Prefix,
        bech32PrefixAccPub: `${formData.bech32Prefix}pub`,
        bech32PrefixValAddr: `${formData.bech32Prefix}valoper`,
        bech32PrefixValPub: `${formData.bech32Prefix}valoperpub`,
        bech32PrefixConsAddr: `${formData.bech32Prefix}valcons`,
        bech32PrefixConsPub: `${formData.bech32Prefix}valconspub`,
      },
      currencies: [
        {
          coinDenom: formData.coinDenom,
          coinMinimalDenom: formData.coinMinimalDenom,
          coinDecimals: parseInt(formData.coinDecimals),
        },
      ],
      feeCurrencies: [
        {
          coinDenom: formData.coinDenom,
          coinMinimalDenom: formData.coinMinimalDenom,
          coinDecimals: parseInt(formData.coinDecimals),
          gasPriceStep: {
            low: parseFloat(formData.gasPriceLow),
            average: parseFloat(formData.gasPriceAverage),
            high: parseFloat(formData.gasPriceHigh),
          },
        },
      ],
      stakeCurrency: {
        coinDenom: formData.coinDenom,
        coinMinimalDenom: formData.coinMinimalDenom,
        coinDecimals: parseInt(formData.coinDecimals),
      },
    };

    addChain({ chainInfo });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fillExample = (example: "osmosis" | "juno" | "akash") => {
    const examples = {
      osmosis: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        rpc: "https://rpc.osmosis.zone",
        rest: "https://lcd.osmosis.zone",
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: "6",
        coinType: "118",
        bech32Prefix: "osmo",
        gasPriceLow: "0.0025",
        gasPriceAverage: "0.025",
        gasPriceHigh: "0.04",
      },
      juno: {
        chainId: "juno-1",
        chainName: "Juno",
        rpc: "https://rpc.juno.strange.love",
        rest: "https://api.juno.strange.love",
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: "6",
        coinType: "118",
        bech32Prefix: "juno",
        gasPriceLow: "0.0025",
        gasPriceAverage: "0.025",
        gasPriceHigh: "0.04",
      },
      akash: {
        chainId: "akashnet-2",
        chainName: "Akash",
        rpc: "https://rpc.akash.forbole.com",
        rest: "https://lcd.akash.forbole.com",
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: "6",
        coinType: "118",
        bech32Prefix: "akash",
        gasPriceLow: "0.025",
        gasPriceAverage: "0.025",
        gasPriceHigh: "0.04",
      },
    };

    setFormData(examples[example]);
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Custom Chain
        </CardTitle>
        <CardDescription>
          Add a new Cosmos chain to graz&apos;s internal store. This chain will be available for connection without
          suggesting it to the wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Example Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Fill Examples</label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fillExample("osmosis")}>
                Osmosis
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => fillExample("juno")}>
                Juno
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => fillExample("akash")}>
                Akash
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Basic Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="chainId" className="text-sm font-medium">
                  Chain ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="chainId"
                  name="chainId"
                  type="text"
                  placeholder="cosmoshub-4"
                  value={formData.chainId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="chainName" className="text-sm font-medium">
                  Chain Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="chainName"
                  name="chainName"
                  type="text"
                  placeholder="Cosmos Hub"
                  value={formData.chainName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="rpc" className="text-sm font-medium">
                  RPC URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="rpc"
                  name="rpc"
                  type="url"
                  placeholder="https://rpc.cosmos.network"
                  value={formData.rpc}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="rest" className="text-sm font-medium">
                  REST URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="rest"
                  name="rest"
                  type="url"
                  placeholder="https://lcd.cosmos.network"
                  value={formData.rest}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Currency Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Currency Information</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="coinDenom" className="text-sm font-medium">
                  Coin Denom <span className="text-red-500">*</span>
                </label>
                <input
                  id="coinDenom"
                  name="coinDenom"
                  type="text"
                  placeholder="ATOM"
                  value={formData.coinDenom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="coinMinimalDenom" className="text-sm font-medium">
                  Minimal Denom <span className="text-red-500">*</span>
                </label>
                <input
                  id="coinMinimalDenom"
                  name="coinMinimalDenom"
                  type="text"
                  placeholder="uatom"
                  value={formData.coinMinimalDenom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="coinDecimals" className="text-sm font-medium">
                  Decimals <span className="text-red-500">*</span>
                </label>
                <input
                  id="coinDecimals"
                  name="coinDecimals"
                  type="number"
                  min="0"
                  max="18"
                  placeholder="6"
                  value={formData.coinDecimals}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Address Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Address Configuration</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="bech32Prefix" className="text-sm font-medium">
                  Bech32 Prefix <span className="text-red-500">*</span>
                </label>
                <input
                  id="bech32Prefix"
                  name="bech32Prefix"
                  type="text"
                  placeholder="cosmos"
                  value={formData.bech32Prefix}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="coinType" className="text-sm font-medium">
                  Coin Type (BIP44) <span className="text-red-500">*</span>
                </label>
                <input
                  id="coinType"
                  name="coinType"
                  type="number"
                  placeholder="118"
                  value={formData.coinType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Gas Price Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Gas Price Steps</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="gasPriceLow" className="text-sm font-medium">
                  Low
                </label>
                <input
                  id="gasPriceLow"
                  name="gasPriceLow"
                  type="number"
                  step="0.0001"
                  placeholder="0.01"
                  value={formData.gasPriceLow}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gasPriceAverage" className="text-sm font-medium">
                  Average
                </label>
                <input
                  id="gasPriceAverage"
                  name="gasPriceAverage"
                  type="number"
                  step="0.0001"
                  placeholder="0.025"
                  value={formData.gasPriceAverage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gasPriceHigh" className="text-sm font-medium">
                  High
                </label>
                <input
                  id="gasPriceHigh"
                  name="gasPriceHigh"
                  type="number"
                  step="0.0001"
                  placeholder="0.04"
                  value={formData.gasPriceHigh}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Chain added successfully!</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm font-medium text-red-800">Failed to add chain</span>
                <p className="text-xs text-red-700 mt-1">{error.message}</p>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1 text-xs text-blue-800">
              <p className="font-medium">Note:</p>
              <p className="mt-1">
                This only adds the chain to graz&apos;s internal store. It does not suggest the chain to your wallet.
                After adding, you can connect to this chain using the{" "}
                <code className="px-1 py-0.5 bg-blue-100 rounded">useConnect</code> hook.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1 md:flex-none">
              {isLoading ? "Adding..." : "Add Chain"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setFormData(defaultFormData)} disabled={isLoading}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
