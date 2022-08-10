# GrazProvider

Provider component which wraps @tanstack/react-query's QueryClientProvider and various graz side effects

#### Usage

```tsx
// example next.js application in _app.tsx
export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <GrazProvider>
      <Component {...pageProps} />
    </GrazProvider>
  );
}
```
