# Connect Cactus Cosmos Wallet

Cactus Cosmos is a browser-based Cosmos wallet that provides a Keplr-compatible interface for interacting with Cosmos chains. This guide shows you how to integrate Cactus Cosmos wallet into your application using Graz.

## Prerequisites

Users need to have the Cactus Cosmos wallet installed in their browser. The wallet injects a `window.cactuslink_cosmos` object that provides Keplr-compatible APIs.

## Basic Connection

To connect with Cactus Cosmos wallet, use the `useConnect` hook with `WalletType.CACTUSCOSMOS`:

```tsx
import { useConnect, WalletType } from "graz";

function ConnectButton() {
  const { connect, isLoading } = useConnect();

  const handleConnect = () => {
    connect({
      chainId: ["cosmoshub-4"],
      walletType: WalletType.CACTUSCOSMOS,
    });
  };

  return (
    <button onClick={handleConnect} disabled={isLoading}>
      {isLoading ? "Connecting..." : "Connect Cactus Cosmos"}
    </button>
  );
}
```

## Check Wallet Availability

Before showing the connect button, check if Cactus Cosmos wallet is installed:

```tsx
import { useCheckWallet, WalletType } from "graz";

function CactusCosmosConnect() {
  const { data: isCactusCosmosAvailable } = useCheckWallet(WalletType.CACTUSCOSMOS);

  if (!isCactusCosmosAvailable) {
    return (
      <div>
        <p>Cactus Cosmos wallet not detected</p>
        <a
          href="https://cactuslink.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Cactus Cosmos
        </a>
      </div>
    );
  }

  return <ConnectButton />;
}
```

## Multi-Chain Connection

Connect to multiple chains simultaneously:

```tsx
import { useConnect, WalletType } from "graz";

function MultiChainConnect() {
  const { connect } = useConnect();

  const handleConnect = () => {
    connect({
      chainId: ["cosmoshub-4", "osmosis-1", "juno-1"],
      walletType: WalletType.CACTUSCOSMOS,
    });
  };

  return <button onClick={handleConnect}>Connect to Multiple Chains</button>;
}
```

## Account Change Detection

Cactus Cosmos emits `accountsChanged` events when the user switches accounts. Graz automatically handles these events and triggers a reconnection:

```tsx
import { useAccount, useActiveWalletType } from "graz";

function AccountInfo() {
  const { data: accounts, isConnected } = useAccount();
  const { walletType } = useActiveWalletType();

  if (!isConnected || walletType !== "cactuscosmos") {
    return null;
  }

  return (
    <div>
      <h3>Connected Accounts</h3>
      {Object.entries(accounts || {}).map(([chainId, account]) => (
        <div key={chainId}>
          <p>Chain: {chainId}</p>
          <p>Address: {account.bech32Address}</p>
        </div>
      ))}
    </div>
  );
}
```

## Complete Example

Here's a complete example that includes wallet detection, connection, and account display:

```tsx
import {
  useAccount,
  useConnect,
  useCheckWallet,
  useDisconnect,
  WalletType
} from "graz";

function CactusCosmosWalletDemo() {
  const { data: isCactusCosmosAvailable } = useCheckWallet(WalletType.CACTUSCOSMOS);
  const { connect, isLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: accounts, isConnected } = useAccount();

  const handleConnect = () => {
    connect({
      chainId: ["cosmoshub-4", "osmosis-1"],
      walletType: WalletType.CACTUSCOSMOS,
    });
  };

  if (!isCactusCosmosAvailable) {
    return (
      <div className="card">
        <h2>Cactus Cosmos Not Detected</h2>
        <p>Please install Cactus Cosmos wallet to continue.</p>
        <a
          href="https://cactuslink.io"
          target="_blank"
          rel="noopener noreferrer"
          className="button"
        >
          Install Cactus Cosmos
        </a>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="card">
        <h2>Connected to Cactus Cosmos</h2>
        <div className="accounts">
          {Object.entries(accounts || {}).map(([chainId, account]) => (
            <div key={chainId} className="account-item">
              <strong>{chainId}</strong>
              <p>{account.bech32Address}</p>
            </div>
          ))}
        </div>
        <button onClick={() => disconnect()} className="button-secondary">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Connect Cactus Cosmos</h2>
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="button"
      >
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </button>
    </div>
  );
}
```

## Features

Cactus Cosmos wallet integration includes:

- ✅ Keplr-compatible API
- ✅ Multi-chain support
- ✅ Automatic account change detection
- ✅ Offline signer support (both Amino and Direct)
- ✅ Sign arbitrary data
- ✅ Transaction signing

## API Reference

### WalletType

Use `WalletType.CACTUSCOSMOS` to specify Cactus Cosmos wallet:

```tsx
import { WalletType } from "graz";

// In useConnect
connect({
  chainId: ["cosmoshub-4"],
  walletType: WalletType.CACTUSCOSMOS
});

// In useCheckWallet
const { data: isAvailable } = useCheckWallet(WalletType.CACTUSCOSMOS);
```

## Notes

- Cactus Cosmos provides a Keplr-compatible interface, making it easy to integrate
- The wallet automatically handles chain switching through the browser extension
- Account changes trigger automatic reconnection in Graz
- Supports both Amino and Direct signing modes

## See Also

- [Connect Specific Wallet](./connect-specific-wallet.md)
- [WalletType](../types/walletType.md)
- [useConnect](../hooks/useConnect.md)
- [useCheckWallet](../hooks/useCheckWallet.md)
