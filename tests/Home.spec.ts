import { test, expect } from "@fixtures/fixtures";
import {
  navigateToHomeAndVerify,
  verifyOrderLineMatchesProduct,
} from "@support/steps";

// Test Case 10: Verify Subscription in home page
test(
  "Verify Subscription in home page",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      // Step 2: Navigate to url 'http://automationexercise.com'
      // Step 3: Verify that home page is visible successfully
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Scroll down to footer and Verify text 'SUBSCRIPTION'", async () => {
      // Step 4: Scroll down to footer
      // Step 5: Verify text 'SUBSCRIPTION'
      await expect(await homePage.footer.getSubscriptionHeader()).toBeVisible();
    });

    await test.step("Steps 6-7: Enter email address in input and click arrow button and Verify success message 'You have been successfully subscribed!' is visible", async () => {
      // Step 6:Enter email address in input and click arrow button
      await homePage.footer.setSubscriptionInput("test@test.com");
      await homePage.footer.clickSubscribeButton();

      // Step 7:Verify success message 'You have been successfully subscribed!' is visible
      await expect(await homePage.footer.getSubscribedMessage()).toBeVisible();
    });
  },
);

// Test Case 13: Verify Product quantity in Cart
test(
  "Add Products in Cart",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, productDetailsPage, cartPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    const selectedProduct =
      await test.step("Steps 4-5: Click 'View Product' for any product on home page and Verify product detail is opened", async () => {
        // Step 4: Click on 'Products' button
        const productCard = await homePage.productList.getProductCard(0);
        const summary = await productCard.getSummary();
        await productCard.clickViewProduct();

        // Step 5: Verify product detail is opened
        await expect(page).toHaveURL(productDetailsPage.path);

        return summary;
      });

    await test.step("Steps 6-8: Increase quantity to 4, Click 'Add to cart' button and Verify Added! pop-up and Click Click 'View Cart' button", async () => {
      // Step 6: Increase quantity to 4
      await productDetailsPage.setQuantityInput("4");

      // Step 7: Click 'Add to cart' button
      await productDetailsPage.clickAddToCartButton();
      await expect(
        await productDetailsPage.addedToCartModal.getHeader(),
      ).toBeVisible();

      // Step 8: Click 'View Cart' button
      await productDetailsPage.addedToCartModal.clickViewCartLink();
    });

    await test.step("Steps 9: Verify that product is displayed in cart page with exact quantity.", async () => {
      // Step 9: Verify that product is displayed in cart page with exact quantity
      expect(await cartPage.orderTable.getLineCount()).toBe(1);

      // Step 9: Verify both products are added to Cart
      // Step 10: Verify their prices, quantity and total price
      await verifyOrderLineMatchesProduct(
        cartPage.orderTable,
        0,
        selectedProduct,
        4,
      );
    });
  },
);

// Test Case 18: View Category Products
test(
  "View Category Products",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Step 2: Navigate to url", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Step 3: Verify that categories are visible on left side bar", async () => {
      await expect(
        await homePage.leftSidebar.getCategoryHeading(),
      ).toBeVisible();
    });

    await test.step("Steps 4-5: Click on 'Women' category. Click on any category link under 'Women' category, for example: Dress", async () => {
      const womenCatObj = await homePage.leftSidebar.getCategory("Women");
      await womenCatObj.expandCategory();

      await womenCatObj.clickSubCategory("Dress");
    });

    await test.step("Step 6: Verify that category page is displayed and confirm text 'WOMEN - DRESS PRODUCTS'", async () => {
      await expect(
        await homePage.productList.getCategoryProductsHeading("Women", "Dress"),
      ).toBeVisible();

      const allProducts =
        await homePage.productList.getAllDisplayedProductNames();
      for (const productName of allProducts) {
        expect(productName.toLowerCase()).toContain("dress");
      }
    });

    await test.step("Step 7: On left side bar, click on any sub-category link of 'Men' category", async () => {
      const menCatObj = await homePage.leftSidebar.getCategory("Men");
      await menCatObj.expandCategory();

      await menCatObj.clickSubCategory("Jeans");

      await expect(
        await homePage.productList.getCategoryProductsHeading("Men", "Jeans"),
      ).toBeVisible();
    });

    await test.step("Step 8: Verify that user is navigated to that category page'", async () => {
      const allProducts =
        await homePage.productList.getAllDisplayedProductNames();
      for (const productName of allProducts) {
        expect(productName.toLowerCase()).toContain("jeans");
      }
    });
  },
);
