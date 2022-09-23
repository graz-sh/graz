import clsx from "clsx";
import React from "react";

import styles from "./styles.module.css";

// eslint-disable-next-line import/no-default-export
export default function HomepageFeatures(): JSX.Element {
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
              <li>💳 Multiple wallet supports</li>
              <li>⚙️ Generate mainnet & testnet `ChainInfo`</li>
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
}
