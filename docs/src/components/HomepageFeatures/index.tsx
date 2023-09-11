import clsx from "clsx";
import type { FC } from "react";
import React from "react";

import styles from "./styles.module.css";

const HomepageFeatures: FC = () => {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx("col col--8 col--offset-2")}>
            <h1>Features</h1>
            <ul>
              <li>
                🪝 20+ hooks for interfacing with wallets, clients, signers, etc. (connecting, view balances, send
                tokens, etc.)
              </li>
              <li>💳 Multiple wallet supports (Keplr, Leap, Cosmostation, Vectis, Metamask Snap, WalletConnect)</li>
              <li>
                ⚙️ Generate mainnet & testnet <code>ChainInfo</code>
              </li>
              <li>
                📚 Built-in caching, request deduplication, and all the good stuff from @tanstack/react-query and
                zustand
              </li>
              <li>🔄 Auto refresh on wallet and network change</li>
              <li>👏 Fully typed and tree-shakeable</li>
              <li>...and many more ✨</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageFeatures;
