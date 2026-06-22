import { expect, test } from "./fixtures/graz";

test.describe("Graz signing", () => {
  test("exposes offline signers and signs Amino and Direct docs", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("connect-keplr").click();

    await expect(page.getByTestId("account-status")).toHaveText("connected");
    await expect(page.getByTestId("offline-signers-ready")).toHaveText("true", { timeout: 30_000 });

    await page.getByTestId("sign-docs").click();

    await expect(page.getByTestId("amino-signature")).not.toHaveText("");
    await expect(page.getByTestId("direct-signature")).not.toHaveText("");
    await expect(page.getByTestId("sign-error")).toHaveText("");
  });
});
