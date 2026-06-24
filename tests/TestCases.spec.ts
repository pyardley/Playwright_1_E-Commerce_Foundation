import { test, expect } from "@fixtures/fixtures";
import { navigateToHomeAndVerify } from "@support/steps";

// Test Case 7: Verify Test Cases Page
test(
  "Verify Test Cases Page",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, testCases }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click on 'Test Cases' button and Verify user is navigated to test cases page successfully", async () => {
      // Step 4: Click on 'Test Cases' button
      await homePage.header.clickTestCasesLink();

      // Step 5: Verify user is navigated to test cases page successfully
      await expect(page).toHaveURL(testCases.path);
      await expect(await testCases.getTestCasesHeading()).toBeVisible();
    });
  },
);
