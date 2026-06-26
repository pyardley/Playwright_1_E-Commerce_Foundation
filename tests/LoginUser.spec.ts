import { test, expect } from "@fixtures/fixtures";
import {
  navigateToHomeAndVerify,
  clickSignupLoginLink,
  loginAsTestUserAndVerifyLoggedIn,
  deleteAccountAndVerifyDeleted,
} from "@support/steps";

// Test Case 2: Login User with correct email and password
test(
  "Login User with correct email and password",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, loginPage, accountDeletedPage, testUser }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.
    // The `testUser` fixture registers an account via the API beforehand,
    // since this test exercises login, not registration.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'Login to your account' is visible", async () => {
      await clickSignupLoginLink(page, homePage);
      await expect(await loginPage.getLoginToYourAccountHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter correct email address and password, click 'login' and verify that 'Logged in as username' is visible", async () => {
      await loginAsTestUserAndVerifyLoggedIn(page, loginPage, homePage, testUser);
    });

    await test.step("Steps 9-10: Click 'Delete Account' button and verify 'ACCOUNT DELETED!' is visible", async () => {
      await deleteAccountAndVerifyDeleted(
        page,
        homePage.header,
        accountDeletedPage,
      );
    });
  },
);

// Test Case 3: Login User with incorrect email and password
test(
  "Login User with incorrect email and password",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, loginPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.
    // No `testUser` fixture needed here - this test logs in with a
    // deliberately invalid email, so no real account needs to exist.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'Login to your account' is visible", async () => {
      await clickSignupLoginLink(page, homePage);
      await expect(await loginPage.getLoginToYourAccountHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter incorrect email address and password, click 'login' and Verify error 'Your email or password is incorrect!' is visible", async () => {
      // Step 6: Enter incorrect email address and password
      await loginPage.setEmailInput("invalid@email.com");
      await loginPage.setPasswordInput("password");

      // Step 7: Click 'login' button
      await loginPage.clickLoginButton();
      await expect(page).toHaveURL(loginPage.path); //Still on login page

      // Step 8: Verify error 'Your email or password is incorrect!' is visible
      await expect(await loginPage.getEmailOrPasswordInvalidError()).toBeVisible();
    });
  },
);

// Test Case 4: Logout User
test(
  "Logout User",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, loginPage, testUser }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.
    // The `testUser` fixture registers an account via the API beforehand,
    // since this test exercises login, not registration.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'Login to your account' is visible", async () => {
      await clickSignupLoginLink(page, homePage);
      await expect(await loginPage.getLoginToYourAccountHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter correct email address and password, click 'login' and verify that 'Logged in as username' is visible", async () => {
      await loginAsTestUserAndVerifyLoggedIn(page, loginPage, homePage, testUser);
    });

    await test.step("Steps 9-10: Click 'Logout' button and Verify that user is navigated to login page", async () => {
      // Step 9: Click 'Logout' button
      await homePage.header.clickLogoutLink();

      // Step 10: Verify that user is navigated to login page
      await expect(page).toHaveURL(loginPage.path);
    });
  },
);
