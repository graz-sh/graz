/**
 * Truncate long denom strings (especially IBC denoms) for better readability
 * @param denom - The denom string to truncate
 * @param maxLength - Maximum length before truncation (default: 20)
 * @returns Truncated denom string
 *
 * @example
 * truncateDenom("uatom") // "uatom"
 * truncateDenom("ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2")
 * // "ibc/27394FB...41E5EB2"
 */
export const truncateDenom = (denom: string, maxLength = 20): string => {
  if (denom.length <= maxLength) {
    return denom;
  }

  // For IBC denoms, show prefix and end
  if (denom.startsWith("ibc/")) {
    return `${denom.slice(0, 12)}...${denom.slice(-6)}`;
  }

  // For other long denoms, show beginning and end
  const prefixLength = Math.floor(maxLength / 2) - 2;
  const suffixLength = Math.floor(maxLength / 2) - 2;
  return `${denom.slice(0, prefixLength)}...${denom.slice(-suffixLength)}`;
};
