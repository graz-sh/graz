# WalletConnectStore

Object to pass into your `GrazProvider.walletConnect`

```ts
interface WalletConnectStore {
  options: {
    projectId?: string;
    name?: string;
    ...SignClientTypes.Options
  } | null;
  web3Modal?: {
    themeMode?: 'dark' | 'light'
    privacyPolicyUrl?: string
    termsOfServiceUrl?: string
    themeVariables?: {
      '--w3m-z-index'?: string;
        '--w3m-accent-color'?: string;
        '--w3m-accent-fill-color'?: string;
        '--w3m-background-color'?: string;
        '--w3m-background-image-url'?: string;
        '--w3m-logo-image-url'?: string;
        '--w3m-background-border-radius'?: string;
        '--w3m-container-border-radius'?: string;
        '--w3m-wallet-icon-border-radius'?: string;
        '--w3m-wallet-icon-large-border-radius'?: string;
        '--w3m-wallet-icon-small-border-radius'?: string;
        '--w3m-input-border-radius'?: string;
        '--w3m-notification-border-radius'?: string;
        '--w3m-button-border-radius'?: string;
        '--w3m-secondary-button-border-radius'?: string;
        '--w3m-icon-button-border-radius'?: string;
        '--w3m-button-hover-highlight-border-radius'?: string;
        '--w3m-font-family'?: string;
        '--w3m-text-big-bold-size'?: string;
        '--w3m-text-big-bold-weight'?: string;
        '--w3m-text-big-bold-line-height'?: string;
        '--w3m-text-big-bold-letter-spacing'?: string;
        '--w3m-text-big-bold-text-transform'?: string;
        '--w3m-text-big-bold-font-family'?: string;
        '--w3m-text-medium-regular-size'?: string;
        '--w3m-text-medium-regular-weight'?: string;
        '--w3m-text-medium-regular-line-height'?: string;
        '--w3m-text-medium-regular-letter-spacing'?: string;
        '--w3m-text-medium-regular-text-transform'?: string;
        '--w3m-text-medium-regular-font-family'?: string;
        '--w3m-text-small-regular-size'?: string;
        '--w3m-text-small-regular-weight'?: string;
        '--w3m-text-small-regular-line-height'?: string;
        '--w3m-text-small-regular-letter-spacing'?: string;
        '--w3m-text-small-regular-text-transform'?: string;
        '--w3m-text-small-regular-font-family'?: string;
        '--w3m-text-small-thin-size'?: string;
        '--w3m-text-small-thin-weight'?: string;
        '--w3m-text-small-thin-line-height'?: string;
        '--w3m-text-small-thin-letter-spacing'?: string;
        '--w3m-text-small-thin-text-transform'?: string;
        '--w3m-text-small-thin-font-family'?: string;
        '--w3m-text-xsmall-bold-size'?: string;
        '--w3m-text-xsmall-bold-weight'?: string;
        '--w3m-text-xsmall-bold-line-height'?: string;
        '--w3m-text-xsmall-bold-letter-spacing'?: string;
        '--w3m-text-xsmall-bold-text-transform'?: string;
        '--w3m-text-xsmall-bold-font-family'?: string;
        '--w3m-text-xsmall-regular-size'?: string;
        '--w3m-text-xsmall-regular-weight'?: string;
        '--w3m-text-xsmall-regular-line-height'?: string;
        '--w3m-text-xsmall-regular-letter-spacing'?: string;
        '--w3m-text-xsmall-regular-text-transform'?: string;
        '--w3m-text-xsmall-regular-font-family'?: string;
    }
  } | null;
}
```
