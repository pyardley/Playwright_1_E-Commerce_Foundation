import { test, expect } from "@fixtures/fixtures";
import {
  navigateToHomeAndVerify,
  clickSignupLoginLink,
  loginAsTestUserAndVerifyLoggedIn,
  deleteAccountAndVerifyDeleted,
  verifyAddressMatchesRegistrationData,
  verifyOrderLineMatchesProduct,
  verifyOrderTotalAmount,
  payAndVerifyOrderPlaced,
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
      await clickSignupLoginLink(page, homePage.header);
      await expect(
        await loginPage.getLoginToYourAccountHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 6-8: Enter correct email address and password, click 'login' and verify that 'Logged in as username' is visible", async () => {
      await loginAsTestUserAndVerifyLoggedIn(
        page,
        loginPage,
        homePage,
        testUser,
      );
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
      await clickSignupLoginLink(page, homePage.header);
      await expect(
        await loginPage.getLoginToYourAccountHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 6-8: Enter incorrect email address and password, click 'login' and Verify error 'Your email or password is incorrect!' is visible", async () => {
      // Step 6: Enter incorrect email address and password
      await loginPage.setEmailInput("invalid@email.com");
      await loginPage.setPasswordInput("password");

      // Step 7: Click 'login' button
      await loginPage.clickLoginButton();
      await expect(page).toHaveURL(loginPage.path); //Still on login page

      // Step 8: Verify error 'Your email or password is incorrect!' is visible
      await expect(
        await loginPage.getEmailOrPasswordInvalidError(),
      ).toBeVisible();
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
      await clickSignupLoginLink(page, homePage.header);
      await expect(
        await loginPage.getLoginToYourAccountHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 6-8: Enter correct email address and password, click 'login' and verify that 'Logged in as username' is visible", async () => {
      await loginAsTestUserAndVerifyLoggedIn(
        page,
        loginPage,
        homePage,
        testUser,
      );
    });

    await test.step("Steps 9-10: Click 'Logout' button and Verify that user is navigated to login page", async () => {
      // Step 9: Click 'Logout' button
      await homePage.header.clickLogoutLink();

      // Step 10: Verify that user is navigated to login page
      await expect(page).toHaveURL(loginPage.path);
    });
  },
);

// Test Case 16: Place Order: Login before Checkout
test(
  "Place Order: Login before Checkout",
  { tag: ["@smoke", "@e2e"] },
  async ({
    page,
    homePage,
    loginPage,
    cartPage,
    checkoutPage,
    paymentPage,
    paymentDonePage,
    accountDeletedPage,
    testUser,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.
    // The `testUser` fixture registers an account via the API beforehand,
    // since this test exercises login, not registration.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    // Step 4: Click 'Signup / Login' button
    await test.step("Steps 4: Click 'Signup / Login' button", async () => {
      await clickSignupLoginLink(page, homePage.header);
      await expect(
        await loginPage.getLoginToYourAccountHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 5-6: Fill email, password and click 'Login' button. Verify 'Logged in as username' at top", async () => {
      // Step 5: Fill email, password and click 'Login' button
      // Step 6: Verify 'Logged in as username' at top
      await loginAsTestUserAndVerifyLoggedIn(
        page,
        loginPage,
        homePage,
        testUser,
      );
    });

    const addedProduct1 =
      await test.step("Steps 7A: Add products to cart.", async () => {
        // Step 7: Add products to cart
        const productCard = await homePage.productList.getProductCard(0);
        const summary = await productCard.getSummary();
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        return summary;
      });

    const addedProduct2 =
      await test.step("Steps 7B: Add products to cart.", async () => {
        // Step 7: Add products to cart
        const productCard = await homePage.productList.getProductCard(1);
        const summary = await productCard.getSummary();
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        return summary;
      });

    await test.step("Steps 8-9: Click 'Cart' button. Verify that cart page is displayed", async () => {
      // Step 8: Click 'Cart' button
      await homePage.header.clickCartLink();

      // Step 9: Verify that cart page is displayed
      await expect(page).toHaveURL(cartPage.path);
      await expect(await cartPage.getShoppingCartHeader()).toBeVisible();
    });

    await test.step("Steps 10-11: Click Proceed To Checkout. Verify Address Details and Review Your Order", async () => {
      // Step 10: Click Proceed To Checkout
      await cartPage.clickProceedToCheckoutButton();

      // Step 11: Verify Address Details and Review Your Order
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getDeliveryAddress(),
        testUser,
      );
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getBillingAddress(),
        testUser,
      );

      expect(await checkoutPage.orderTable.getLineCount()).toBe(2);

      await verifyOrderLineMatchesProduct(
        checkoutPage.orderTable,
        0,
        addedProduct1,
      );
      await verifyOrderLineMatchesProduct(
        checkoutPage.orderTable,
        1,
        addedProduct2,
      );
      await verifyOrderTotalAmount(checkoutPage.orderTable, [
        addedProduct1,
        addedProduct2,
      ]);
    });

    await test.step("Steps 12: Enter description in comment text area and click 'Place Order''", async () => {
      // Step 12: Enter description in comment text area and click 'Place Order'
      await checkoutPage.setCommentInput("Comment text");

      await checkoutPage.clickPlaceOrderButton();
      await expect(page).toHaveURL(paymentPage.path);
    });

    await test.step("Steps 13-15: Enter payment details: Name on Card, Card Number, CVC, Expiration date. Click 'Pay and Confirm Order' button. Verify success message 'Your order has been placed successfully!'", async () => {
      // Steps 13-15: Enter payment details, click 'Pay and Confirm Order', verify success message
      await payAndVerifyOrderPlaced(paymentPage, paymentDonePage);
    });

    await test.step("Steps 16-17: Click 'Delete Account' button and verify 'ACCOUNT DELETED!' is visible", async () => {
      // Step 16: Click 'Delete Account' button
      // Step 17: Verify 'ACCOUNT DELETED!' and click 'Continue' button
      await deleteAccountAndVerifyDeleted(
        page,
        homePage.header,
        accountDeletedPage,
      );
    });
  },
);
