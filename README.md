![graz](./banner.jpg)

`graz` is a collection of React hooks containing everything you need to start working with the [Cosmos ecosystem](https://cosmos.network/).

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
npm install graz

# using yarn
yarn add graz
```

## Quick start

Wrap your React app with `<GrazProvider />` and use available `graz` hooks anywhere:

```jsx
import { GrazProvider } from "graz";

function App() {
  return (
    <GrazProvider>
      <Wallet />
    </GrazProvider>
  );
}
```

```jsx
import { defaultChains, useAccount, useConnect, useDisconnect } from "graz";

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
      <button onClick={handleConnect}>{isConnected ? "Disconnect" : "Connect"}</button>
    </div>
  );
}
```

View an example app at https://graz-example.vercel.app

## API

Read more on available hooks and other imports at [API.md](./API.md).

## Maintainers

- Griko Nibras ([@grikomsn](https://github.com/grikomsn))
- Nur Fikri ([@codingki](https://github.com/codingki))

## License

[MIT License, Copyright (c) 2022 Strangelove Ventures](./LICENSE)
