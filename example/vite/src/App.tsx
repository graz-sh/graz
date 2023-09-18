import "./App.css";

import { useAccount, useActiveChainIds, useConnect, useDisconnect } from "graz";

import reactLogo from "./assets/react.svg";

// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions, react/function-component-definition
export default function App() {
  const { data: account, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const activeChainIds = useActiveChainIds();

  // eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions
  function handleButton() {
    isConnected
      ? disconnect()
      : connect({
          chainId: "cosmoshub-4",
        });
  }

  return (
    <div className="App">
      <div>
        <img alt="Vite logo" className="logo" src="vite.svg" />
        <img alt="React logo" className="logo react" src={reactLogo} />
      </div>
      <h1>Vite + React + Graz</h1>
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
          </p>
        ) : null}
        <br />
        <button disabled={isConnecting || isReconnecting} onClick={handleButton} type="button">
          {isConnecting || isReconnecting ? "Connecting..." : null}
          {isConnected ? "Disconnect Wallet" : null}
          {isDisconnected ? "Connect Wallet" : null}
        </button>
      </div>
    </div>
  );
}

export const Graz = () => {
  const { data: account, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const activeChainIds = useActiveChainIds();

  const handleButton = () => {
    (isConnected ? disconnect : connect)();
  };

  return (
    <div className="App">
      <div>
        <img alt="Vite logo" className="logo" src="vite.svg" />
        <img alt="React logo" className="logo react" src={reactLogo} />
      </div>
      <h1>Vite + React + Graz</h1>
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
