import { test, expect } from "@fixtures/fixtures";
import {
  navigateToHomeAndVerify,
  clickSignupLoginLink,
  deleteAccountAndVerifyDeleted,
  enterNameAndEmailThenSignup,
  fillSignupFormAndCreateAccount,
  verifyAddressMatchesRegistrationData,
  verifyOrderLineMatchesProduct,
  verifyOrderTotalAmount,
  payAndVerifyOrderPlaced,
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
      await clickSignupLoginLink(page, homePage.header);
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
      await deleteAccountAndVerifyDeleted(
        page,
        homePage.header,
        accountDeletedPage,
      );
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
      await clickSignupLoginLink(page, homePage.header);
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
    paymentPage,
    paymentDonePage,
    accountDeletedPage,
    registrationData,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    const addedProduct =
      await test.step("Steps 4-6: Add products to cart, Click 'Cart' button and Verify that cart page is displayed", async () => {
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
      });

    await test.step("Steps 7: Click Proceed To Checkout and verify checkout modal", async () => {
      // Step 7: Click Proceed To Checkout
      await cartPage.clickProceedToCheckoutButton();

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
      await cartPage.clickProceedToCheckoutButton();

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
      await verifyOrderLineMatchesProduct(
        checkoutPage.orderTable,
        0,
        addedProduct,
      );
      await verifyOrderTotalAmount(checkoutPage.orderTable, [addedProduct]);
    });

    await test.step("Steps 15: Enter description in comment text area and click 'Place Order'", async () => {
      // Step 15: Enter description in comment text area and click 'Place Order'
      await checkoutPage.setCommentInput("Comment text");

      await checkoutPage.clickPlaceOrderButton();
      await expect(page).toHaveURL(paymentPage.path);
    });

    await test.step("Steps 16-18: Enter payment details: Name on Card, Card Number, CVC, Expiration date. Click 'Pay and Confirm Order' button. Verify success message 'Your order has been placed successfully!'", async () => {
      // Steps 16-18: Enter payment details, click 'Pay and Confirm Order', verify success message
      await payAndVerifyOrderPlaced(paymentPage, paymentDonePage);
    });

    await test.step("Steps 19-20: Click 'Delete Account' button and Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
      // Step 15: Enter description in comment text area and click 'Place Order'
      await deleteAccountAndVerifyDeleted(
        page,
        paymentDonePage.header,
        accountDeletedPage,
      );
    });
  },
);

// Test Case 15: Place Order: Register before Checkout
test(
  "Place Order: Register before Checkout",
  { tag: ["@smoke", "@e2e"] },
  async ({
    page,
    homePage,
    loginPage,
    signupPage,
    accountCreatedPage,
    cartPage,
    checkoutPage,
    paymentPage,
    paymentDonePage,
    accountDeletedPage,
    registrationData,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-6: Click 'Signup / Login' button. Fill all details in Signup and create account. Verify 'ACCOUNT CREATED!' and click 'Continue' button", async () => {
      // Step 4: Click 'Signup / Login' button
      await clickSignupLoginLink(page, homePage.header);
      await expect(await loginPage.getNewUserSignUpHeading()).toBeVisible();

      // Steps 5: Fill all details in Signup and create account
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

      await accountCreatedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path); // back to home page
    });

    await test.step("Steps 7: Verify ' Logged in as username' at top.", async () => {
      // Step 7: Verify ' Logged in as username' at top
      expect(await homePage.header.getLoggedInName()).toBe(
        registrationData.name,
      );
    });

    const addedProduct1 =
      await test.step("Steps 8A: Add products to cart.", async () => {
        // Step 8:Add products to cart
        const productCard = await homePage.productList.getProductCard(0);
        const summary = await productCard.getSummary();
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        return summary;
      });

    const addedProduct2 =
      await test.step("Steps 8B: Add products to cart.", async () => {
        // Step 8:Add products to cart
        const productCard = await homePage.productList.getProductCard(1);
        const summary = await productCard.getSummary();
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        return summary;
      });

    await test.step("Steps 9-10: Click 'Cart' button. Verify that cart page is displayed", async () => {
      // Step 9: Click 'Cart' button
      await homePage.header.clickCartLink();

      // Step 10: Verify that cart page is displayed
      await expect(page).toHaveURL(cartPage.path);
      await expect(await cartPage.getShoppingCartHeader()).toBeVisible();
    });

    await test.step("Steps 11-12: Click Proceed To Checkout. Verify Address Details and Review Your Order", async () => {
      // Step 11: Click Proceed To Checkout
      await cartPage.clickProceedToCheckoutButton();

      // Step 12: Verify Address Details and Review Your Order
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getDeliveryAddress(),
        registrationData,
      );
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getBillingAddress(),
        registrationData,
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

    await test.step("Steps 13: Enter description in comment text area and click 'Place Order''", async () => {
      // Step 15: Enter description in comment text area and click 'Place Order'
      await checkoutPage.setCommentInput("Comment text");

      await checkoutPage.clickPlaceOrderButton();
      await expect(page).toHaveURL(paymentPage.path);
    });

    await test.step("Steps 14-16: Enter payment details: Name on Card, Card Number, CVC, Expiration date. Click 'Pay and Confirm Order' button. Verify success message 'Your order has been placed successfully!'", async () => {
      // Steps 14-16: Enter payment details, click 'Pay and Confirm Order', verify success message
      await payAndVerifyOrderPlaced(paymentPage, paymentDonePage);
    });

    await test.step("Steps 17-18 Click 'Delete Account' button. Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
      // Step 17: Click 'Delete Account' button
      await deleteAccountAndVerifyDeleted(
        page,
        paymentDonePage.header,
        accountDeletedPage,
      );

      // Step 18 Verify 'ACCOUNT DELETED!' and click 'Continue' button
      await accountDeletedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path);
    });
  },
);

