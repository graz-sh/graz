import { Button, Stack, Tag, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { defaultChains, useAccount, useBalance, useConnect, useDisconnect } from "wadesta/src";

export default function HomePage() {
  const account = useAccount();
  const { connect, isLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance, fetchBalance } = useBalance();

  function handleConnect() {
    return account ? disconnect(undefined) : connect(defaultChains.cosmos);
  }

  useEffect(() => {
    if (account) {
      fetchBalance({ address: account.bech32Address, currencies: defaultChains.cosmos.currencies });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <Stack p={4}>
      <Text>
        Account:{" "}
        {account ? (
          <>
            {account.name} <Tag>{account.bech32Address}</Tag>
          </>
        ) : (
          "not connected"
        )}
      </Text>
      {account && (
        <>
          <Text>Balance: </Text>
          {balance?.map((item) => (
            <Text key={item.denom}>
              {item.amount} {item.denom}
            </Text>
          ))}
        </>
      )}

      <Button isLoading={isLoading} onClick={handleConnect}>
        {account ? "Disconnect" : "Connect"} Wallet
      </Button>
    </Stack>
  );
}
