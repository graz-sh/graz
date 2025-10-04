import { Box, Button, FormControl, FormLabel, Heading, HStack, Input, Select, Stack, useToast } from "@chakra-ui/react";
import { useStargateSigningClient } from "graz";
import { useAccount, useActiveChains, useSendTokens } from "graz";
import type { FormEvent } from "react";
import { useState } from "react";
import { PageNavigation } from "src/ui/core/page-navigation";

const SendToken = () => {
  // NEW API: Hooks return Record format
  const { data: accounts, isConnected } = useAccount();
  const activeChains = useActiveChains();
  const toast = useToast();

  const { data: signingClients } = useStargateSigningClient();

  const { sendTokensAsync, isLoading } = useSendTokens({
    onError: (_, data) => {
      const args = data;
      toast({
        status: "error",
        title: "Send token fail",
        description: `Failed send token to ${args.recipientAddress}`,
      });
    },
  });

  const [formData, setFormData] = useState({
    chainId: "",
    coin: "",
    recipientAddress: "",
    amount: "",
    memo: "",
  });

  // Get account and signing client for selected chain
  const accountData = formData.chainId ? accounts?.[formData.chainId] : undefined;
  const signingClient = formData.chainId ? signingClients?.[formData.chainId] : undefined;

  // Get selected chain info
  const selectedChain = activeChains?.find((chain) => chain.chainId === formData.chainId);

  const handleSubmit = (event: FormEvent) => {
    const fee = {
      gas: "150000",
      amount: [{ denom: formData.coin, amount: "30000" }],
    };
    event.preventDefault();

    const sendToken = async () => {
      try {
        if (!signingClient) throw new Error("signingClient is not ready");
        if (!accountData) throw new Error("account is not ready");
        const result = await sendTokensAsync({
          signingClient,
          senderAddress: accountData.bech32Address,
          recipientAddress: formData.recipientAddress,
          amount: [
            {
              denom: formData.coin,
              amount: formData.amount,
            },
          ],
          fee,
          memo: formData.memo,
        });

        toast({
          status: "success",
          title: "Send token success",
          description: (
            <Box
              as="button"
              bg="green.700"
              borderRadius={4}
              color="white"
              noOfLines={1}
              onClick={() => {
                void navigator.clipboard.writeText(result.transactionHash);
                toast({
                  status: "success",
                  title: "coppied transactionHash to clipboard",
                });
              }}
              px={2}
              py={1}
              textAlign="left"
              wordBreak="break-all"
            >
              Copy transactionHash: {result.transactionHash}
            </Box>
          ),
        });
      } catch (error) {
        console.error(error);
      }
    };

    void sendToken();
  };

  return (
    <Stack spacing={6} w="full">
      <HStack justifyContent="space-between">
        <Heading size="md">Send Token</Heading>
        <PageNavigation />
      </HStack>
      {isConnected ? (
        <Stack as="form" onSubmit={handleSubmit} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Chain</FormLabel>
            <Select
              onChange={(event) =>
                setFormData({
                  ...formData,
                  chainId: event.currentTarget.value,
                  coin: "", // Reset coin when chain changes
                })
              }
              placeholder="Select chain"
              value={formData.chainId}
            >
              {activeChains?.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.chainName} ({chain.chainId})
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired isDisabled={!formData.chainId}>
            <FormLabel>Coin</FormLabel>
            <Select
              onChange={(event) =>
                setFormData({
                  ...formData,
                  coin: event.currentTarget.value,
                })
              }
              placeholder="Select coin"
              value={formData.coin}
            >
              {selectedChain?.currencies.map((currency) => (
                <option key={currency.coinMinimalDenom} value={currency.coinMinimalDenom}>
                  {currency.coinDenom} ({currency.coinMinimalDenom})
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Sender address</FormLabel>
            <Input isDisabled type="text" value={accountData?.bech32Address ?? ""} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Recipient address</FormLabel>
            <Input
              onChange={(event) =>
                setFormData({
                  ...formData,
                  recipientAddress: event.currentTarget.value,
                })
              }
              type="text"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <Input
              onChange={(event) =>
                setFormData({
                  ...formData,
                  amount: event.currentTarget.value,
                })
              }
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Memo</FormLabel>
            <Input
              onChange={(event) =>
                setFormData({
                  ...formData,
                  memo: event.currentTarget.value,
                })
              }
              type="text"
            />
          </FormControl>
          <Button isLoading={isLoading} mt={4} type="submit" width="full">
            Send
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default SendToken;
