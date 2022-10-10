import { Button, FormControl, FormLabel, Heading, Input, Select, Stack } from "@chakra-ui/react";

const SendToken = () => {
  return (
    <Stack w="full" spacing={6}>
      <Heading>Send Token</Heading>
      <form>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Coin</FormLabel>
            <Select placeholder="Select option">
              <option value="SOMM">SOMM</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Sender address</FormLabel>
            <Input type="text" />
          </FormControl>
          <FormControl>
            <FormLabel>Recipient address</FormLabel>
            <Input type="text" />
          </FormControl>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input type="text" />
          </FormControl>
          <FormControl>
            <FormLabel>Memo</FormLabel>
            <Input type="text" />
          </FormControl>
          <Button width="full" mt={4} type="submit">
            Send
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default SendToken;
