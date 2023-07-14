export const convertMicroDenomToDenom = (value: number | string, decimals: number): number => {
  if (decimals === 0) {
    return Number(value);
  }
  return handleNaN(Number(value) / Math.pow(10, decimals));
};

export const convertDenomToMicroDenom = (value: number | string, decimals: number): number => {
  if (decimals === 0) {
    return Number(value);
  }
  return handleNaN(parseInt(String(Number(value) * Math.pow(10, decimals)), 10));
};

export const convertFromMicroDenom = (denom: string): string => {
  return denom.substring(1).toUpperCase();
};

export const convertToFixedDecimals = (value: number | string, fractionDigits = 2): string => {
  const amount = Number(value);
  return amount > 0.01 ? amount.toFixed(fractionDigits) : String(amount);
};

export const formatTokenName = (name: string): string => {
  if (name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
  }
  return "";
};

export const handleNaN = (value: number): number => {
  return isNaN(value) ? 0 : value;
};

export const truncate = (string?: string, slice?: number): string => {
  if (string && slice && string.length <= slice) return string;

  const pre = string?.slice(0, slice || 8);
  const post = string?.slice((slice || 8) * -1);

  return `${pre}...${post}`;
};
