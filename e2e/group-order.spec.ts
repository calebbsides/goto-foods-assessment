import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function signInAsHost(context: BrowserContext, page: Page, uid: string) {
  const response = await context.request.post("/api/test/session", {
    data: { uid, name: "Ash", email: `${uid}@example.com` },
  });
  expect(response.ok()).toBeTruthy();
  await page.goto("/");
}

async function startOrder(page: Page): Promise<string> {
  const cta = page.getByRole("button", { name: "Start a group order" });
  const resume = page.getByRole("link", { name: "Resume your order" });
  if (await resume.isVisible().catch(() => false)) {
    await resume.click();
  } else {
    await cta.click();
  }
  await page.waitForURL(/\/orders\/.+/);
  const match = page.url().match(/\/orders\/([^/]+)/);
  return match![1];
}

async function inviteGuest(page: Page, orderId: string): Promise<string> {
  await page.getByPlaceholder("friend@example.com").fill("misty@example.com");
  await page.getByRole("button", { name: "Invite" }).click();
  await expect(page.getByText(/misty@example\.com/)).toBeVisible();

  const response = await page.request.post("/api/test/invite", {
    data: { orderId, email: "misty@example.com" },
  });
  expect(response.ok()).toBeTruthy();
  const { joinUrl } = (await response.json()) as { joinUrl: string };
  return joinUrl;
}

test("host runs a group order end to end", async ({ browser }) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();

  await signInAsHost(hostContext, hostPage, "host-e2e-happy");
  await expect(hostPage.getByRole("button", { name: "Account menu" })).toBeVisible();
  const orderId = await startOrder(hostPage);
  const joinUrl = await inviteGuest(hostPage, orderId);

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  const joinPath = new URL(joinUrl).pathname;
  await guestPage.goto(joinPath);
  await guestPage.getByLabel("Your name").fill("Misty");
  await guestPage.getByRole("button", { name: "Join the order" }).click();
  await guestPage.waitForURL(`**/orders/${orderId}`);

  await guestPage.getByRole("button", { name: /Add/ }).first().click();
  await expect(guestPage.getByText(/1×/).first()).toBeVisible();

  await expect(hostPage.getByText("Misty").first()).toBeVisible({ timeout: 15_000 });

  await hostPage.getByRole("button", { name: /Review and check out/ }).click();
  const dialog = hostPage.getByRole("dialog");
  await expect(dialog.getByText("Order summary")).toBeVisible();
  await dialog.getByRole("button", { name: "Place group order" }).click();
  await hostPage.waitForURL(`**/orders/${orderId}/checkout`);
  await expect(hostPage.getByText("Group order breakdown")).toBeVisible();
  await expect(hostPage.getByText("Order placed")).toBeVisible();
  await expect(hostPage.getByText("Total", { exact: true })).toBeVisible();

  await hostContext.close();
  await guestContext.close();
});

test("a guest cannot reach the host checkout", async ({ browser }) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await signInAsHost(hostContext, hostPage, "host-e2e-authz");
  const orderId = await startOrder(hostPage);

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(`/orders/${orderId}/checkout`);
  await expect(guestPage).toHaveURL(/\/$/);
  await expect(guestPage.getByRole("button", { name: "Sign in" })).toBeVisible();

  await hostContext.close();
  await guestContext.close();
});
