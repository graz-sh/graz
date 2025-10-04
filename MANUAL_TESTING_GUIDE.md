# Manual Testing Guide - Graz Multi-Chain Refactoring

## Overview
This guide covers manual testing for the refactored Graz hooks with the new multi-chain API.

**Key Changes:**
- All hooks now return `Record<chainId, T>` format
- `chainId` parameter is always an array
- Type inference with `as const` for exact keys
- Explicit `senderAddress` in mutation hooks

---

## Prerequisites

### 1. Build the Package
```bash
cd /Users/kiki/Workspace/graz/graz
pnpm install
pnpm graz build
```

### 2. Install a Wallet
You'll need at least one Cosmos wallet extension:
- [Keplr](https://www.keplr.app/) (recommended)
- [Leap](https://www.leapwallet.io/)
- [Cosmostation](https://wallet.cosmostation.io/)

### 3. Get Test Tokens
For testing, you'll need tokens on a testnet:
- Cosmos Hub testnet: https://faucet.theta-testnet.polypore.xyz/
- Osmosis testnet: https://faucet.testnet.osmosis.zone/

---

## Testing the Examples

### Option 1: Vite Example (Quick Test)
```bash
pnpm example:vite dev
# Open http://localhost:5173
```

**What to test:**
- Connect wallet to cosmoshub-4
- View account information
- Check balance display
- Verify denoms are truncated

---

### Option 2: Next.js Example
```bash
pnpm example:next dev
# Open http://localhost:3000
```

**What to test:**
- Connect wallet
- View balances
- Refresh balances
- Switch chains (suggest osmosis testnet)
- Verify all data displays correctly

---

### Option 3: Starter Example (Full Features)
```bash
pnpm example:starter dev
# Open http://localhost:3000
```

**What to test:**
- Connect to multiple chains
- Navigate between pages (Home, Assets, Send Token)
- View assets with chain IDs
- Select chain and send tokens
- Check all balances modal

---

## Test Scenarios

### 1. Connection Flow ✅

#### Test: Connect Single Chain
1. Open any example app
2. Click "Connect Wallet"
3. Select your wallet (e.g., Keplr)
4. Approve connection in wallet popup

**Expected:**
- ✅ Wallet connects successfully
- ✅ Account address displays
- ✅ Account name shows (if available)
- ✅ Connection status updates

**Verify:**
```typescript
// In browser console
useAccount({ chainId: ["cosmoshub-4"] })
// Should return: { "cosmoshub-4": { name, address, pubKey, ... } }
```

---

#### Test: Connect Multiple Chains (Starter Example)
1. Open starter example
2. Click "Connect all chains"
3. Approve all chain connections

**Expected:**
- ✅ Multiple chain cards appear
- ✅ Each chain shows connected status
- ✅ Each chain has disconnect button
- ✅ Balances load for each chain

---

#### Test: Disconnect
1. After connecting, click "Disconnect"
2. Confirm disconnection

**Expected:**
- ✅ Wallet disconnects
- ✅ UI updates to show disconnected state
- ✅ Account info clears
- ✅ Connect button reappears

---

### 2. Multi-Chain API Testing ✅

#### Test: Record Format Returns
**Location:** Any example, browser console

```javascript
// Test useAccount
const { data: accounts } = useAccount({ 
  chainId: ["cosmoshub-4", "osmosis-1"] 
});
console.log(accounts);
// Expected: { "cosmoshub-4": {...}, "osmosis-1": {...} }

// Test useBalances
const { data: balances } = useBalances({ 
  chainId: ["cosmoshub-4"] 
});
console.log(balances);
// Expected: { "cosmoshub-4": [{ denom: "uatom", amount: "1000" }] }
```

**Verify:**
- ✅ Returns object (Record) not array
- ✅ Keys are chain IDs
- ✅ Values are the expected data type

---

#### Test: Type Inference with `as const`
**Location:** TypeScript-enabled editor

```typescript
// Without
const { data: accounts1 } = useAccount({ 
  chainId: ["cosmoshub-4"] 
});
accounts1?.["cosmoshub-4"]  // ✅ Valid
accounts1?.["any-string"]   // ✅ TypeScript allows (generic Record<string, Key>)

// With
const { data: accounts2 } = useAccount({ 
  chainId: ["cosmoshub-4"] 
});
accounts2?.["cosmoshub-4"]  // ✅ Valid and type-safe
accounts2?.["wrong-chain"]  // ❌ TypeScript error!
```

**Verify:**
- ✅ Autocomplete suggests exact chain IDs
- ✅ TypeScript errors on invalid chain IDs
- ✅ Hover shows precise types

---

### 3. Balance Queries ✅

#### Test: View Balances (Assets Page)
**Location:** Starter example → Assets page

1. Connect to one or more chains
2. Click "Assets" in navigation
3. View the balances table

**Expected:**
- ✅ Chain ID badge shows for each balance
- ✅ Denoms are truncated (hover for full)
- ✅ Available amounts display correctly
- ✅ Staked amounts show (if applicable)
- ✅ Table is readable and organized

**Check:**
- Long IBC denoms: `ibc/27394FB...41E5EB2` ✅
- Short denoms: `uatom` (unchanged) ✅
- Tooltip shows full denom on hover ✅

---

#### Test: Single Denom Balance
**Location:** Next.js example

1. Connect wallet
2. View balance list
3. Click refresh

**Expected:**
- ✅ All denoms display
- ✅ Amounts are correct
- ✅ Refresh updates balances
- ✅ Loading state shows during refresh

---

#### Test: All Balances Modal (Starter)
**Location:** Starter example → Chain card → "View all"

1. Connect to a chain
2. Click "View all" on chain card
3. View modal

**Expected:**
- ✅ Modal opens
- ✅ All balances listed
- ✅ Amounts formatted correctly
- ✅ Denoms truncated with tooltips

---

### 4. Signing Clients ✅

#### Test: Get Signing Client
**Location:** Browser console, any example

```javascript
const { data: clients } = useStargateSigningClient({
  chainId: ["cosmoshub-4"]
});
console.log(clients);
// Expected: { "cosmoshub-4": SigningStargateClient }
```

**Verify:**
- ✅ Client exists for connected chain
- ✅ Null/undefined for disconnected chains
- ✅ Multiple clients if multiple chains

---

#### Test: Per-Chain Options
**Location:** Code test (TypeScript)

```typescript
const { data: clients } = useStargateSigningClient({
  chainId: ["cosmoshub-4", "osmosis-1"],
  opts: {
    "cosmoshub-4": { gasPrice: GasPrice.fromString("0.025uatom") },
    "osmosis-1": { gasPrice: GasPrice.fromString("0.025uosmo") }
  }
});
```

**Verify:**
- ✅ Code compiles without errors
- ✅ Each client uses correct gas price
- ✅ TypeScript validates chain IDs in opts

---

### 5. Token Sending ✅

#### Test: Send Tokens with Chain Selection
**Location:** Starter example → Send Token page

1. Connect to multiple chains
2. Go to "Send Token" page
3. **Select chain** from dropdown
4. Select coin
5. Enter recipient address
6. Enter amount
7. Click "Send"

**Expected:**
- ✅ Chain dropdown lists all connected chains
- ✅ Coin dropdown shows coins for selected chain
- ✅ Sender address auto-fills
- ✅ Transaction submits successfully
- ✅ Success toast shows transaction hash
- ✅ Can copy tx hash

**Verify:**
- ✅ Correct chain is used
- ✅ Correct signing client
- ✅ Correct sender address
- ✅ Balance updates after tx

---

#### Test: Send with Explicit senderAddress
**Location:** Send Token Modal (Starter)

1. Connect to a chain
2. Find chain card
3. Click "Send Tokens" button
4. Fill form and send

**Expected:**
- ✅ Modal opens
- ✅ Form has recipient, amount
- ✅ Transaction executes
- ✅ Modal shows tx result
- ✅ Can open in block explorer

**Code Check:**
```typescript
// Verify code uses explicit senderAddress
sendTokensAsync({
  signingClient,
  senderAddress: account.bech32Address, // ✅ Explicit
  recipientAddress: "...",
  amount: [...],
  fee: "auto"
});
```

---

### 6. Navigation & UI ✅

#### Test: Page Navigation (Starter)
**Location:** Starter example

1. Click "Home" - should show chain cards
2. Click "Assets" - should show balances table
3. Click "Send Token" - should show send form
4. Active page button is highlighted green

**Expected:**
- ✅ Navigation works
- ✅ Active page highlighted
- ✅ Content updates correctly
- ✅ Navigation visible on all pages

---

#### Test: Chain ID Display
**Location:** Starter example → Assets page

**Check:**
- ✅ Chain ID badges visible
- ✅ Badge color is purple
- ✅ Chain ID text is readable
- ✅ Badges align properly in table

---

#### Test: Denom Truncation
**Location:** All examples

**Check Long IBC Denom:**
```
Full: ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2
Display: ibc/27394FB...41E5EB2
```

**Verify:**
- ✅ Long denoms truncated
- ✅ Short denoms unchanged (uatom, uosmo)
- ✅ Hover shows full denom in tooltip
- ✅ Tooltip appears on hover
- ✅ Text is monospace font

---

### 7. Edge Cases ✅

#### Test: No Balances
1. Connect wallet with empty account
2. View balances

**Expected:**
- ✅ Empty state or "no balances" message
- ✅ No errors in console
- ✅ UI remains functional

---

#### Test: Network Errors
1. Disconnect internet
2. Try to load balances
3. Reconnect

**Expected:**
- ✅ Error state shows
- ✅ Can retry
- ✅ Recovers when reconnected

---

#### Test: Wallet Switching
1. Connect with Keplr
2. Disconnect
3. Connect with Leap (if available)

**Expected:**
- ✅ Switches cleanly
- ✅ No lingering state
- ✅ New wallet data loads
- ✅ No console errors

---

#### Test: Rapid Reconnection
1. Connect
2. Disconnect immediately
3. Connect again quickly

**Expected:**
- ✅ Handles rapid changes
- ✅ Final state is correct
- ✅ No race conditions
- ✅ No stuck loading states

---

## Verification Checklist

### Core Functionality
- [ ] Connect to single chain works
- [ ] Connect to multiple chains works
- [ ] Disconnect works (single chain)
- [ ] Disconnect works (all chains)
- [ ] Reconnect on page refresh works
- [ ] Account data displays correctly
- [ ] Balances load correctly
- [ ] Balance refresh works

### Multi-Chain API
- [ ] Hooks return Record<chainId, T> format
- [ ] chainId as array works
- [ ] Type inference with `as const` works
- [ ] Multiple chains return multiple results
- [ ] Single chain returns single result in Record
- [ ] Undefined chainId returns all connected chains

### UI/UX
- [ ] Chain IDs display in Assets page
- [ ] Long denoms truncate correctly
- [ ] Tooltips show full denom
- [ ] Navigation between pages works
- [ ] Active page highlighted
- [ ] Chain selection dropdown works
- [ ] Forms validate correctly
- [ ] Loading states show

### Transactions
- [ ] Can select chain for sending
- [ ] Coin dropdown filters by chain
- [ ] Sender address pre-fills
- [ ] Transaction submits successfully
- [ ] Success/error toasts show
- [ ] Transaction hash copyable
- [ ] Balance updates after tx

### Error Handling
- [ ] Empty balances handled
- [ ] Network errors handled
- [ ] Invalid inputs rejected
- [ ] Wallet not found handled
- [ ] Disconnection handled gracefully

### TypeScript (in editor)
- [ ] No TypeScript errors in examples
- [ ] Autocomplete works for chain IDs
- [ ] Type errors on invalid chain IDs
- [ ] Proper inference with `as const`
- [ ] IDE shows correct types on hover

---

## Common Issues & Solutions

### Issue: "chainId.map is not a function"
**Cause:** Passing chainId as string instead of array

**Fix:**
```typescript
// ❌ Wrong
connect({ chainId: "cosmoshub-4" })

// ✅ Correct
connect({ chainId: ["cosmoshub-4"] })
```

---

### Issue: Can't access account data
**Cause:** Not extracting from Record format

**Fix:**
```typescript
// ❌ Wrong
const { data: account } = useAccount();
account.bech32Address  // undefined!

// ✅ Correct
const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
const account = accounts?.["cosmoshub-4"];
account.bech32Address  // works!
```

---

### Issue: TypeScript error "Property does not exist"
**Cause:** Using wrong key or not narrowing type

**Fix:**
```typescript
// Use for exact types
const { data: accounts } = useAccount({ 
  chainId: ["cosmoshub-4"] 
});
accounts?.["cosmoshub-4"]  // ✅ Type-safe
```

---

### Issue: Transaction fails silently
**Cause:** Missing senderAddress in new API

**Fix:**
```typescript
// ❌ Old API (no longer works)
sendTokensAsync({ recipientAddress, amount, fee })

// ✅ New API
sendTokensAsync({ 
  senderAddress: account.bech32Address,  // Required!
  recipientAddress, 
  amount, 
  fee 
})
```

---

### Issue: Balances not loading
**Check:**
1. Are you connected? Check `isConnected`
2. Is the RPC endpoint working? Check network tab
3. Does the account have balances? Check in wallet
4. Is the chain ID correct? Check spelling

---

## Performance Testing

### Test: Multiple Chain Queries
**Scenario:** Connect to 5+ chains and load balances

**Check:**
- [ ] Queries run concurrently (max 3 at once by default)
- [ ] No excessive memory usage
- [ ] All balances eventually load
- [ ] UI remains responsive

**Monitor:**
```javascript
// Check multiChainFetchConcurrency setting
const config = useGrazInternalStore.getState();
console.log(config.multiChainFetchConcurrency); // Should be 3
```

---

### Test: Rapid State Changes
**Scenario:** Quick connect/disconnect cycles

**Check:**
- [ ] No memory leaks
- [ ] State updates correctly
- [ ] No zombie subscriptions
- [ ] Clean cleanup on unmount

---

## Browser Testing

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on macOS)
- [ ] Brave

### Check Per Browser
- [ ] Wallet extension works
- [ ] All features functional
- [ ] No console errors
- [ ] UI renders correctly
- [ ] Performance acceptable

---

## Test Report Template

```markdown
## Test Session Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Example:** Vite / Next.js / Starter
**Wallet:** Keplr / Leap / Cosmostation
**Browser:** Chrome 120

### Tests Passed ✅
- Connection flow
- Balance queries
- Token sending
- [List what worked]

### Tests Failed ❌
- [Describe failures]
- [Steps to reproduce]
- [Error messages]

### Issues Found 🐛
1. **Issue:** Description
   - **Severity:** High / Medium / Low
   - **Reproduce:** Steps
   - **Expected:** Behavior
   - **Actual:** Behavior

### Suggestions 💡
- [Any improvements or feedback]

### Overall Assessment
- [ ] Ready for production
- [ ] Needs fixes
- [ ] Critical issues found
```

---

## Success Criteria

### ✅ Testing Complete When:
1. All test scenarios pass
2. All checklist items checked
3. No critical bugs found
4. TypeScript types work correctly
5. All examples functional
6. Cross-browser tested
7. Performance acceptable
8. Error handling works

### 🚀 Ready to Ship When:
- All manual tests pass
- Automated tests pass
- Documentation updated
- Migration guide reviewed
- Examples demonstrate new API
- No TypeScript errors
- No runtime errors in normal use

---

## Quick Test (5 minutes)

If you only have 5 minutes, test this:

1. **Build:** `pnpm graz build`
2. **Run:** `pnpm example:starter dev`
3. **Connect:** Connect wallet to 2+ chains
4. **Navigate:** Visit Home, Assets, Send Token pages
5. **Verify:** 
   - Chain IDs show in Assets ✅
   - Can select chain in Send Token ✅
   - Denoms are truncated ✅
   - Navigation works ✅
6. **Send:** Try sending a small amount
7. **Check:** Transaction succeeds ✅

If all pass → Basic functionality works! ✅

---

## Next Steps After Testing

1. **Document findings** in test report
2. **File issues** for bugs found
3. **Update examples** if needed
4. **Improve docs** based on confusion points
5. **Plan fixes** for any issues
6. **Retest** after fixes applied

---

## Support

If you find issues during testing:
1. Check this guide's troubleshooting section
2. Review the codebase context in `agents.md`
3. Check git history for recent changes
4. Ask for help with specific reproduction steps

**Happy Testing! 🚀**


