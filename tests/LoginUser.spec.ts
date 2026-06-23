import { test, expect } from "@fixtures/fixtures";

// Test Case 2: Login User with correct email and password
test(
  "Login User with correct email and password",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, login, accountDeleted, testUser }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.
    // The `testUser` fixture registers an account via the API beforehand,
    // since this test exercises login, not registration.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      // Step 2: Navigate to url 'http://automationexercise.com'
      await homePage.goto();

      // Step 3: Verify that home page is visible successfully
      await expect(page).toHaveURL("/");
      const homeLink = await homePage.header.getHomeLink();
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveCSS("color", "rgb(255, 165, 0)");
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'Login to your account' is visible", async () => {
      // Step 4: Click on 'Signup / Login' button
      await homePage.header.clickLoginLink();
      await expect(page).toHaveURL("/login");

      // Step 5: Verify 'Login to your account' is visible
      await expect(await login.getLoginToYourAccountHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter correct email address and password, click 'login' and verify that 'Logged in as username' is visible", async () => {
      // Step 6: Enter correct email address and password
      await login.setEmailInput(testUser.email);
      await login.setPasswordInput(testUser.password);

      // Step 7: Click 'login' button
      await login.clickLoginButton();
      await expect(page).toHaveURL("/");

      // Step 8: Verify that 'Logged in as username' is visible
      expect(await homePage.header.getLoggedInName()).toBe(testUser.name);
    });

    await test.step("Steps 9-10: Click 'Delete Account' button and verify 'ACCOUNT DELETED!' is visible", async () => {
      // Step 9: Click 'Delete Account' button
      await homePage.header.clickDeleteAccountLink();
      await expect(page).toHaveURL("/delete_account");

      // Step 10: Verify that 'ACCOUNT DELETED!' is visible
      await expect(
        await accountDeleted.getAccountDeletedHeading(),
      ).toBeVisible();
    });
  },
);

// Test Case 3: Login User with incorrect email and password
test(
  "Login User with incorrect email and password",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, login }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.
    // No `testUser` fixture needed here - this test logs in with a
    // deliberately invalid email, so no real account needs to exist.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      // Step 2: Navigate to url 'http://automationexercise.com'
      await homePage.goto();

      // Step 3: Verify that home page is visible successfully
      await expect(page).toHaveURL("/");
      const homeLink = await homePage.header.getHomeLink();
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveCSS("color", "rgb(255, 165, 0)");
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'Login to your account' is visible", async () => {
      // Step 4: Click on 'Signup / Login' button
      await homePage.header.clickLoginLink();
      await expect(page).toHaveURL("/login");

      // Step 5: Verify 'Login to your account' is visible
      await expect(await login.getLoginToYourAccountHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter incorrect email address and password, click 'login' and Verify error 'Your email or password is incorrect!' is visible", async () => {
      // Step 6: Enter incorrect email address and password
      await login.setEmailInput("invalid@email.com");
      await login.setPasswordInput("password");

      // Step 7: Click 'login' button
      await login.clickLoginButton();
      await expect(page).toHaveURL("/login"); //Still on login page

      // Step 8: Verify error 'Your email or password is incorrect!' is visible
      await expect(await login.getEmailOrPasswordInvalidError()).toBeVisible();
    });
  },
);

// Test Case 4: Logout User
test(
  "Logout User",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, login, testUser }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.
    // The `testUser` fixture registers an account via the API beforehand,
    // since this test exercises login, not registration.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      // Step 2: Navigate to url 'http://automationexercise.com'
      await homePage.goto();

      // Step 3: Verify that home page is visible successfully
      await expect(page).toHaveURL("/");
      const homeLink = await homePage.header.getHomeLink();
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveCSS("color", "rgb(255, 165, 0)");
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'Login to your account' is visible", async () => {
      // Step 4: Click on 'Signup / Login' button
      await homePage.header.clickLoginLink();
      await expect(page).toHaveURL("/login");

      // Step 5: Verify 'Login to your account' is visible
      await expect(await login.getLoginToYourAccountHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter correct email address and password, click 'login' and verify that 'Logged in as username' is visible", async () => {
      // Step 6: Enter correct email address and password
      await login.setEmailInput(testUser.email);
      await login.setPasswordInput(testUser.password);

      // Step 7: Click 'login' button
      await login.clickLoginButton();
      await expect(page).toHaveURL("/");

      // Step 8: Verify that 'Logged in as username' is visible
      expect(await homePage.header.getLoggedInName()).toBe(testUser.name);
    });

    await test.step("Steps 9-10: Click 'Logout' button and Verify that user is navigated to login page", async () => {
      // Step 9: Click 'Logout' button
      await homePage.header.clickLogoutLink();

      // Step 10: Verify that user is navigated to login page
      await expect(page).toHaveURL("/login");
    });
  },
);
