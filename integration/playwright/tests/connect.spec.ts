import { expect, test } from "./fixtures/graz";

test.describe("Graz wallet connection", () => {
  test("boots with injected Keplr support", async ({ page, grazConfig }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Graz Playwright Integration" })).toBeVisible();
    await expect(page.getByTestId("chain-id")).toHaveText(grazConfig.chain.chainId);
    await expect(page.getByTestId("wallet-supported")).toHaveText("true");
    await expect(page.getByTestId("account-status")).toHaveText("disconnected");
  });

  test("connects, disconnects, and reconnects after reload", async ({ page, grazConfig }) => {
    await page.goto("/");
    await page.getByTestId("connect-keplr").click();

    await expect(page.getByTestId("account-status")).toHaveText("connected");
    await expect(page.getByTestId("account-connected")).toHaveText("true");
    await expect(page.getByTestId("active-chain-ids")).toContainText(grazConfig.chain.chainId);
    await expect(page.getByTestId("wallet-calls")).toContainText(`enable:${grazConfig.chain.chainId}`);

    const address = await page.getByTestId("account-address").innerText();
    expect(address.startsWith(`${grazConfig.chain.bech32Prefix}1`)).toBe(true);
    if (grazConfig.chain.expectedAddress) {
      expect(address).toBe(grazConfig.chain.expectedAddress);
    }

    await page.reload();
    await expect(page.getByTestId("account-status")).toHaveText("connected");
    await expect(page.getByTestId("account-address")).toHaveText(address);

    await page.getByTestId("disconnect-keplr").click();
    await expect(page.getByTestId("account-status")).toHaveText("disconnected");
    await expect(page.getByTestId("account-address")).toHaveText("");
  });
});
