import type { OfflineSigner } from "@cosmjs/launchpad";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";

export interface AccountData {
  address: Uint8Array;
  bech32Address: string;
  pubKey: Uint8Array;
  algo: string;
}

export interface Connector {
  checkConnector: () => boolean;
  getAccount: (chainId: string, prefix?: string) => Promise<AccountData>;
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineSigner;
  getOfflineSignerAuto: (chainId: string) => Promise<OfflineSigner | OfflineDirectSigner>;
}

export interface GrazAdapter extends Connector {
  name: string;
  id: string;
  keystoreEvent: string;
}
