import { test, expect } from "@fixtures/fixtures";
import { navigateToHomeAndVerify } from "@support/steps";
import { navigateToProductsAndVerify } from "@support/steps";

// Test Case 8: Verify All Products and product detail page
test(
  "Verify All Products and product detail page",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, productsPage, productDetailsPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-6: Click on 'Products' button and Verify user is navigated to ALL PRODUCTS page successfully and The products list is visible", async () => {
      // Step 4: Click on 'Products' button
      // Step 5: Verify user is navigated to ALL PRODUCTS page successfully
      await navigateToProductsAndVerify(page, homePage, productsPage);

      // Step 6: The products list is visible
      await expect(await productsPage.getProductListContainer()).toBeVisible();
      expect(await productsPage.getProductCount()).toBeGreaterThan(0);
    });

    const expectedSummary =
      await test.step("Capture the first product's listed name/price to verify against on the detail page", async () =>
        (await productsPage.getProductCard(0)).getSummary());

    await test.step("Steps 7-8: Click on 'View Product' of first product and Verify User is landed to product detail page", async () => {
      // Step 7: Click on 'View Product' of first product
      await (await productsPage.getProductCard(0)).clickViewProduct();

      // Step 8: User is landed to product detail page
      await expect(page).toHaveURL(productDetailsPage.path);
    });

    await test.step("Steps 9: Verify that product detail is visible: product name, category, price, availability, condition, brand", async () => {
      const details = await productDetailsPage.getProductDetails();

      // Name/price must match what was listed on the Products page
      expect(details.productName).toBe(expectedSummary.name);
      expect(details.price).toBe(expectedSummary.price);

      // Category/availability/condition/brand have no list-page equivalent
      // to compare against, so verify each is the labelled value it claims
      // to be rather than just asserting it's non-empty.
      expect(details.category).toMatch(/^Category:\s*.+/);
      expect(details.availability).toMatch(/^Availability:\s*.+/);
      expect(details.condition).toMatch(/^Condition:\s*.+/);
      expect(details.brand).toMatch(/^Brand:\s*.+/);
    });
  },
);

// Test Case 9: Search Product
test(
  "Search Product",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, productsPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click on 'Products' button and Verify user is navigated to ALL PRODUCTS page successfully", async () => {
      // Step 4: Click on 'Products' button
      // Step 5: Verify user is navigated to ALL PRODUCTS page successfully
      await navigateToProductsAndVerify(page, homePage, productsPage);
    });

    await test.step("Steps 6-7: Enter product name in search input and click search button. Verify 'SEARCHED PRODUCTS' is visible. Verify all the products related to search are visible.", async () => {
      // Step 6: Enter product name in search input and click search button
      await productsPage.searchForProduct("sleeves");

      // Step 7: Verify 'SEARCHED PRODUCTS' is visible
      await expect(page).toHaveURL("/products?search=sleeves");
      await expect(
        await productsPage.getSearchedProductsHeader(),
      ).toBeVisible();

      // Step 8:Verify all the products related to search are visible
      const allProducts = await productsPage.getAllDisplayedProductNames();
      for (const productName of allProducts) {
        expect(productName.toLowerCase()).toContain("sleeves");
      }
    });
  },
);

// Test Case 12: Add Products in Cart
test(
  "Add Products in Cart",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, productsPage, cartPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4: Click on 'Products' button and Verify user is navigated to ALL PRODUCTS page successfully and The products list is visible", async () => {
      // Step 4: Click on 'Products' button
      await navigateToProductsAndVerify(page, homePage, productsPage);

      await expect(await productsPage.getProductListContainer()).toBeVisible();
      expect(await productsPage.getProductCount()).toBeGreaterThan(0);
    });

    await test.step("Steps 5-6: Hover over first product and click 'Add to cart', Verify Added! pop-up and Click Continue Shopping", async () => {
      // Step 5: Hover over first product and click 'Add to cart'
      await (await productsPage.getProductCard(0)).hoverAndClickAddToCart();

      // Verify Add to cart pop-up appears
      const addedToCart = await productsPage.getAddedToCartModal();
      await expect(await addedToCart.getHeader()).toBeVisible();

      // Step 6: Click 'Continue Shopping' button
      await addedToCart.clickContinueShoppingBtn();
    });

    await test.step("Steps 7-8: Hover over second product and click 'Add to cart', Verify Added! pop-up and Click 'View Cart' button", async () => {
      // Step 7: Hover over first product and click 'Add to cart'
      await (await productsPage.getProductCard(1)).hoverAndClickAddToCart();

      // Verify Add to cart pop-up appears
      const addedToCart = await productsPage.getAddedToCartModal();
      await expect(await addedToCart.getHeader()).toBeVisible();

      // Step 8: Click 'Continue Shopping' button
      await addedToCart.clickViewCartLink();
      await expect(await cartPage.getShoppingCartHeader()).toBeVisible();
    });

    await test.step("Steps 9-10: Verify both products are added to Cart and Verify their prices, quantity and total price", async () => {
      expect(await cartPage.getCartListCount()).toBe(2);

      // Step 9: Verify both products are added to Cart
      // Step 10: Verify their prices, quantity and total price
      const cart1 = await cartPage.getCartLine(0);
      expect(await cart1.getName()).toBe("Blue Top");
      expect(await cart1.getPrice()).toBe("Rs. 500");
      expect(await cart1.getQuantity()).toBe("1");
      expect(await cart1.getTotalPrice()).toBe("Rs. 500");

      const cart2 = await cartPage.getCartLine(1);
      expect(await cart2.getName()).toBe("Men Tshirt");
      expect(await cart2.getPrice()).toBe("Rs. 400");
      expect(await cart2.getQuantity()).toBe("1");
      expect(await cart2.getTotalPrice()).toBe("Rs. 400");
    });
  },
);
