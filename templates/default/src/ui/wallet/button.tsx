import { useAccount } from "graz";

import { WalletConnectButton } from "./connect-button";
import { WalletPopover } from "./popover";

export function WalletButton() {
  const { isConnected } = useAccount();
  if (isConnected) {
    return <WalletPopover />;
  }
  return <WalletConnectButton />;
}
