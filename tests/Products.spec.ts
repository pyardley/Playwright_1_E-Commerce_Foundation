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
        productsPage.getNthProductSummary(0));

    await test.step("Steps 7-8: Click on 'View Product' of first product and Verify User is landed to product detail page", async () => {
      // Step 7: Click on 'View Product' of first product
      await productsPage.clickViewFirstProduct();

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

// Test Case 9: VSearch Product
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
      await expect(await productsPage.getSearchedProductsHeader()).toBeVisible();

      // Step 8:Verify all the products related to search are visible
      const allProducts = await productsPage.getAllDisplayedProductNames();
      for (const productName of allProducts) {
        expect(productName.toLowerCase()).toContain("sleeves");
      }
    });
  },
);
