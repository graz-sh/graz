import "./App.css";

import { useAccount, useActiveChainIds, useConnect, useDisconnect, getAvailableWallets, WalletType } from "graz";

import reactLogo from "./assets/react.svg";

/**
 * Updated example showing the new multi-chain API with precise type inference.
 *
 * Key changes:
 * 1. useAccount now returns Record<chainId, Key> format
 * 2. Access account data via chainId key
 * 3. Use `as const` for precise TypeScript types
 */

// Define the chain ID as a constant for reuse and type safety
const CHAIN_ID = "cosmoshub-4";

// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions, react/function-component-definition
export default function App() {
  // ✅ NEW API: Always returns Record format, but uses generic type when chainId not specified
  const { data: accounts, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const activeChainIds = useActiveChainIds();

  // ✅ Extract account data from the Record
  // Since we don't know the chainId at compile time here, we get the first available account
  const account = accounts && Object.values(accounts)[0];

  const availableWallets = getAvailableWallets();
  const wallets = Object.entries(availableWallets)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([walletType]) => ({
      walletType: walletType as WalletType,
      name: walletType
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    }));

  const paraWallet = wallets.find((wallet) => wallet.walletType === WalletType.PARA);
  const otherWallets = wallets.filter((wallet) => wallet.walletType !== WalletType.PARA);

  return (
    <div className="App">
      <div>
        <img alt="Vite logo" className="logo" src="vite.svg" />
        <img alt="React logo" className="logo react" src={reactLogo} />
      </div>
      <h1>Vite + React + Graz</h1>
      <div className="card">
        {isDisconnected ? <p>Connect wallet using the buttons below.</p> : null}
        {activeChainIds ? (
          <p>
            Current chain: <code>{activeChainIds.join("; ")}</code>
          </p>
        ) : null}
        {account ? (
          <p>
            Wallet address: <code>{account.bech32Address}</code>
          </p>
        ) : null}
        <br />

        {isConnected ? (
          <button onClick={() => disconnect()} type="button">
            Disconnect Wallet
          </button>
        ) : (
          <>
            {paraWallet && (
              <div style={{ marginBottom: "20px" }}>
                <h3>Social Login</h3>
                <button
                  disabled={isConnecting || isReconnecting}
                  // ✅ NEW API: chainId must be an array
                  onClick={() => connect({ walletType: paraWallet.walletType, chainId: [CHAIN_ID] })}
                  type="button"
                  style={{ marginBottom: "10px", width: "100%" }}
                >
                  {isConnecting || isReconnecting ? "Connecting..." : `Connect with ${paraWallet.name}`}
                </button>
              </div>
            )}

            {otherWallets.length > 0 && (
              <div>
                <h3>Other Wallets</h3>
                {otherWallets.map((wallet) => (
                  <button
                    key={wallet.walletType}
                    disabled={isConnecting || isReconnecting}
                    // ✅ NEW API: chainId must be an array
                    onClick={() => connect({ walletType: wallet.walletType, chainId: [CHAIN_ID] })}
                    type="button"
                    style={{ marginBottom: "10px", width: "100%", display: "block" }}
                  >
                    {isConnecting || isReconnecting ? "Connecting..." : `Connect with ${wallet.name}`}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Alternative implementation with precise type inference
 */
export const GrazWithTypeSafety = () => {
  // ✅ BEST PRACTICE: Use for precise type inference
  const { data: accounts, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount({
    chainId: [CHAIN_ID]
  });
  // TypeScript now knows: accounts?: { "cosmoshub-4": Key }

  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const activeChainIds = useActiveChainIds();

  // ✅ With precise types, TypeScript knows this key exists!
  const account = accounts?.[CHAIN_ID];
  // account has type: Key | undefined (with autocomplete!)

  const handleButton = () => {
    (isConnected ? disconnect : connect)();
  };

  return (
    <div className="App">
      <div>
        <img alt="Vite logo" className="logo" src="vite.svg" />
        <img alt="React logo" className="logo react" src={reactLogo} />
      </div>
      <h1>Vite + React + Graz (Type-Safe)</h1>
      <div className="card">
        {isDisconnected ? <p>Connect wallet using the button below.</p> : null}
        {activeChainIds ? (
          <p>
            Current chain: <code>{activeChainIds.join("; ")}</code>
          </p>
        ) : null}
        {account ? (
          <p>
            Wallet address: <code>{account.bech32Address}</code>
            {/* ✅ TypeScript knows bech32Address exists! */}
          </p>
        ) : null}
        <br />
        <button disabled={isConnecting || isReconnecting} onClick={handleButton}>
          {isConnecting || isReconnecting ? "Connecting..." : null}
          {isConnected ? "Disconnect Wallet" : null}
          {isDisconnected ? "Connect Wallet" : null}
        </button>
      </div>
    </div>
  );
};
