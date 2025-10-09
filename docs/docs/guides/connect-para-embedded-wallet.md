# Integrating Para Embedded Wallet with Graz

Para is a wallet connector that enables seamless integration with Cosmos-based chains in your Graz-powered application. This guide shows how to enable Para support, including the modal for user authentication and wallet selection.

**Note:** Para type definitions are re-exported by `graz` for convenience. You need to install both `@getpara/react-sdk-lite` (for the SDK) and `@getpara/graz-integration` (for the connector implementation). The `connectorClass` property is **required** in your `ParaGrazConfig`.

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

**Add postinstall script** to your `package.json` to stub out unused packages from react-sdk-lite:

```json
{
  "scripts": {
    "postinstall": "npx setup-para",
    "dev": "next dev",
    "build": "next build"
  }
}
```

Then run `npm install` (or `pnpm install`) to install dependencies and run the postinstall script.

## Step 2: Import Para Styles

Import Para styles in your global CSS file (e.g., `app/globals.css`):

```css
@import "@getpara/react-sdk-lite/styles.css";

/* Your other styles... */
```

## Step 3: Configure GrazProvider

Set up your provider with Para integration. In your provider file (e.g., `app/providers.tsx`):

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, type ParaGrazConfig } from "graz";
import { ParaGrazConnector } from "@getpara/graz-integration";
import ParaWeb, { Environment } from "@getpara/react-sdk-lite";
import { useState, useMemo } from "react";
import { cosmoshub } from "graz/chains"; // Example chain

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Initialize Para if API key is provided
  const para = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_PARA_API_KEY;
    if (!apiKey) {
      console.info("Para: No API key provided. Get one at https://developer.getpara.com");
      return null;
    }
    return new ParaWeb(Environment.BETA, apiKey);
  }, []);

  const paraConfig: ParaGrazConfig | undefined = useMemo(
    () =>
      para
        ? {
            paraWeb: para,
            connectorClass: ParaGrazConnector,
            modalProps: { appName: "Your App Name" },
            queryClient: queryClient,
          }
        : undefined,
    [para, queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub],
          paraConfig,
        }}
      >
        {children}
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

Then wrap your app with the provider in your root layout (e.g., `app/layout.tsx`):

```tsx
import { Providers } from "./providers";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Step 4: Set Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
```

Get your API key from [developer.getpara.com](https://developer.getpara.com).

## Step 5: Connect and Use Para Wallet

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

- `ParaGrazConfig` **requires** a `connectorClass` property - you must pass `ParaGrazConnector` explicitly
- Types like `ParaWeb` are sourced from `@getpara/web-sdk` but re-exported by `graz` for convenience
- The connector implementation must be provided by you, enabling tree-shaking and reducing bundle size if Para is not used
- This approach eliminates dynamic import issues and provides better error messages

## Runtime Dependencies

For Para wallet functionality, you need these packages installed:

- **`@getpara/react-sdk-lite`** - Para's React SDK with UI components and `ParaWeb` client
- **`@getpara/graz-integration`** - Para connector implementation (`ParaGrazConnector`)

The Para connector is explicitly provided via `paraConfig.connectorClass`, so if you don't use Para, these packages won't be included in your bundle.

## Benefits of the New Approach

The current implementation requires you to explicitly provide the `connectorClass`, which offers several advantages:

- **🚀 Better Performance**: No runtime dynamic imports, faster initialization
- **🔧 Clearer Errors**: Specific error messages when `connectorClass` is missing
- **📦 Tree Shaking**: Unused Para packages are automatically excluded from your bundle
- **🐛 Easier Debugging**: Direct imports are easier to trace and debug
- **⚡ No Module Resolution Issues**: Eliminates pnpm/Node.js import resolution problems
- **🎯 Type Safety**: Required `connectorClass` prevents runtime errors

## Troubleshooting

### "Para connector class not provided" Error

Ensure you pass `connectorClass: ParaGrazConnector` in your `paraConfig`. This is now required:

```tsx
const paraConfig: ParaGrazConfig = {
  paraWeb: para,
  connectorClass: ParaGrazConnector, // ✅ Required
  // ...
};
```

### Chunk Loading Errors (Next.js)

If you see errors about loading chunks:

1. Ensure `graz` is in `transpilePackages` in `next.config.js`:

   ```js
   transpilePackages: ["graz"];
   ```

2. **Restart your Next.js dev server** after making config changes

3. Clear Next.js cache if issues persist:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Module Not Found Errors

- `Cannot find module '@getpara/react-sdk-lite'` → Install: `npm install @getpara/react-sdk-lite`
- `Cannot find module '@getpara/graz-integration'` → Install: `npm install @getpara/graz-integration`
- Run `npx setup-para` after installing packages

**Note:** With the new approach, you no longer need to worry about dynamic import resolution issues that were common with the previous implementation.

### Type Errors

- Import types from `graz`: `import { type ParaGrazConfig } from "graz"`
- Import connector from `@getpara/graz-integration`: `import { ParaGrazConnector } from "@getpara/graz-integration"`

### Modal Styling Not Appearing

Import Para styles in your global CSS:

```css
@import "@getpara/react-sdk-lite/styles.css";
```

### Other Issues

- **Chain Mismatch:** Verify chains in `GrazProvider` match your Para project settings
- **API Key Issues:** Check that `NEXT_PUBLIC_PARA_API_KEY` is set in `.env.local`
- **Authentication Issues:** Check browser console for Para-specific messages
- **Need Help?** Visit [developer.getpara.com](https://developer.getpara.com) for support

For advanced customization, refer to the Para Docs at [docs.getpara.com](https://docs.getpara.com/v2/react/).
