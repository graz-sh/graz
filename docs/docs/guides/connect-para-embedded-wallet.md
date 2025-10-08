# Integrating Para Embedded Wallet with Graz

Para is a wallet connector that enables seamless integration with Cosmos-based chains in your Graz-powered application. This guide shows how to enable Para support, including the modal for user authentication and wallet selection.

**Note:** Para type definitions are re-exported by `graz` for convenience. You need to install both `@getpara/react-sdk-lite` (for the SDK) and `@getpara/graz-integration` (for the connector implementation).

## Prerequisites

- A Graz project set up with React and `@tanstack/react-query`.
- Access to a Para API key (sign up at [developer.getpara.com](https://developer.getpara.com)).
- Enabled Cosmos network in you Para project settings
- Familiarity with Graz hooks like `useAccount` and `useConnect`.

## Step 1: Install Dependencies

Install the required packages:

```bash
npm install graz @getpara/react-sdk-lite @getpara/graz-integration @tanstack/react-query
```

**Package breakdown:**

- `graz` - Core library with Para type definitions re-exported
- `@getpara/react-sdk-lite` - Para SDK with UI components and ParaWeb client
- `@getpara/graz-integration` - Para connector implementation (`ParaGrazConnector`)
- `@tanstack/react-query` - Required for state management

Add a postinstall script to your `package.json` to stub out unused packages from react-sdk-lite:

```json
{
  "scripts": {
    "postinstall": "npx setup-para"
  }
}
```

Ensure Graz peer dependencies (e.g., `@cosmjs/*`) are already installed.

## Step 2: Create a ParaWeb Client

Create a ParaWeb instance using your API key and environment. Place this in a utility file (e.g., `lib/para/client.ts`):

```typescript
import ParaWeb, { Environment } from "@getpara/react-sdk-lite";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY; // Set in .env
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("Para API key is required.");
}

export const para = new ParaWeb(Environment.BETA, API_KEY);
```

## Step 3: Configure GrazProvider

Wrap your app with `QueryClientProvider` and `GrazProvider`. Pass a `paraConfig` object to `GrazProvider` with your ParaWeb instance, modal props, and a shared QueryClient.

In your provider context (e.g., `context/Provider.tsx`):

```tsx
"use client";

import { para } from "@/lib/para/client"; // From Step 2
import { type ParaGrazConfig } from "graz"; // Import Para types from graz
import { ParaGrazConnector } from "@getpara/graz-integration"; // Import connector from graz-integration
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { cosmoshub } from "graz/chains"; // Example chain; adjust as needed
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

const paraConfig: ParaGrazConfig = {
  paraWeb: para,
  connectorClass: ParaGrazConnector, // Required: Pass the connector class
  modalProps: { appName: "Your App Name" }, // Customize modal appearance
  queryClient, // Share with the internal ParaProvider
};

export const Provider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub], // Add your chains
          paraConfig,
        }}
      >
        {children}
      </GrazProvider>
    </QueryClientProvider>
  );
};
```

Wrap your root layout or app entry with this `Provider` (e.g., in `app/layout.tsx`):

```tsx
import { Provider } from "@/context/Provider";
// ... other imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
```

## Step 4: Connect and Use Para Wallet

Use Graz hooks to connect. Para will appear as an option (WalletType.PARA internally). The modal handles login and wallet selection.

Example in a header component:

```tsx
"use client";

import { useAccount, useConnect, WalletType } from "graz";

export default function Header() {
  const { data: accounts, isConnected } = useAccount({
    chainId: ["cosmoshub-4"], // Use your configured chain
  });
  const { connect } = useConnect();

  // Extract account for the specific chain
  const account = accounts?.["cosmoshub-4"];

  const handleConnect = () => {
    connect({
      chainId: ["cosmoshub-4"],
      walletType: WalletType.PARA,
    }); // Triggers Para modal if needed
  };

  return (
    <header>
      {isConnected && account ? (
        <button>
          Connected: {account.bech32Address.slice(0, 12)}...{account.bech32Address.slice(-6)}
        </button>
      ) : (
        <button onClick={handleConnect}>Connect Para Wallet</button>
      )}
    </header>
  );
}
```

## Type Definitions

Para type definitions are re-exported from `graz` for convenience, while the connector implementation comes from `@getpara/graz-integration`.

**Import types from `graz`:**

```typescript
import { type ParaGrazConfig, type ParaWeb, type ParaWallet, type ParaModalProps } from "graz";
```

**Import connector from `@getpara/graz-integration`:**

```typescript
import { ParaGrazConnector } from "@getpara/graz-integration";
```

**Important Notes:**

- `ParaGrazConfig` now requires a `connectorClass` property - you must pass `ParaGrazConnector` explicitly
- Types like `ParaWeb` are sourced from `@getpara/web-sdk` but re-exported by `graz` for convenience
- The connector implementation must be provided by you, enabling tree-shaking and reducing bundle size if Para is not used

## Runtime Dependencies

For Para wallet functionality, you need these packages installed:

- **`@getpara/react-sdk-lite`** - Para's React SDK with UI components and `ParaWeb` client
- **`@getpara/graz-integration`** - Para connector implementation (`ParaGrazConnector`)

The Para connector is explicitly provided via `paraConfig.connectorClass`, so if you don't use Para, these packages won't be included in your bundle.

## Troubleshooting

- **"Para connector class not provided" Error:** Ensure you pass `connectorClass: ParaGrazConnector` in your `paraConfig`. This is now required.
- **Module Not Found Errors:**
  - If you see "Cannot find module '@getpara/react-sdk-lite'", install it: `npm install @getpara/react-sdk-lite`
  - If you see "Cannot find module '@getpara/graz-integration'", install it: `npm install @getpara/graz-integration`
- **Type Errors:**
  - Import types from `graz`: `import { type ParaGrazConfig } from "graz"`
  - Import connector from `@getpara/graz-integration`: `import { ParaGrazConnector } from "@getpara/graz-integration"`
- **Modal Styling Not Appearing:** Import Para styles globally: `import "@getpara/react-sdk-lite/styles.css"`
- **Chain Mismatch:** Verify chains in `GrazProvider` match your Para project settings.
- **Authentication Issues:** Check console for Para-specific messages. Visit [developer.getpara.com](https://developer.getpara.com) for API configuration.

For advanced customization, refer to the Para Docs at [docs.getpara.com](https://docs.getpara.com/v2/react/).
