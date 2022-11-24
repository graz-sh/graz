import { bech32 } from "bech32";
import {
  resolveDomainDetails,
  resolveDomainIntoAddresses,
  resolveDomainIntoChainAddress,
  resolvePrimaryDomainByAddress,
} from "ibc-domains-sdk";

export interface AddressToIbcDomainReturnValue {
  domain: string;
  domainFull: string;
}

/**
 * @see https://docs.ibc.domains/convert_address.html#relevant-bech32-prefixes
 */
export type KnownChainPrefix =
  | "agoric"
  | "chihuahua"
  | "gravity"
  | "lum"
  | "sent"
  | "akash"
  | "comdex"
  | "iaa"
  | "micro"
  | "sif"
  | "axelar"
  | "cosmos"
  | "inj"
  | "osmo"
  | "somm"
  | "bcna"
  | "cro"
  | "ixo"
  | "panacea"
  | "star"
  | "bitsong"
  | "desmos"
  | "juno"
  | "persistence"
  | "stars"
  | "bostrom"
  | "dig"
  | "ki"
  | "regen"
  | "terra"
  | "certik"
  | "emoney"
  | "kujira"
  | "rebus"
  | "umee"
  | "cheqd"
  | "evmos"
  | "like"
  | "secret"
  | "vdl";

// eslint-disable-next-line @typescript-eslint/ban-types
export type ChainPrefix = (string & {}) | KnownChainPrefix;

export interface DomainDetails {
  expiration: string;
  imageData: string;
  twitterId: string;
  discordId: string;
  telegramId: string;
  keybaseId: string;
  pgpPublicKey: string;
}

export const isIbcDomainPostfix = (value: string) => {
  return value.endsWith(".cosmos");
};

export const validateAddress = (address: string, prefix: ChainPrefix) => {
  if (!address) return false;
  try {
    return bech32.decode(address).prefix === prefix;
  } catch (error) {
    return false;
  }
};

export const getIbcDomainByAdress = async (
  address: string,
  isTestnet?: boolean,
): Promise<AddressToIbcDomainReturnValue | null> => {
  const result = await resolvePrimaryDomainByAddress(address, isTestnet);
  if (result.error) {
    throw new Error(result.error);
  }

  if (result.value === null) {
    return null;
  }

  const res = result.value as {
    domain: string;
    domain_full: string;
  };

  return {
    domain: res.domain,
    domainFull: res.domain_full,
  };
};

export const getAddressesByIbcDomain = async (ibcDomain: string, isTestnet?: boolean): Promise<string[] | null> => {
  const result = await resolveDomainIntoAddresses(ibcDomain, isTestnet);
  if (result.error) {
    throw new Error(result.error);
  }

  if (result.value === null) {
    return null;
  }

  return result.value as string[];
};

export const getChainAddressByIbcDomain = async (
  ibcDomain: string,
  prefix: ChainPrefix,
  isTestnet?: boolean,
): Promise<string | null> => {
  const result = await resolveDomainIntoChainAddress(ibcDomain, prefix, isTestnet);
  if (result.error) {
    throw new Error(result.error);
  }

  if (result.value === null) {
    return null;
  }

  return result.value as string;
};

export const getIbcDomainDetails = async (ibcDomain: string, isTestnet?: boolean): Promise<DomainDetails | null> => {
  const result = await resolveDomainDetails(ibcDomain, isTestnet);
  if (result.error) {
    throw new Error(result.error);
  }

  if (result.value === null) {
    return null;
  }

  return result.value as DomainDetails;
};

export interface ResolveToChainAddressArgs {
  value: string;
  prefix: ChainPrefix;
  isTestnet?: boolean;
}

export const resolveToChainAddress = async ({ value, prefix, isTestnet }: ResolveToChainAddressArgs) => {
  const trimmed = value.trim();
  if (trimmed === "") {
    throw new Error("value can't be an empty string");
  }
  const isIbcDomain = isIbcDomainPostfix(value);
  if (isIbcDomain) {
    const res = await getChainAddressByIbcDomain(value, prefix, isTestnet);
    if (!res) {
      throw new Error("ibc domain not found");
    }
    return res;
  }

  if (!validateAddress(value, prefix)) {
    throw new Error("Address is not valid");
  }
  return value;
};
