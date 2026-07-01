import { test, expect } from "@fixtures/fixtures";
import { navigateToHomeAndVerify } from "@support/steps";

// Test Case 11: Verify Subscription in Cart page
test(
  "Verify Subscription in Cart page",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, cartPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      // Step 2: Navigate to url 'http://automationexercise.com'
      // Step 3: Verify that home page is visible successfully
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4: Click 'Cart' button", async () => {
      // Step 4: Click 'Cart' button
      await homePage.header.clickCartLink();
      await expect(page).toHaveURL(cartPage.path);
      await expect(await cartPage.getShoppingCartHeader()).toBeVisible();
    });

    await test.step("Steps 5-6: Scroll down to footer and Verify text 'SUBSCRIPTION'", async () => {
      // Step 5: Scroll down to footer
      // Step 6: Verify text 'SUBSCRIPTION'
      await expect(await homePage.footer.getSubscriptionHeader()).toBeVisible();
    });

    await test.step("Steps 7-8: Enter email address in input and click arrow button and Verify success message 'You have been successfully subscribed!' is visible", async () => {
      // Step 7:Enter email address in input and click arrow button
      await homePage.footer.setSubscriptionInput("test@test.com");
      await homePage.footer.clickSubscribeButton();

      // Step 8:Verify success message 'You have been successfully subscribed!' is visible
      await expect(await homePage.footer.getSubscribedMessage()).toBeVisible();
    });
  },
);

// Test Case 17: Remove Products From Cart
test(
  "Remove Products From Cart",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, cartPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      // Step 2: Navigate to url 'http://automationexercise.com'
      // Step 3: Verify that home page is visible successfully
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4A: Add products to cart.", async () => {
      // Step 4: Add products to cart
      const productCard = await homePage.productList.getProductCard(0);
      await productCard.hoverAndClickAddToCart();
      await homePage.addedToCartModal.clickContinueShoppingBtn();
    });

    await test.step("Steps 4B: Add products to cart.", async () => {
      // Step 4: Add products to cart
      const productCard = await homePage.productList.getProductCard(1);
      await productCard.hoverAndClickAddToCart();
      await homePage.addedToCartModal.clickContinueShoppingBtn();
    });

    await test.step("Steps 5-6: Click 'Cart' button and Verify that cart page is displayed", async () => {
      // Step 5: Click 'Cart' button
      await homePage.header.clickCartLink();
      await expect(page).toHaveURL(cartPage.path);
      await expect(await cartPage.getShoppingCartHeader()).toBeVisible();
    });

    await test.step("Steps 7-8: Click 'X' button corresponding to particular product and Verify that product is removed from the cart", async () => {
      // Store details prior to deletion
      expect(await cartPage.orderTable.getLineCount()).toBe(2);
      const orderLine0 = await cartPage.orderTable.getLine(0);
      const orderLine1 = await cartPage.orderTable.getLine(1);
      const deletedRowId = await orderLine0.getRowId();
      const remainingProductName = await orderLine1.getName();

      // Step 7: Click 'X' button corresponding to particular product
      await orderLine0.clickDeleteButton();
      await expect(
        await cartPage.orderTable.getLineLocatorById(deletedRowId),
      ).toHaveCount(0);

      // Step 8: Verify that product is removed from the cart
      expect(await cartPage.orderTable.getLineCount()).toBe(1);
      const newOrderLine0 = await cartPage.orderTable.getLine(0);

      expect(await newOrderLine0.getName()).toBe(remainingProductName);
    });
  },
);
