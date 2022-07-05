![wadesta](./banner.jpg)

`wadesta` is a collection of React hooks containing everything you need to start working with the [Cosmos ecosystem](https://cosmos.network/).

## Features

- 🪝 8+ hooks for interfacing with [Keplr Wallet](https://www.keplr.app/) (connecting, view balances, etc.)
- 📚 Built-in caching, request deduplication, and all the good stuff from [`react-query`](https://react-query.tanstack.com/) and [`zustand`](https://github.com/pmndrs/zustand)
- 🔄 Auto refresh on wallet and network change
- 👏 Fully typed and tree-shakeable
- ...and many more ✨

---

**🚧 Currently in development and might not be ready for production use, expect breaking changes until we reach version 1.x 🚧**

---

## Installing

```sh
# using npm
npm install wadesta

# using yarn
yarn add wadesta
```

## Quick start

Wrap your React app with `<WadestaProvider />` and use available `wadesta` hooks anywhere:

```jsx
import { WadestaProvider } from "wadesta";

function App() {
  return (
    <WadestaProvider>
      <Wallet />
    </WadestaProvider>
  );
}
```

```jsx
import { defaultChains, useAccount, useConnect, useDisconnect } from "wadesta";

function Wallet() {
  const { connect, status } = useConnect();
  const { data: account, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  function handleConnect() {
    return isConnected ? disconnect(undefined) : connect(defaultChains.cosmos);
  }

  return (
    <div>
      {account ? `Connected to ${account.bech32Address}` : status}
      <button onClick={handleConnect}>{isConnected ? "Connect" : "Disconnect"}</button>
    </div>
  );
}
```

View an example app at https://wadesta-example.vercel.app

## API

Read more on available hooks and other imports at [API.md](./API.md).

## Maintainers

- Griko Nibras ([@grikomsn](https://github.com/grikomsn))
- Nur Fikri ([@codingki](https://github.com/codingki))

## License

[MIT License, Copyright (c) 2022 Strangelove Ventures](./LICENSE)
