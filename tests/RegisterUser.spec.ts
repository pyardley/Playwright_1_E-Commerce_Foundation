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
    loginPage,
    signupPage,
    accountCreatedPage,
    accountDeletedPage,
    registrationData,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'New User Signup!' is visible", async () => {
      await clickSignupLoginLink(page, homePage);
      await expect(await loginPage.getNewUserSignUpHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter name and email, click 'Signup', and verify 'ENTER ACCOUNT INFORMATION' is visible", async () => {
      // Step 6: Enter name and email address
      await loginPage.setNewUserNameInput(registrationData.name);
      await loginPage.setNewUserEmailInput(registrationData.email);

      // Step 7: Click 'Signup' button
      await loginPage.clickSignupButton();
      await expect(page).toHaveURL(signupPage.path);

      // Step 8: Verify that 'ENTER ACCOUNT INFORMATION' is visible
      await expect(
        await signupPage.getEnterAccountInformationHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 9-14: Fill account and address details, click 'Create Account', and verify 'ACCOUNT CREATED!' is visible", async () => {
      // Step 9: Fill details: Title, Name, Email, Password, Date of birth
      // (Name and Email were already entered in step 6)
      const setTitle: Record<
        typeof registrationData.title,
        () => Promise<void>
      > = {
        Mr: () => signupPage.setTitleToMr(),
        Mrs: () => signupPage.setTitleToMrs(),
      };
      await setTitle[registrationData.title]();
      await signupPage.setPasswordInput(registrationData.password);
      await signupPage.setDateOfBirth(
        registrationData.birthDate,
        registrationData.birthMonthName,
        registrationData.birthYear,
      );

      // Step 10: Select checkbox 'Sign up for our newsletter!'
      await signupPage.setNewsletterCheckbox(registrationData.newsletter);

      // Step 11: Select checkbox 'Receive special offers from our partners!'
      await signupPage.setOffersCheckbox(registrationData.offers);

      // Step 12: Fill details: First name, Last name, Company, Address, Address2,
      // Country, State, City, Zipcode, Mobile Number
      await signupPage.setFirstNameInput(registrationData.firstname);
      await signupPage.setLastNameInput(registrationData.lastname);
      await signupPage.setCompanyInput(registrationData.company);
      await signupPage.setAddress1Input(registrationData.address1);
      await signupPage.setAddress2Input(registrationData.address2);
      await signupPage.setCountrySelect(registrationData.country);
      await signupPage.setStateInput(registrationData.state);
      await signupPage.setCityInput(registrationData.city);
      await signupPage.setZipcodeInput(registrationData.zipcode);
      await signupPage.setMobileNumberInput(registrationData.mobileNumber);

      // Step 13: Click 'Create Account' button
      await signupPage.clickCreateAccountButton();
      await expect(page).toHaveURL(accountCreatedPage.path);

      // Step 14: Verify that 'ACCOUNT CREATED!' is visible
      await expect(
        await accountCreatedPage.getAccountCreatedHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 15-16: Click 'Continue' button and verify 'Logged in as username' is visible", async () => {
      // Step 15: Click 'Continue' button
      await accountCreatedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path); // back to home page

      // Step 16: Verify that 'Logged in as username' is visible
      expect(await homePage.header.getLoggedInName()).toBe(registrationData.name);
    });

    await test.step("Steps 17-18: Click 'Delete Account' button and verify 'ACCOUNT DELETED!' is visible", async () => {
      await deleteAccountAndVerifyDeleted(page, homePage, accountDeletedPage);
    });

    await test.step("Steps 18 (continued): Click 'Continue' button on the Account Deleted page", async () => {
      // Step 18 (action): Click 'Continue' button
      await accountDeletedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path);
    });
  },
);

// Test Case 5: Register User with existing email
test(
  "Register User with existing email",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, loginPage, signupPage, testUser, registrationData }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Signup / Login' button and verify 'New User Signup!' is visible", async () => {
      await clickSignupLoginLink(page, homePage);
      await expect(await loginPage.getNewUserSignUpHeading()).toBeVisible();
    });

    await test.step("Steps 6-8: Enter name and already registered email, click 'Signup', and Verify error 'Email Address already exist!' is visible", async () => {
      // Step 6: Enter name and already registered email address
      await loginPage.setNewUserNameInput(registrationData.name);
      await loginPage.setNewUserEmailInput(testUser.email); // Created by fixture

      // Step 7: Click 'Signup' button
      await loginPage.clickSignupButton();
      await expect(page).toHaveURL(signupPage.path);

      // Step 8: Verify error 'Email Address already exist!' is visible
      await expect(
        await signupPage.getEmailAddressAlreadyExistError(),
      ).toBeVisible();
    });
  },
);
