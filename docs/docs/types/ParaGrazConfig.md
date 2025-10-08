# ParaGrazConfig

Configuration object for integrating Para embedded wallet with Graz.

## Type Definition

```typescript
interface ParaGrazConfig {
  paraWeb: ParaWeb;
  connectorClass: new (config: ParaGrazConfig, chains?: ChainInfo[] | null) => ParaGrazConnector;
  events?: ParaGrazConnectorEvents;
  noModal?: boolean;
  modalProps?: ParaModalProps;
  queryClient?: QueryClient;
}
```

## Properties

### `paraWeb` (required)

- **Type:** `ParaWeb`
- **Description:** Instance of the Para SDK client created from `@getpara/react-sdk-lite`

**Example:**

```typescript
import ParaWeb, { Environment } from "@getpara/react-sdk-lite";

const para = new ParaWeb(Environment.BETA, "your-api-key");
```

### `connectorClass` (required)

- **Type:** `new (config: ParaGrazConfig, chains?: ChainInfo[] | null) => ParaGrazConnector`
- **Description:** The Para connector class constructor. Must be provided explicitly to enable tree-shaking.

**Example:**

```typescript
import { ParaGrazConnector } from "@getpara/graz-integration";

const paraConfig: ParaGrazConfig = {
  // ...
  connectorClass: ParaGrazConnector,
};
```

:::tip Why is this required?
By requiring you to explicitly provide the connector class, Graz can avoid bundling Para dependencies when you're not using Para wallet, resulting in a smaller bundle size.
:::

### `events` (optional)

- **Type:** `ParaGrazConnectorEvents`
- **Description:** Lifecycle event callbacks for the Para connector

**Example:**

```typescript
const paraConfig: ParaGrazConfig = {
  // ...
  events: {
    onEnabled: (chainIds, connector) => {
      console.log("Para enabled for chains:", chainIds);
    },
  },
};
```

### `noModal` (optional)

- **Type:** `boolean`
- **Default:** `false`
- **Description:** If `true`, skip showing the Para modal UI for authentication

### `modalProps` (optional)

- **Type:** `ParaModalProps`
- **Description:** Customize the appearance and behavior of the Para authentication modal

**Example:**

```typescript
const paraConfig: ParaGrazConfig = {
  // ...
  modalProps: {
    appName: "My Cosmos App",
    // Additional modal customization options
  },
};
```

See [Para documentation](https://docs.getpara.com/v2/react/guides/customization/modal) for all modal customization options.

### `queryClient` (optional)

- **Type:** `QueryClient` (from `@tanstack/react-query`)
- **Description:** Share your app's QueryClient instance with Para's internal provider

**Example:**

```typescript
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const paraConfig: ParaGrazConfig = {
  // ...
  queryClient,
};
```

## Usage Example

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, type ParaGrazConfig } from "graz";
import { ParaGrazConnector } from "@getpara/graz-integration";
import ParaWeb, { Environment } from "@getpara/react-sdk-lite";

const queryClient = new QueryClient();
const para = new ParaWeb(Environment.BETA, process.env.PARA_API_KEY!);

const paraConfig: ParaGrazConfig = {
  paraWeb: para,
  connectorClass: ParaGrazConnector,
  modalProps: { appName: "My App" },
  queryClient,
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider grazOptions={{ paraConfig }}>
        {/* Your app */}
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

## Related Types

All Para types are re-exported from `graz` for convenience:

- `ParaWeb` - Para SDK client interface (from `@getpara/web-sdk`)
- `ParaGrazConnector` - Para wallet connector implementation (from `@getpara/graz-integration`)
- `ParaGrazConnectorEvents` - Connector lifecycle events
- `ParaModalProps` - Modal customization options
- `ParaWallet` - Para wallet entity interface

## See Also

- [Para Integration Guide](../guides/connect-para-embedded-wallet.md) - Complete setup instructions
- [GrazProvider](../provider/grazProvider.md) - Provider configuration
- [Para Documentation](https://docs.getpara.com) - Official Para docs
