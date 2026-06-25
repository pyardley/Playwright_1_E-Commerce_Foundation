import { test, expect } from "@fixtures/fixtures";
import { navigateToHomeAndVerify } from "@support/steps";

// Test Case 10: Verify Subscription in home page
test(
  "Verify Subscription in home page",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      // Step 2: Navigate to url 'http://automationexercise.com'
      // Step 3: Verify that home page is visible successfully
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Scroll down to footer and Verify text 'SUBSCRIPTION'", async () => {
      // Step 4: Scroll down to footer
      // Step 5: Verify text 'SUBSCRIPTION'
      await expect(await homePage.footer.getSubscriptionHeader()).toBeVisible();
    });

    await test.step("Steps 6-7: Enter email address in input and click arrow button and Verify success message 'You have been successfully subscribed!' is visible", async () => {
      // Step 6:Enter email address in input and click arrow button
      await homePage.footer.setSubscriptionInput("test@test.com");
      await homePage.footer.clickSubscribeButton();

      // Step 7:Verify success message 'You have been successfully subscribed!' is visible
      await expect(await homePage.footer.getSubscribedMessage()).toBeVisible();
    });
  },
);