// Test Case 23: Verify address details in checkout page
test(
  "Verify address details in checkout page",
  { tag: ["@smoke", "@e2e"] },
  async ({
    page,
    homePage,
    loginPage,
    signupPage,
    cartPage,
    checkoutPage,
    accountCreatedPage,
    accountDeletedPage,
    registrationData,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Step 4: Click 'Signup / Login' button", async () => {
      // Step 4: Click 'Signup / Login' button
      await clickSignupLoginLink(page, homePage.header);
      await expect(await loginPage.getNewUserSignUpHeading()).toBeVisible();
    });

    await test.step("Steps 5-6: Fill all details in Signup and create account. Verify 'ACCOUNT CREATED!' and click 'Continue' button. Verify ' Logged in as username' at top", async () => {
      // Steps 5: Fill all details in Signup and create account
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

      await fillSignupFormAndCreateAccount(
        page,
        signupPage,
        accountCreatedPage,
        registrationData,
      );

      await accountCreatedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path); // back to home page

      // Step 16: Verify that 'Logged in as username' is visible
      expect(await homePage.header.getLoggedInName()).toBe(
        registrationData.name,
      );
    });

    await test.step("Steps 8-10: Add products to cart. Click 'Cart' button. Verify that cart page is displayed", async () => {
      // Step 8: Add products to cart
      let productCard = await homePage.productList.getProductCard(1);
      await productCard.hoverAndClickAddToCart();

      let addedToCartModal = homePage.addedToCartModal;
      await expect(await addedToCartModal.getHeader()).toBeVisible();
      await addedToCartModal.clickContinueShoppingBtn();

      productCard = await homePage.productList.getProductCard(2);
      await productCard.hoverAndClickAddToCart();

      addedToCartModal = homePage.addedToCartModal;
      await expect(await addedToCartModal.getHeader()).toBeVisible();
      await addedToCartModal.clickContinueShoppingBtn();

      // Step 9: Click 'Cart' button
      await homePage.header.clickCartLink();

      // Step 10: Verify that cart page is displayed
      await expect(page).toHaveURL(cartPage.path);
      await expect(await cartPage.getShoppingCartHeader()).toBeVisible();
    });

    await test.step("Steps 11-13: Click Proceed To Checkout. Verify that the delivery address is same address filled at the time registration of account. Verify that the billing address is same address filled at the time registration of account", async () => {
      // Step 11: Click Proceed To Checkout
      await cartPage.clickProceedToCheckoutButton();
      await expect(page).toHaveURL(checkoutPage.path);

      // Step 12: Verify that the delivery address is same address filled at the time registration of account
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getDeliveryAddress(),
        registrationData,
      );

      // Step 13: Verify that the billing address is same address filled at the time registration of account
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getBillingAddress(),
        registrationData,
      );
    });

    await test.step("Steps 14-15: Click 'Delete Account' button. Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
      // Step 14: Click 'Delete Account' button
      // Step 15: Verify 'ACCOUNT DELETED!' and click 'Continue' button
      await deleteAccountAndVerifyDeleted(
        page,
        homePage.header,
        accountDeletedPage,
      );

      await accountDeletedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path);
    });
  },
);

