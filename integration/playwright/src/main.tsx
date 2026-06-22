import { createRoot } from "react-dom/client";

import { App } from "./App";
import { installTestKeplrWalletFromWindow } from "./e2e-wallet/install-keplr";

installTestKeplrWalletFromWindow();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element is missing");
}

createRoot(root).render(<App />);
