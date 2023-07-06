import "./index.css";

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { GrazProvider } from "graz";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GrazProvider>
      <App />
    </GrazProvider>
  </React.StrictMode>
);
