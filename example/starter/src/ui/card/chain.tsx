import { HStack, Skeleton, Spinner, Stack, Text } from "@chakra-ui/react";

export const Card = () => {
  return (
    <Stack
      _hover={{
        bgColor: "blackAlpha.400",
      }}
      bgColor="blackAlpha.300"
      borderRadius={12}
      px={4}
      py={4}
      spacing={4}
    >
      <HStack justifyContent="space-between">
        <HStack>
          <Text fontWeight="bold">cosmoshub-4</Text>
          <Spinner size="sm" />
        </HStack>
        <Text bgColor="blackAlpha.300" borderRadius={8} fontFamily="mono" fontSize="sm" p={1} px={2}>
          address
        </Text>
      </HStack>
      <HStack alignItems="end" justifyContent="space-between">
        <Stack>
          <Skeleton endColor="whiteAlpha.500" isLoaded startColor="whiteAlpha.200">
            <HStack>
              <Text fontFamily="mono" fontWeight="bold">
                10
              </Text>
              <Text fontFamily="mono" fontWeight="semibold">
                atom
              </Text>
            </HStack>
          </Skeleton>
        </Stack>
      </HStack>
    </Stack>
  );
};
