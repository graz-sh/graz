export function convertMicroDenomToDenom(value: number | string, decimals: number): number {
  if (decimals === 0) {
    return Number(value);
  }
  return handleNaN(Number(value) / Math.pow(10, decimals));
}

export function convertDenomToMicroDenom(value: number | string, decimals: number): number {
  if (decimals === 0) {
    return Number(value);
  }
  return handleNaN(parseInt(String(Number(value) * Math.pow(10, decimals)), 10));
}

export function convertFromMicroDenom(denom: string): string {
  return denom.substring(1).toUpperCase();
}

export function convertToFixedDecimals(value: number | string): string {
  const amount = Number(value);
  return amount > 0.01 ? amount.toFixed(2) : String(amount);
}

export function formatTokenName(name: string): string {
  if (name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
  }
  return "";
}

export function handleNaN(value: number): number {
  return isNaN(value) ? 0 : value;
}
