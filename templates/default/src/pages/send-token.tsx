import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { useAccount, useActiveChain, useSendTokens } from "graz";
import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";

const SendToken = () => {
  const { data } = useAccount();
  const activeChain = useActiveChain();
  const transactionHash = useRef("");
  const { onCopy } = useClipboard(transactionHash.current);
  const toast = useToast();

  const { sendTokensAsync, isLoading, isSuccess } = useSendTokens({
    onError: () => {
      toast({
        status: "error",
        title: "Send token fail",
        description: `Failed send token to ${formData.recipientAddress}`,
      });
    },
  });

  useMemo(() => {
    isSuccess &&
      transactionHash.current !== "" &&
      toast({
        status: "success",
        title: "Send token success",
        description: (
          <Box
            as="button"
            onClick={() => {
              onCopy();
              toast({
                status: "success",
                title: "coppied transactionHash to clipboard",
              });
            }}
            bg="green.700"
            py={1}
            px={2}
            textAlign="left"
            color="white"
            borderRadius={4}
            noOfLines={1}
            wordBreak="break-all"
          >
            Copy transactionHash: {transactionHash.current}
          </Box>
        ),
      });

    transactionHash.current = "";
  }, [isSuccess, onCopy, toast]);

  const [formData, setFormData] = useState({
    coin: "",
    recipientAddress: "",
    amount: "",
    memo: "",
  });

  const handleSubmit = (event: FormEvent) => {
    const fee = {
      gas: "150000",
      amount: [{ denom: formData.coin, amount: "30000" }],
    };
    event.preventDefault();

    const sendToken = async () => {
      try {
        const result = await sendTokensAsync({
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
        transactionHash.current = result.transactionHash;
      } catch (error) {
        console.error(error);
      }
    };

    void sendToken();
  };

  return (
    <Stack w="full" spacing={6}>
      <Heading>Send Token</Heading>
      <Stack spacing={4} as="form" onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel>Coin</FormLabel>
          <Select
            placeholder="Select option"
            onChange={(event) =>
              setFormData({
                ...formData,
                coin: event.currentTarget.value,
              })
            }
            value={formData.coin}
          >
            {activeChain?.currencies.map((currency) => (
              <option value={currency.coinMinimalDenom} key={currency.coinMinimalDenom}>
                {currency.coinMinimalDenom}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Sender address</FormLabel>
          <Input type="text" value={data?.bech32Address ?? ""} isDisabled />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Recipient address</FormLabel>
          <Input
            type="text"
            onChange={(event) =>
              setFormData({
                ...formData,
                recipientAddress: event.currentTarget.value,
              })
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            type="text"
            onChange={(event) =>
              setFormData({
                ...formData,
                amount: event.currentTarget.value,
              })
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel>Memo</FormLabel>
          <Input
            type="text"
            onChange={(event) =>
              setFormData({
                ...formData,
                memo: event.currentTarget.value,
              })
            }
          />
        </FormControl>
        <Button width="full" mt={4} type="submit" isLoading={isLoading}>
          Send
        </Button>
      </Stack>
    </Stack>
  );
};

export default SendToken;
