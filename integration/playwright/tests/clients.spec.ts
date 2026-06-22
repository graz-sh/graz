import { expect, test } from "./fixtures/graz";

test.describe("Graz clients", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("connect-keplr").click();
    await expect(page.getByTestId("account-status")).toHaveText("connected");
  });

  test("creates a Stargate client and reads block height", async ({ page }) => {
    await page.getByTestId("load-stargate-client").click();

    await expect
      .poll(async () => Number(await page.getByTestId("client-height").innerText()), { timeout: 30_000 })
      .toBeGreaterThan(0);
    await expect(page.getByTestId("client-error")).toHaveText("");
  });

  test("creates a Stargate signing client without broadcasting", async ({ page }) => {
    await page.getByTestId("load-signing-client").click();

    await expect(page.getByTestId("signing-client-ready")).toHaveText("true", { timeout: 30_000 });
  });
});
