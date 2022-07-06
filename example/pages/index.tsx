import {
  Button,
  ButtonGroup,
  IconButton,
  ListItem,
  Spinner,
  Stack,
  Tag,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { defaultChains, useAccount, useActiveChain, useBalances, useConnect, useDisconnect } from "graz";

export default function HomePage() {
  const toast = useToast();

  const {
    data: accountData,
    isConnected,
    isConnecting,
    isReconnecting,
    reconnect,
    status,
  } = useAccount({
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

  const activeChain = useActiveChain();

  const { data: balances, isFetching: isBalancesFetching, refetch } = useBalances();

  const { connect, isSupported } = useConnect({
    onSuccess: () => {
      console.log("wallet connected");
    },
  });

  const { disconnect } = useDisconnect({
    onSuccess: () => {
      console.log("wallet disconnected");
    },
  });

  function handleConnect() {
    return isConnected ? disconnect(undefined) : connect(defaultChains.cosmos);
  }

  return (
    <Stack p={4}>
      <Text>{status}</Text>
      <Text>Account Name: {accountData ? accountData.name : status}</Text>
      {accountData && (
        <>
          <Text>
            Address: <Tag>{accountData.bech32Address}</Tag>
          </Text>
          <Text>
            Connected to <Tag>{activeChain?.chainId}</Tag>
          </Text>
        </>
      )}

      {accountData &&
        (isBalancesFetching ? (
          <Spinner />
        ) : (
          <>
            <Text>
              Balances: <IconButton aria-label="refresh" icon={<>🔄</>} onClick={() => void refetch()} />
            </Text>
            <UnorderedList>
              {balances?.map((item) => (
                <ListItem key={item.denom}>
                  {item.amount} {item.denom}
                </ListItem>
              ))}
            </UnorderedList>
          </>
        ))}
      <ButtonGroup isAttached>
        <Button isDisabled={!isSupported} isLoading={isConnecting || isReconnecting} onClick={handleConnect}>
          {accountData ? "Disconnect" : "Connect"} Wallet
        </Button>
        {accountData && <IconButton aria-label="refresh" icon={<>🔄</>} onClick={reconnect} />}
      </ButtonGroup>
    </Stack>
  );
}
