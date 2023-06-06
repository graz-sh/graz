import { Button, Stack, Tooltip, useDisclosure, useToast } from "@chakra-ui/react";
import { getAvailableWallets, mainnetChains, useAccount, useConnect, useDisconnect, WalletType } from "graz";

import { Modal } from "../core/modal";

export const WalletConnectButton = () => {
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isConnected, isConnecting } = useAccount({
    onConnect: ({ account, isReconnect }) => {
      if (!isReconnect) {
        toast({
          status: "success",
          title: "Wallet connected!",
          description: `Connected as ${account.name}`,
        });
      }
    },
    onDisconnect: () => {
      toast({
        status: "info",
        title: "Wallet disconnected!",
      });
    },
  });

  const { connect } = useConnect();

  const { disconnect } = useDisconnect();

  const handleConnect = (wallet: WalletType) => {
    onClose();
    return connect({ chain: mainnetChains.cosmoshub, walletType: wallet });
  };

  const wallets = getAvailableWallets();

  return (
    <>
      {!isConnected ? (
        <Button onClick={onOpen} isLoading={isConnecting}>
          Connect Wallet
        </Button>
      ) : (
        <Tooltip label="Disconnect" placement="bottom">
          <Button variant="outline" onClick={() => disconnect()} isLoading={isConnecting}>
            Connected
          </Button>
        </Tooltip>
      )}

      {!isConnected && (
        <Modal isOpen={isOpen} onClose={onClose} modalHeader="Select a wallet">
          <Stack spacing={3}>
            {wallets.keplr ? <Button onClick={() => handleConnect(WalletType.KEPLR)}>Keplr</Button> : null}
            {wallets.leap ? <Button onClick={() => handleConnect(WalletType.LEAP)}>Leap</Button> : null}
            {wallets.cosmostation ? (
              <Button onClick={() => handleConnect(WalletType.COSMOSTATION)}>Cosmostation</Button>
            ) : null}
            {wallets.walletconnect ? (
              <Button onClick={() => handleConnect(WalletType.WALLETCONNECT)}>WalletConnect</Button>
            ) : null}
            {wallets.wc_keplr_mobile ? (
              <Button onClick={() => handleConnect(WalletType.WC_KEPLR_MOBILE)}>Keplr Mobile</Button>
            ) : null}
            {wallets.wc_leap_mobile ? (
              <Button onClick={() => handleConnect(WalletType.WC_LEAP_MOBILE)}>LEAP Mobile</Button>
            ) : null}
            {wallets.wc_cosmostation_mobile ? (
              <Button onClick={() => handleConnect(WalletType.WC_COSMOSTATION_MOBILE)}>Cosmostation Mobile</Button>
            ) : null}
          </Stack>
        </Modal>
      )}
    </>
  );
};
