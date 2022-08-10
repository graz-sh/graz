import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Layout from "@theme/Layout";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import clsx from "clsx";
import React from "react";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <img alt="graz logo" height={100} src="img/logo.png" />
        <p className={clsx("hero__subtitle", styles.heroDescription)}>
          graz is a collection of React hooks containing everything you need to start working with the Cosmos ecosystem.
        </p>
      </div>
    </header>
  );
}

// eslint-disable-next-line import/no-default-export
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      description="Graz is a collection of React hooks containing everything you need to start working with the Cosmos ecosystem"
      title="React hooks for Cosmos"
    >
      <HomepageHeader />
      <main>
        <div className={styles.installContainer}>
          <Tabs>
            <TabItem default label="yarn" value="yarn">
              <div className={styles.installContainerCode}>yarn add graz</div>
            </TabItem>
            <TabItem label="npm" value="npm">
              <div className={styles.installContainerCode}>npm install graz</div>
            </TabItem>
          </Tabs>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
