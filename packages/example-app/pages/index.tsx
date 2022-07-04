import { Button, Spinner, Stack, Tag, Text } from "@chakra-ui/react";
import { osmosisTestnet } from "constants/chains";
import { useEffect } from "react";
import { getAllChains, useAccount, useBalance, useConnect, useDisconnect } from "wadesta";

export default function HomePage() {
  const { account, activeChain } = useAccount();
  const { connect, isLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance, fetchBalance, isLoading: isBalanceLoading } = useBalance();

  function handleConnect() {
    return account ? disconnect(undefined) : connect(osmosisTestnet);
  }

  const connectedChain = getAllChains().find((item) => item.chainId === activeChain?.chainId);

  useEffect(() => {
    if (account) {
      fetchBalance({});
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
          <Text>Connected to {connectedChain?.chainName}</Text>
          <Text>
            Balance: <Button onClick={() => fetchBalance({})}> Refetch balance </Button>
          </Text>
          <Stack>
            {isBalanceLoading ? (
              <Spinner />
            ) : (
              balance?.map((item) => (
                <Text key={item.denom}>
                  {item.amount} {item.denom}
                </Text>
              ))
            )}
          </Stack>
        </>
      )}

      <Button isLoading={isLoading} onClick={handleConnect}>
        {account ? "Disconnect" : "Connect"} Wallet
      </Button>
    </Stack>
  );
}
