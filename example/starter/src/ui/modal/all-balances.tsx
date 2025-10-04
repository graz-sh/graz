import {
  Button,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import type { ChainInfo } from "@graz-sh/types";
import { useAccount, useBalances } from "graz";
import { truncateDenom } from "src/utils/truncateDenom";

export const AllBalancesModal = ({ chain }: { chain: ChainInfo }) => {
  const modal = useDisclosure();
  // NEW API: chainId must be an array, hooks return Record format
  const { data: accounts } = useAccount({
    chainId: [chain.chainId],
  });
  const account = accounts?.[chain.chainId]; // Extract from Record

  const { data: balancesRecord } = useBalances({
    chainId: [chain.chainId],
    bech32Address: account?.bech32Address,
  });
  const balances = balancesRecord?.[chain.chainId]; // Extract from Record

  return (
    <>
      <Button onClick={modal.onOpen} size="xs">
        View all
      </Button>
      <Modal isCentered isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay bgColor="blackAlpha.800" />
        <ModalContent bgColor="baseBg" borderRadius="2xl" py={4}>
          <ModalBody>
            <Stack spacing={4}>
              <Heading fontSize="28px" fontWeight="semibold">
                {chain.chainName} coin balances
              </Heading>
              <Stack>
                {balances?.map((balance) => {
                  return (
                    <HStack key={balance.denom}>
                      <Text fontFamily="mono" fontWeight="bold">
                        {Number(balance.amount)}
                      </Text>
                      <Tooltip label={balance.denom} placement="top" hasArrow>
                        <Text fontFamily="mono" fontWeight="semibold" textTransform="uppercase">
                          {truncateDenom(balance.denom)}
                        </Text>
                      </Tooltip>
                    </HStack>
                  );
                })}
              </Stack>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
