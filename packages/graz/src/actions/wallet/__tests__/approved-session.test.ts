import type { SessionTypes } from "@walletconnect/types";
import { describe, expect, it } from "vitest";

import { resolveApprovedChainIds, resolveSession } from "../wallet-connect/approved-session";

const now = 1_700_000_000_000;

const makeSession = (namespaces: SessionTypes.Namespaces, expiry = Math.floor(now / 1000) + 60): SessionTypes.Struct =>
  ({
    expiry,
    namespaces,
    topic: "topic-1",
  }) as SessionTypes.Struct;

describe("resolveApprovedChainIds", () => {
  const scope = {
    accounts: [],
    chainIds: ["cosmoshub-4", "osmosis-1", "neutron-1", "unconfigured-1"],
  };

  it("places requested approved chains first and configured extras after them", () => {
    expect(
      resolveApprovedChainIds(
        scope,
        ["osmosis-1", "rejected-1", "cosmoshub-4"],
        ["neutron-1", "cosmoshub-4", "osmosis-1"],
      ),
    ).toEqual(["osmosis-1", "cosmoshub-4", "neutron-1"]);
  });

  it("returns an empty list without an approved configured chain", () => {
    expect(resolveApprovedChainIds(scope, ["rejected-1"], ["rejected-1"])).toEqual([]);
  });
});

describe("resolveSession", () => {
  it("resolves approved accounts from base and chain-scoped Cosmos namespaces", () => {
    const session = makeSession({
      cosmos: {
        accounts: ["cosmos:cosmoshub-4:cosmos1hub", "not-an-account"],
        events: [],
        methods: [],
      },
      "cosmos:osmosis-1": {
        accounts: ["cosmos:osmosis-1:osmo1account"],
        events: [],
        methods: [],
      },
      eip155: {
        accounts: ["eip155:1:0xabc"],
        events: [],
        methods: [],
      },
    });

    expect(resolveSession(session, { now })).toEqual({
      session,
      scope: {
        accounts: [
          { address: "cosmos1hub", chainId: "cosmoshub-4" },
          { address: "osmo1account", chainId: "osmosis-1" },
        ],
        chainIds: ["cosmoshub-4", "osmosis-1"],
      },
    });
  });

  it("derives chains only from valid approved accounts", () => {
    const session = makeSession({
      cosmos: {
        accounts: ["cosmos:cosmoshub-4:cosmos1hub", "cosmos::missing-chain", "cosmos:osmosis-1:", "eip155:1:0xabc"],
        chains: ["cosmos:cosmoshub-4", "cosmos:osmosis-1"],
        events: [],
        methods: [],
      },
      "cosmos:neutron-1": {
        accounts: ["cosmos:osmosis-1:wrong-scoped-chain"],
        events: [],
        methods: [],
      },
    });

    expect(resolveSession(session, { now })?.scope).toEqual({
      accounts: [{ address: "cosmos1hub", chainId: "cosmoshub-4" }],
      chainIds: ["cosmoshub-4"],
    });
  });

  it("returns undefined without a usable Cosmos account", () => {
    expect(
      resolveSession(
        makeSession({
          cosmos: {
            accounts: [],
            chains: ["cosmos:cosmoshub-4"],
            events: [],
            methods: [],
          },
        }),
        { now },
      ),
    ).toBeUndefined();
  });

  it("matches an existing session when any requested chain is approved", () => {
    const session = makeSession({
      cosmos: {
        accounts: ["cosmos:cosmoshub-4:cosmos1hub", "cosmos:osmosis-1:osmo1account"],
        events: [],
        methods: [],
      },
    });

    expect(resolveSession(session, { chainIds: ["juno-1", "osmosis-1"], now })?.scope.chainIds).toEqual([
      "cosmoshub-4",
      "osmosis-1",
    ]);
    expect(resolveSession(session, { chainIds: ["juno-1"], now })).toBeUndefined();
  });

  it("returns undefined for sessions within the expiry buffer", () => {
    const namespaces = {
      cosmos: {
        accounts: ["cosmos:cosmoshub-4:cosmos1hub"],
        events: [],
        methods: [],
      },
    };

    expect(resolveSession(makeSession(namespaces, Math.floor(now / 1000) + 1), { now })).toBeUndefined();
    expect(resolveSession(makeSession(namespaces, Math.floor(now / 1000) + 2), { now })).toBeDefined();
  });
});
