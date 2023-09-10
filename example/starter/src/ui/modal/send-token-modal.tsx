import {
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import type { ChainInfo } from "@graz-sh/types";
import { useAccount, useBalance, useSendTokens, useStargateSigningClient } from "graz";
import { useState } from "react";

export const SendTokenModal = ({ chain }: { chain: ChainInfo }) => {
  const toast = useToast();
  const { data: account } = useAccount({
    chainId: chain.chainId,
  });
  const { isOpen, onClose, onOpen } = useDisclosure();

  const coin = chain.stakeCurrency;
  const balance = useBalance({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address,
    denom: coin.coinMinimalDenom,
  });

  const { data: signingClient, isLoading: isSCLoading } = useStargateSigningClient({
    chainId: chain.chainId,
  });

  const { isLoading, sendTokensAsync } = useSendTokens({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction done",
        status: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        description: error?.message || "Something went wrong",
        status: "error",
      });
    },
  });

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof sendTokensAsync>>>();

  const handleOnClose = () => {
    setRecipient("");
    setAmount("");
    setResult(undefined);
    onClose();
  };

  const handleStake = async () => {
    try {
      if (!signingClient) {
        toast({
          title: "Error",
          description: "Signing Client not found",
          status: "error",
        });
        return;
      }
      const res = await sendTokensAsync({
        amount: [
          {
            amount: String(Number(amount) * Math.pow(10, coin.coinDecimals || 6)),
            denom: coin.coinMinimalDenom || "",
          },
        ],
        fee: {
          amount: [
            {
              amount: "5000",
              denom: coin.coinMinimalDenom || "",
            },
          ],
          gas: "200000",
        },
        memo: "",
        senderAddress: account?.bech32Address || "",
        recipientAddress: recipient,
        signingClient,
      });
      setResult(res);
    } catch (error) {
      console.error(error);
      handleOnClose();
    }
  };
  return (
    <>
      <Button colorScheme="blue" onClick={onOpen} size="sm" variant="solid">
        Send Tokens
      </Button>
      <Modal
        closeOnEsc={!isLoading}
        closeOnOverlayClick={!isLoading}
        isCentered
        isOpen={isOpen}
        onClose={handleOnClose}
      >
        <ModalOverlay bgColor="blackAlpha.800" />
        <ModalContent borderRadius="2xl" py={4}>
          <ModalBody>
            <Stack spacing={4}>
              <Heading fontSize="28px" fontWeight="semibold">
                Send {chain.stakeCurrency.coinDenom}
              </Heading>
              {result ? (
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <Text color="whiteAlpha.600" fontWeight="semibold">
                      TxHash:
                    </Text>
                    <Text fontFamily="mono" fontWeight="bold" wordBreak="break-all">
                      {result.transactionHash}
                    </Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text color="whiteAlpha.600" fontWeight="semibold">
                      TxHeight:
                    </Text>
                    <Text fontFamily="mono" fontWeight="bold" wordBreak="break-all">
                      {result.height}
                    </Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text color="whiteAlpha.600" fontWeight="semibold">
                      Gas Used:
                    </Text>
                    <Text fontFamily="mono" fontWeight="bold" wordBreak="break-all">
                      {result.gasUsed}
                    </Text>
                  </Stack>
                  <HStack>
                    <Button
                      alignSelf="end"
                      flex="1"
                      onClick={() => {
                        handleOnClose();
                      }}
                      px={4}
                      variant="outline"
                    >
                      Close
                    </Button>
                    <Button
                      alignSelf="end"
                      bgColor="brand"
                      flex="1"
                      onClick={() => {
                        window.open(
                          `https://mintscan.io/${chain.bech32Config.bech32PrefixAccAddr}/transactions/${result.transactionHash}`,
                          "_blank",
                        );
                      }}
                      px={4}
                    >
                      Open in Block Explorer
                    </Button>
                  </HStack>
                </Stack>
              ) : (
                <>
                  <Stack>
                    <Text fontWeight="semibold">Recipient address</Text>
                    <Input
                      onChange={(e) => {
                        setRecipient(e.target.value);
                      }}
                      placeholder="cosmos1g3..."
                      type="text"
                      value={recipient}
                    />
                    <HStack justifyContent="space-between">
                      <Text fontWeight="semibold">Amount</Text>
                      <HStack color="whiteAlpha.600">
                        {balance.isLoading ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Text>Available: </Text>
                            <Text fontFamily="mono">
                              {Number(Number(balance.data?.amount || 0) / Math.pow(10, coin.coinDecimals || 6))}{" "}
                              {coin.coinDenom}
                            </Text>
                          </>
                        )}
                      </HStack>
                    </HStack>
                    <InputGroup size="sm">
                      <Input
                        onChange={(e) => {
                          setAmount(e.target.value);
                        }}
                        placeholder="0"
                        type="number"
                        value={amount}
                      />
                      <InputRightAddon>ATOM</InputRightAddon>
                    </InputGroup>
                  </Stack>

                  <Button
                    isLoading={isLoading || isSCLoading}
                    onClick={() => {
                      void handleStake();
                    }}
                  >
                    Send {coin.coinDenom}
                  </Button>
                </>
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
