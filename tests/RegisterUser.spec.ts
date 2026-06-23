import { test, expect } from "@fixtures/fixtures";

test("Register User", async ({
  page,
  header,
  login,
  signup,
  accountCreated,
  accountDeleted,
}) => {
  await test.step("Go to Home Page: home link is visible and styled", async () => {
    await page.goto("/");
    await expect(page).toHaveURL("/");

    const homeLink = await header.getHomeLink();
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveCSS("color", "rgb(255, 165, 0)");
  });

  await test.step("Go to Login Page: 'New User Signup!' is visible", async () => {
    await header.clickLoginLink();
    await expect(page).toHaveURL("/login");

    expect(await login.getNewUserSignUpHeaderText()).toBe("New User Signup!");
  });

  await test.step("Enter name and email address: 'ENTER ACCOUNT INFORMATION' is visible", async () => {
    await login.setNewUserNameInput("John Doe");
    await login.setNewUserEmailInput(`john.doe.${Date.now()}@example.com`);
    await login.clickSignupButton();

    await expect(page).toHaveURL("/signup");
    expect(await signup.getEnterAccountInformationHeadingText()).toBe(
      "Enter Account Information",
    );
  });

  await test.step("Enter all details to create account", async () => {
    await signup.setTitleToMr();
    await signup.setPasswordInput("password123");
    await signup.setDateOfBirth("1", "January", "1990");
    await signup.setNewsletterCheckbox(true);
    await signup.setOffersCheckbox(true);

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

    await signup.clickCreateAccountButton();

    await expect(page).toHaveURL("/account_created");
    expect(await accountCreated.getAccountCreatedHeadingText()).toBe(
      "Account Created!",
    );
  });

  await test.step("Click continue: logged in as John Doe", async () => {
    await accountCreated.clickContinueButton();

    await expect(page).toHaveURL("/"); // back to home page
    expect(await header.getLoggedInName()).toBe("John Doe");
  });

  await test.step("Delete Account: 'Account Deleted!' is shown", async () => {
    await header.clickDeleteAccountLink();

    await expect(page).toHaveURL("/delete_account");
    expect(await accountDeleted.getAccountDeletedHeadingText()).toBe(
      "Account Deleted!",
    );
  });

  await test.step("Click Continue: Back to home page", async () => {
    await accountDeleted.clickContinueButton();
    await expect(page).toHaveURL("/");
  });
});
