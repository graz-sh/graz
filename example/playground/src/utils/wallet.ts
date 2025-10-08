import { WalletType } from "graz";

export interface WalletInfo {
  name: string;
  logo?: string;
  website?: string;
}

/**
 * Get wallet information from the wallet adapter
 * Falls back to wallet type if wallet is not available
 */
export function getWalletInfo(walletType: WalletType): WalletInfo {
  // Wallet interface doesn't expose name, logo, website properties
  // So we just format the wallet type name
  return {
    name: formatWalletName(walletType),
  };
}

/**
 * Format wallet type enum to human-readable name
 */
function formatWalletName(walletType: WalletType): string {
  return walletType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