// Test Case 24: Download Invoice after purchase order
test(
  "Download Invoice after purchase order",
  { tag: ["@smoke", "@e2e"] },
  async ({
    page,
    homePage,
    loginPage,
    signupPage,
    accountCreatedPage,
    cartPage,
    checkoutPage,
    paymentPage,
    paymentDonePage,
    accountDeletedPage,
    registrationData,
  }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url 'http://automationexercise.com'. Verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    const addedProduct1 =
      await test.step("Step 4A: Add products to cart.", async () => {
        // Step 4: Add products to cart
        const productCard = await homePage.productList.getProductCard(0);
        const summary = await productCard.getSummary();
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        return summary;
      });

    const addedProduct2 =
      await test.step("Step 4B: Add products to cart.", async () => {
        // Step 4: Add products to cart
        const productCard = await homePage.productList.getProductCard(1);
        const summary = await productCard.getSummary();
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        return summary;
      });

    await test.step("Steps 5-6: Click 'Cart' button. Verify that cart page is displayed", async () => {
      // Step 9: Click 'Cart' button
      await homePage.header.clickCartLink();

      // Step 10: Verify that cart page is displayed
      await expect(page).toHaveURL(cartPage.path);
      await expect(await cartPage.getShoppingCartHeader()).toBeVisible();
    });

    await test.step("Steps 8-10: Click 'Signup / Login' button. Fill all details in Signup and create account. Verify 'ACCOUNT CREATED!' and click 'Continue' button", async () => {
      // Step 8: Click 'Signup / Login' button
      await clickSignupLoginLink(page, homePage.header);
      await expect(await loginPage.getNewUserSignUpHeading()).toBeVisible();

      // Steps 9: Fill all details in Signup and create account
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

      // Step 10:Verify 'ACCOUNT CREATED!' and click 'Continue' button
      await accountCreatedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path); // back to home page
    });

    await test.step("Step 11: Verify ' Logged in as username' at top.", async () => {
      // Step 11: Verify ' Logged in as username' at top
      expect(await homePage.header.getLoggedInName()).toBe(
        registrationData.name,
      );
    });

    await test.step("Steps 12-14: Click 'Cart' button. Click Proceed To Checkout. Verify Address Details and Review Your Order", async () => {
      // Step 12: Click 'Cart' button
      await homePage.header.clickCartLink();
      await expect(page).toHaveURL(cartPage.path);

      // Step 13: Click Proceed To Checkout
      await cartPage.clickProceedToCheckoutButton();
      await expect(page).toHaveURL(checkoutPage.path);

      // Step 12: Verify Address Details and Review Your Order
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getDeliveryAddress(),
        registrationData,
      );
      await verifyAddressMatchesRegistrationData(
        await checkoutPage.getBillingAddress(),
        registrationData,
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

    await test.step("Steps 15: Enter description in comment text area and click 'Place Order''", async () => {
      // Step 15: Enter description in comment text area and click 'Place Order'
      await checkoutPage.setCommentInput("Comment text");

      await checkoutPage.clickPlaceOrderButton();
      await expect(page).toHaveURL(paymentPage.path);
    });

    await test.step("Steps 16-18: Enter payment details: Name on Card, Card Number, CVC, Expiration date. Click 'Pay and Confirm Order' button. Verify success message 'Your order has been placed successfully!'", async () => {
      // Steps 16-18: Enter payment details, click 'Pay and Confirm Order', verify success message
      await payAndVerifyOrderPlaced(paymentPage, paymentDonePage);
    });

    await test.step("Steps 21-22 Click 'Download Invoice' button and verify invoice is downloaded successfully. Click 'Continue' button", async () => {
      // Step 19: Click 'Download Invoice' button and verify invoice is downloaded successfully.
      const download = await paymentDonePage.downloadInvoice();
      expect(download.suggestedFilename()).toMatch(/invoice/i);
      expect(await download.failure()).toBeNull();

      // Step 20: Click 'Continue' button
      await paymentDonePage.clickContinueButton();
    });

    await test.step("Steps 21-22 Click 'Delete Account' button. Verify 'ACCOUNT DELETED!' and click 'Continue' button", async () => {
      // Step 17: Click 'Delete Account' button
      await deleteAccountAndVerifyDeleted(
        page,
        paymentDonePage.header,
        accountDeletedPage,
      );

      // Step 18 Verify 'ACCOUNT DELETED!' and click 'Continue' button
      await accountDeletedPage.clickContinueButton();
      await expect(page).toHaveURL(homePage.path);
    });
  },
);
