import "./App.css";

import { configureGraz, mainnetChains, useAccount, useActiveChain, useConnect, useDisconnect } from "graz";

import reactLogo from "./assets/react.svg";

configureGraz({
  defaultChain: mainnetChains.juno,
});

export default function App() {
  const { data: account, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const activeChain = useActiveChain();

  function handleButton() {
    (isConnected ? disconnect : connect)();
  }

  return (
    <div className="App">
      <div>
        <img src="vite.svg" className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <h1>Vite + React + Graz</h1>
      <div className="card">
        {isDisconnected && <p>Connect wallet using the button below.</p>}
        {activeChain && (
          <p>
            Current chain: <code>{activeChain.chainId}</code>
          </p>
        )}
        {account && (
          <p>
            Wallet address: <code>{account.bech32Address}</code>
          </p>
        )}
        <br />
        <button disabled={isConnecting || isReconnecting} onClick={handleButton}>
          {(isConnecting || isReconnecting) && "Connecting..."}
          {isConnected && "Disconnect Wallet"}
          {isDisconnected && "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}
