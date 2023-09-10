import { CopyIcon } from "@chakra-ui/icons";
import { Button, HStack, IconButton, Image, Spinner, Stack, Text, Tooltip, useToast } from "@chakra-ui/react";
import type { ChainInfo } from "@graz-sh/types";
import { useAccount, useBalance, useBalanceStaked, useDisconnect } from "graz";

import { AllBalancesModal } from "../modal/all-balances";
import { ConnectWalletModal } from "../modal/connect-wallet";
import { SendTokenModal } from "../modal/send-token-modal";

export const Card = ({ chain }: { chain: ChainInfo }) => {
  const toast = useToast();
  const { data: account, isConnecting } = useAccount({
    chainId: chain.chainId,
  });
  const { data: balance } = useBalance({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address,
    denom: chain.stakeCurrency.coinMinimalDenom,
  });
  const { data: stakedBalance } = useBalanceStaked({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address,
  });
  const { disconnect } = useDisconnect({
    onSuccess: () => {
      toast({
        description: `Successfully disconnected from ${chain.chainName}`,
        duration: 3000,
        isClosable: true,
        status: "success",
      });
    },
  });
  return (
    <Stack
      _hover={{
        bgColor: "baseHoverBackground",
      }}
      bgColor="baseBackground"
      borderRadius={12}
      px={4}
      py={4}
      spacing={4}
    >
      <HStack justifyContent="space-between">
        <HStack>
          <Image alt={chain.chainName} boxSize="32px" src={chain.stakeCurrency.coinImageUrl} />
          <Text fontWeight="bold">{chain.chainName}</Text>
          {isConnecting ? <Spinner size="sm" /> : null}
          {account ? (
            <Button
              colorScheme="red"
              onClick={() => {
                disconnect({
                  chainId: chain.chainId,
                });
              }}
              size="xs"
              variant="outline"
            >
              Disconnect
            </Button>
          ) : null}
        </HStack>
        {account ? (
          <Tooltip
            backgroundColor="green.100"
            color="black"
            fontFamily="mono"
            fontSize="2xs"
            label={account.bech32Address}
            placement="top"
          >
            <HStack>
              <Text bgColor="blackAlpha.300" borderRadius={8} fontFamily="mono" fontSize="sm" p={1} px={2}>
                {account.bech32Address.slice(0, 6)}...{account.bech32Address.slice(-6)}
              </Text>
              <IconButton
                aria-label="copy address"
                icon={<CopyIcon />}
                onClick={() => {
                  void window.navigator.clipboard.writeText(account.bech32Address);
                  toast({
                    description: "Copied address to clipboard",
                    duration: 3000,
                    isClosable: true,
                  });
                }}
                size="xs"
              />
            </HStack>
          </Tooltip>
        ) : (
          <ConnectWalletModal chain={chain} />
        )}
      </HStack>
      {account ? (
        <HStack alignItems="end" justifyContent="space-between">
          <SendTokenModal chain={chain} />
          <Stack alignItems="end">
            <HStack>
              <AllBalancesModal chain={chain} />
              <Text fontFamily="mono" fontWeight="bold">
                {balance
                  ? Number(Number(balance.amount) / Math.pow(10, chain.stakeCurrency.coinDecimals)).toFixed(6)
                  : "--"}
              </Text>
              <Text fontFamily="mono" fontWeight="semibold" textTransform="uppercase">
                {chain.stakeCurrency.coinDenom}
              </Text>
            </HStack>
            <HStack>
              <Text fontFamily="mono" fontWeight="bold">
                Staked{" "}
                {stakedBalance
                  ? Number(Number(stakedBalance.amount) / Math.pow(10, chain.stakeCurrency.coinDecimals)).toFixed(6)
                  : "--"}
              </Text>
              <Text fontFamily="mono" fontWeight="semibold" textTransform="uppercase">
                {chain.stakeCurrency.coinDenom}
              </Text>
            </HStack>
          </Stack>
        </HStack>
      ) : null}
    </Stack>
  );
};
