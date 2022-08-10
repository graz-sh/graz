import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Layout from "@theme/Layout";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import clsx from "clsx";
import React from "react";

import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <img alt="graz logo" className={styles.heroImage} src="img/logo.png" />
        <div className={clsx("hero__subtitle", styles.badge)}>
          <a href="https://www.npmjs.com/package/graz" rel="noopener" target="_blank">
            <img alt="versions badge" src="https://badgen.net/npm/v/graz" />
          </a>
          <a href="https://www.npmjs.com/package/graz" rel="noopener" target="_blank">
            <img alt="downloads badge" src="https://badgen.net/npm/dt/graz" />
          </a>
          <a href="https://github.com/strangelove-ventures/graz" rel="noopener" target="_blank">
            <img alt="stars badge" src="https://badgen.net/github/stars/strangelove-ventures/graz" />
          </a>
        </div>

        <p className={clsx("hero__subtitle", styles.heroDescription)}>
          graz is a collection of React hooks containing everything you need to start working with the Cosmos ecosystem.
        </p>
      </div>
    </header>
  );
}

// eslint-disable-next-line import/no-default-export
export default function Home(): JSX.Element {
  return (
    <Layout
      description="graz is a collection of React hooks containing everything you need to start working with the Cosmos ecosystem"
      title="React hooks for Cosmos"
    >
      <HomepageHeader />
      <main>
        <div className={clsx("install-container", styles.installContainer)}>
          <Tabs>
            <TabItem default label="yarn" value="yarn">
              <div className={styles.installContainerCode}>yarn add graz</div>
            </TabItem>
            <TabItem label="npm" value="npm">
              <div className={styles.installContainerCode}>npm install graz</div>
            </TabItem>
            <TabItem label="pnpm" value="pnpm">
              <div className={styles.installContainerCode}>pnpm add graz</div>
            </TabItem>
          </Tabs>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
