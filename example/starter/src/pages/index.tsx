import { Heading, List, ListItem, Stack } from "@chakra-ui/react";
import { useAccount } from "graz";

import { ChainSwitcher } from "../ui/wallet/chain-switcher";
import { RecentChain } from "../ui/wallet/recent-chain";

const HomePage = () => {
  const {
    data: accountData,
    isConnecting,
    isReconnecting,
  } = useAccount({
    multiChain: true,
  });
  console.log("ccc", accountData);
  return (
    <Stack w="full" gap={2}>
      {!accountData && (isConnecting || isReconnecting) ? <RecentChain /> : null}
      {accountData ? (
        <>
          <Heading size="lg">Chains: </Heading>
          <List>
            {Object.entries(accountData).map(([chainId, account]) => (
              <ListItem key={chainId}>
                {chainId} - address: <b>{account?.bech32Address}</b>
              </ListItem>
            ))}
          </List>
          <ChainSwitcher />
        </>
      ) : null}
    </Stack>
  );
};

export default HomePage;
