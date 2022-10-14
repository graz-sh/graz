import { Button, useColorMode } from "@chakra-ui/react";

export const ToggleTheme = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button leftIcon={<>{colorMode === "dark" ? "🌑" : "☀️"}</>} onClick={toggleColorMode} size="xs" variant="outline">
      {colorMode} mode
    </Button>
  );
};
