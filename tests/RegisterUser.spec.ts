import { test, expect } from "@fixtures/fixtures";
import {
  navigateToHomeAndVerify,
  clickSignupLoginLink,
  deleteAccountAndVerifyDeleted,
  enterNameAndEmailThenSignup,
  fillSignupFormAndCreateAccount,
  verifyAddressMatchesRegistrationData,
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
      // Steps 6-7: Enter name and email address, click 'Signup' button
      await enterNameAndEmailThenSignup(
        page,
        loginPage,
        signupPage,
        registrationData.name,
        registrationData.email,
      );

      // Step 8: Verify that 'ENTER ACCOUNT INFORMATION' is visible
      await expect(
        await signupPage.getEnterAccountInformationHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 9-14: Fill account and address details, click 'Create Account', and verify 'ACCOUNT CREATED!' is visible", async () => {
      // Steps 9-14: Fill details, click 'Create Account', verify 'ACCOUNT CREATED!'
      await fillSignupFormAndCreateAccount(
        page,
        signupPage,
        accountCreatedPage,
        registrationData,
      );
    });

    await test.step("Steps 15-16: Click 'Continue' button and verify 'Logged in as username' is visible", async () => {
      // Step 15: Click 'Continue' button
      await accountCreatedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path); // back to home page

      // Step 16: Verify that 'Logged in as username' is visible
      expect(await homePage.header.getLoggedInName()).toBe(
        registrationData.name,
      );
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
  async ({
    page,
    homePage,
    loginPage,
    signupPage,
    testUser,
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

    await test.step("Steps 6-8: Enter name and already registered email, click 'Signup', and Verify error 'Email Address already exist!' is visible", async () => {
      // Steps 6-7: Enter name and already registered email address, click 'Signup'
      await enterNameAndEmailThenSignup(
        page,
        loginPage,
        signupPage,
        registrationData.name,
        testUser.email, // Created by fixture
      );

      // Step 8: Verify error 'Email Address already exist!' is visible
      await expect(
        await signupPage.getEmailAddressAlreadyExistError(),
      ).toBeVisible();
    });
  },
);

// Test Case 14: Place Order: Register while Checkout
test(
  "Place Order: Register while Checkout",
  { tag: ["@smoke", "@e2e"] },
  async ({
    page,
    homePage,
    cartPage,
    loginPage,
    signupPage,
    accountCreatedPage,
    checkoutPage,
    registrationData,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    const addedProduct = await test.step(
      "Steps 4-6: Add products to cart, Click 'Cart' button and Verify that cart page is displayed",
      async () => {
        // Step 3: 4. Add products to cart
        const productCard = await homePage.productList.getProductCard(0);
        const summary = await productCard.getSummary();
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();

        // Step 5: Click 'Cart' button
        await homePage.header.clickCartLink();

        // Step 6: Verify that cart page is displayed
        await expect(page).toHaveURL(cartPage.path);

        return summary;
      },
    );

    await test.step("Steps 7: Click Proceed To Checkout and verify checkout modal", async () => {
      // Step 7: Click Proceed To Checkout
      await cartPage.clickProceedToCheckoutBtn();

      const checkoutModal = await cartPage.getCheckoutModal();
      await expect(await checkoutModal.getHeading()).toBeVisible();
    });

    await test.step("Steps 8: Click 'Register / Login' button and Verify on Login page", async () => {
      // Step 8:Click 'Register / Login' button
      const checkoutModal = await cartPage.getCheckoutModal();
      await checkoutModal.clickRegisterLoginLink();

      await expect(await loginPage.getNewUserSignUpHeading()).toBeVisible();
    });

    await test.step("Steps 9-10: Fill all details in Signup and create account, Verify 'ACCOUNT CREATED!' and click 'Continue' button", async () => {
      // Step 9: Fill all details in Signup and create account
      await enterNameAndEmailThenSignup(
        page,
        loginPage,
        signupPage,
        registrationData.name,
        registrationData.email,
      );

      await expect(
        await signupPage.getEnterAccountInformationHeading(),
      ).toBeVisible();

      await fillSignupFormAndCreateAccount(
        page,
        signupPage,
        accountCreatedPage,
        registrationData,
      );

      // Step 10: Click 'Continue' button
      await accountCreatedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path); // back to home page
    });

    await test.step("Steps 11: Verify ' Logged in as username' at top", async () => {
      // Step 11: Verify ' Logged in as username' at top
      expect(await homePage.header.getLoggedInName()).toBe(
        registrationData.name,
      );
    });

    await test.step("Steps 12-14: Click 'Cart' button and Click 'Proceed To Checkout' button. Verify Address Details and Review Your Order", async () => {
      // Step 12: Click 'Cart' button
      await homePage.header.clickCartLink();

      // Step 13: Click 'Proceed To Checkout' button
      await cartPage.clickProceedToCheckoutBtn();

      // Step 14: Verify Address Details and Review Your Order
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getDeliveryAddress(),
        registrationData,
      );
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getBillingAddress(),
        registrationData,
      );

      expect(await checkoutPage.orderTable.getLineCount()).toBe(1);
      const orderLine = await checkoutPage.orderTable.getLine(0);
      expect(await orderLine.getName()).toBe(addedProduct.name);
      expect(await orderLine.getPrice()).toBe(addedProduct.price);
      expect(await orderLine.getQuantity()).toBe("1");
      expect(await orderLine.getTotalPrice()).toBe(addedProduct.price);
      expect(await checkoutPage.orderTable.getTotalAmount()).toBe(
        addedProduct.price,
      );
    });
  },
);
