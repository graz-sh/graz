---
"graz": minor
---

Remove Leap wallet and Leap MetaMask Snap support. This removes `WalletType.LEAP`, `WalletType.WC_LEAP_MOBILE`, and `WalletType.METAMASK_SNAP_LEAP` from the library. Users should migrate to other supported wallets.

**Breaking changes:**
- `WalletType.LEAP` removed
- `WalletType.WC_LEAP_MOBILE` removed  
- `WalletType.METAMASK_SNAP_LEAP` removed
- `getLeap()` export removed
- `getWCLeap()` export removed
- `getMetamaskSnapLeap()` export removed
- `isLeapSnaps()` helper removed
- `isLeapDappBrowser()` helper removed
- `window.leap` type declaration removed
- `useActiveWalletType()` no longer returns `isLeap`, `isLeapMobile`, or `isMetamaskSnapLeap` flags
