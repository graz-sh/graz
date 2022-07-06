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

  const { data: account, isConnected, isConnecting, isReconnecting, reconnect, status } = useAccount();
  const { data: balances, isFetching: isBalancesFetching, refetch } = useBalances();
  const activeChain = useActiveChain();
  const { connect } = useConnect({
    onSuccess: (_account) => {
      toast({
        status: "success",
        title: "Wallet connected!",
        description: `Connected as ${_account.name}`,
      });
    },
  });
  const { disconnect } = useDisconnect({
    onSuccess: () => {
      toast({
        status: "info",
        title: "Wallet disconnected!",
      });
    },
  });

  function handleConnect() {
    return isConnected ? disconnect(undefined) : connect(defaultChains.cosmos);
  }

  return (
    <Stack p={4}>
      <Text>Account Name: {account ? account.name : status}</Text>
      {account && (
        <>
          <Text>
            Address: <Tag>{account.bech32Address}</Tag>
          </Text>
          <Text>
            Connected to <Tag>{activeChain?.chainId}</Tag>
          </Text>
        </>
      )}

      {account &&
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
        <Button isLoading={isConnecting || isReconnecting} onClick={handleConnect}>
          {account ? "Disconnect" : "Connect"} Wallet
        </Button>
        {account && <IconButton aria-label="refresh" icon={<>🔄</>} onClick={reconnect} />}
      </ButtonGroup>
    </Stack>
  );
}
