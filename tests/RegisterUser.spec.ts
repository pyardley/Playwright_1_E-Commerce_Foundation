import { test, expect } from "@fixtures/fixtures";
import {
  navigateToHomeAndVerify,
  clickSignupLoginLink,
  deleteAccountAndVerifyDeleted,
} from "@support/steps";

// Test Case 1: Register User
test(
  "Register User",
  { tag: ["@smoke", "@e2e"] },
  async ({
    page,
    homePage,
    login,
    signup,
    accountCreated,
    accountDeleted,
    registrationData,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'New User Signup!' is visible", async () => {
      await clickSignupLoginLink(page, homePage);
      await expect(await login.getNewUserSignUpHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter name and email, click 'Signup', and verify 'ENTER ACCOUNT INFORMATION' is visible", async () => {
      // Step 6: Enter name and email address
      await login.setNewUserNameInput(registrationData.name);
      await login.setNewUserEmailInput(registrationData.email);

      // Step 7: Click 'Signup' button
      await login.clickSignupButton();
      await expect(page).toHaveURL(signup.path);

      // Step 8: Verify that 'ENTER ACCOUNT INFORMATION' is visible
      await expect(
        await signup.getEnterAccountInformationHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 9-14: Fill account and address details, click 'Create Account', and verify 'ACCOUNT CREATED!' is visible", async () => {
      // Step 9: Fill details: Title, Name, Email, Password, Date of birth
      // (Name and Email were already entered in step 6)
      const setTitle: Record<typeof registrationData.title, () => Promise<void>> = {
        Mr: () => signup.setTitleToMr(),
        Mrs: () => signup.setTitleToMrs(),
      };
      await setTitle[registrationData.title]();
      await signup.setPasswordInput(registrationData.password);
      await signup.setDateOfBirth(
        registrationData.birthDate,
        registrationData.birthMonthName,
        registrationData.birthYear,
      );

      // Step 10: Select checkbox 'Sign up for our newsletter!'
      await signup.setNewsletterCheckbox(registrationData.newsletter);

      // Step 11: Select checkbox 'Receive special offers from our partners!'
      await signup.setOffersCheckbox(registrationData.offers);

      // Step 12: Fill details: First name, Last name, Company, Address, Address2,
      // Country, State, City, Zipcode, Mobile Number
      await signup.setFirstNameInput(registrationData.firstname);
      await signup.setLastNameInput(registrationData.lastname);
      await signup.setCompanyInput(registrationData.company);
      await signup.setAddress1Input(registrationData.address1);
      await signup.setAddress2Input(registrationData.address2);
      await signup.setCountrySelect(registrationData.country);
      await signup.setStateInput(registrationData.state);
      await signup.setCityInput(registrationData.city);
      await signup.setZipcodeInput(registrationData.zipcode);
      await signup.setMobileNumberInput(registrationData.mobileNumber);

      // Step 13: Click 'Create Account' button
      await signup.clickCreateAccountButton();
      await expect(page).toHaveURL(accountCreated.path);

      // Step 14: Verify that 'ACCOUNT CREATED!' is visible
      await expect(
        await accountCreated.getAccountCreatedHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 15-16: Click 'Continue' button and verify 'Logged in as username' is visible", async () => {
      // Step 15: Click 'Continue' button
      await accountCreated.clickContinueButton();
      await expect(page).toHaveURL(homePage.path); // back to home page

      // Step 16: Verify that 'Logged in as username' is visible
      expect(await homePage.header.getLoggedInName()).toBe(registrationData.name);
    });

    await test.step("Steps 17-18: Click 'Delete Account' button and verify 'ACCOUNT DELETED!' is visible", async () => {
      await deleteAccountAndVerifyDeleted(page, homePage, accountDeleted);
    });

    await test.step("Steps 18 (continued): Click 'Continue' button on the Account Deleted page", async () => {
      // Step 18 (action): Click 'Continue' button
      await accountDeleted.clickContinueButton();
      await expect(page).toHaveURL(homePage.path);
    });
  },
);

// Test Case 5: Register User with existing email
test(
  "Register User with existing email",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, login, signup, testUser, registrationData }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'New User Signup!' is visible", async () => {
      await clickSignupLoginLink(page, homePage);
      await expect(await login.getNewUserSignUpHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter name and already registered email, click 'Signup', and Verify error 'Email Address already exist!' is visible", async () => {
      // Step 6: Enter name and already registered email address
      await login.setNewUserNameInput(registrationData.name);
      await login.setNewUserEmailInput(testUser.email); // Created by fixture

      // Step 7: Click 'Signup' button
      await login.clickSignupButton();
      await expect(page).toHaveURL(signup.path);

      // Step 8: Verify error 'Email Address already exist!' is visible
      await expect(
        await signup.getEmailAddressAlreadyExistError(),
      ).toBeVisible();
    });
  },
);
