# Integrating Para Embedded Wallet with Graz

Para is a wallet connector that enables seamless integration with Cosmos-based chains in your Graz-powered application. This guide shows how to enable Para support, including the modal for user authentication and wallet selection.

**Note:** Para type definitions are now built into `graz`. You only need to install `@getpara/react-sdk-lite` for the runtime functionality and UI components.

## Prerequisites

- A Graz project set up with React and `@tanstack/react-query`.
- Access to a Para API key (sign up at [developer.getpara.com](https://developer.getpara.com)).
- Enabled Cosmos network in you Para project settings
- Familiarity with Graz hooks like `useAccount` and `useConnect`.

## Step 1: Install Dependencies

Install the required packages:

```bash
npm install graz @getpara/react-sdk-lite @tanstack/react-query
```

**Note:** Para types (`ParaGrazConfig`, `ParaWeb`, etc.) are now included in the `graz` package. You no longer need to install `@getpara/graz-connector` or `@getpara/graz-integration` separately for type definitions.

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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { cosmoshub } from "graz/chains"; // Example chain; adjust as needed
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

const paraConfig: ParaGrazConfig = {
  paraWeb: para,
  modalProps: { appName: "Your App Name" }, // Customize modal appearance. Learn more at https://docs.getpara.com/v2/react/guides/customization/modal
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

**Note:** Para type definitions (`ParaGrazConfig`, `ParaWeb`, `ParaWallet`, `ParaGrazConnector`) are now included directly in the `graz` package. You don't need any additional packages for type support.

Import Para types directly from `graz`:

```typescript
import { type ParaGrazConfig, type ParaWeb, type ParaWallet, type ParaModalProps, type ParaGrazConnector } from "graz";
```

## Runtime Dependencies

For the actual Para wallet functionality, you need:

- `@getpara/react-sdk-lite` - Para's React SDK with UI components

The runtime packages are loaded dynamically when needed, so if you're not using Para wallet, there's no bundle impact.

## Troubleshooting

- **Module Not Found Errors:** If you see "Cannot find module '@getpara/react-sdk-lite'" and you want to use Para, install it with `npm install @getpara/react-sdk-lite`.
- **Type Errors:** Para types are now included in `graz`. Simply import them: `import { type ParaGrazConfig } from "graz"`.
- **Modal Styling Not Appearing:** Ensure `@getpara/react-sdk-lite/styles.css` is imported globally.
- **Chain Mismatch:** Verify chains in `GrazProvider` match your app's requirements.
- **Errors:** Check console for Para-specific messages (e.g., auth issues). Visit [developer.getpara.com](https://developer.getpara.com) for API config.

For advanced customization, refer to the Para Docs at [docs.getpara.com](https://docs.getpara.com/v2/react/).
