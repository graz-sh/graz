import { Button, FormControl, FormLabel, Heading, Input, Select, Stack, useToast } from "@chakra-ui/react";
import { useAccount, useSendTokens } from "graz";
import type { FormEvent } from "react";
import { useState } from "react";

const SendToken = () => {
  const { data } = useAccount();
  const { sendTokens, isLoading } = useSendTokens({
    onSuccess: () => {
      toast({
        status: "success",
        title: "Send token success",
        description: `Succeed send token to ${formData.recipientAddress}`,
      });
    },
    onError: () => {
      toast({
        status: "error",
        title: "Send token fail",
        description: `Failed send token to ${formData.recipientAddress}`,
      });
    },
  });
  const toast = useToast();
  const [formData, setFormData] = useState({
    coin: "",
    recipientAddress: "",
    amount: "",
    memo: "",
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendTokens({
      recipientAddress: formData.recipientAddress,
      amount: [
        {
          denom: formData.coin,
          amount: formData.amount,
        },
      ],
      fee: "auto",
      memo: formData.memo,
    });
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
          >
            <option value="somm">SOMM</option>
            <option value="osmo">OSMO</option>
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
