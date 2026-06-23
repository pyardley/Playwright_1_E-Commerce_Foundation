import { test, expect } from "@fixtures/fixtures";

// Test Case 1: Register User
test("Register User", { tag: ['@smoke', '@e2e'] }, async ({
  page,
  homePage,
  login,
  signup,
  accountCreated,
  accountDeleted,
}) => {
  // Step 1: Launch browser
  // Handled automatically by Playwright's `page` fixture - no action needed.

  await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
    // Step 2: Navigate to url 'http://automationexercise.com'
    await homePage.goto();

    // Step 3: Verify that home page is visible successfully
    await expect(page).toHaveURL("/");
    const homeLink = await homePage.header.getHomeLink();
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveCSS("color", "rgb(255, 165, 0)");
  });

  await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'New User Signup!' is visible", async () => {
    // Step 4: Click on 'Signup / Login' button
    await homePage.header.clickLoginLink();
    await expect(page).toHaveURL("/login");

    // Step 5: Verify 'New User Signup!' is visible
    await expect(await login.getNewUserSignUpHeading()).toBeVisible();
  });

  await test.step("Steps 6-8: Enter name and email, click 'Signup', and verify 'ENTER ACCOUNT INFORMATION' is visible", async () => {
    // Step 6: Enter name and email address
    await login.setNewUserNameInput("John Doe");
    await login.setNewUserEmailInput(`john.doe.${Date.now()}@example.com`);

    // Step 7: Click 'Signup' button
    await login.clickSignupButton();
    await expect(page).toHaveURL("/signup");

    // Step 8: Verify that 'ENTER ACCOUNT INFORMATION' is visible
    await expect(await signup.getEnterAccountInformationHeading()).toBeVisible();
  });

  await test.step("Steps 9-14: Fill account and address details, click 'Create Account', and verify 'ACCOUNT CREATED!' is visible", async () => {
    // Step 9: Fill details: Title, Name, Email, Password, Date of birth
    // (Name and Email were already entered in step 6)
    await signup.setTitleToMr();
    await signup.setPasswordInput("password123");
    await signup.setDateOfBirth("1", "January", "1990");

    // Step 10: Select checkbox 'Sign up for our newsletter!'
    await signup.setNewsletterCheckbox(true);

    // Step 11: Select checkbox 'Receive special offers from our partners!'
    await signup.setOffersCheckbox(true);

    // Step 12: Fill details: First name, Last name, Company, Address, Address2,
    // Country, State, City, Zipcode, Mobile Number
    await signup.setFirstNameInput("John");
    await signup.setLastNameInput("Doe");
    await signup.setCompanyInput("Example Inc.");
    await signup.setAddress1Input("123 Main St");
    await signup.setAddress2Input("Apt 4B");
    await signup.setCountrySelect("United States");
    await signup.setStateInput("California");
    await signup.setCityInput("Los Angeles");
    await signup.setZipcodeInput("90001");
    await signup.setMobileNumberInput("+1-555-123-4567");

    // Step 13: Click 'Create Account' button
    await signup.clickCreateAccountButton();
    await expect(page).toHaveURL("/account_created");

    // Step 14: Verify that 'ACCOUNT CREATED!' is visible
    await expect(await accountCreated.getAccountCreatedHeading()).toBeVisible();
  });

  await test.step("Steps 15-16: Click 'Continue' button and verify 'Logged in as username' is visible", async () => {
    // Step 15: Click 'Continue' button
    await accountCreated.clickContinueButton();
    await expect(page).toHaveURL("/"); // back to home page

    // Step 16: Verify that 'Logged in as username' is visible
    expect(await homePage.header.getLoggedInName()).toBe("John Doe");
  });

  await test.step("Steps 17-18: Click 'Delete Account' button and verify 'ACCOUNT DELETED!' is visible", async () => {
    // Step 17: Click 'Delete Account' button
    await homePage.header.clickDeleteAccountLink();
    await expect(page).toHaveURL("/delete_account");

    // Step 18 (verification): Verify that 'ACCOUNT DELETED!' is visible
    await expect(await accountDeleted.getAccountDeletedHeading()).toBeVisible();
  });

  await test.step("Steps 18 (continued): Click 'Continue' button on the Account Deleted page", async () => {
    // Step 18 (action): Click 'Continue' button
    await accountDeleted.clickContinueButton();
    await expect(page).toHaveURL("/");
  });
});
