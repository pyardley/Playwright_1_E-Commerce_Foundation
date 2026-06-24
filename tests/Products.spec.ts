import { test, expect } from "@fixtures/fixtures";
import { navigateToHomeAndVerify } from "@support/steps";

// Test Case 8: Verify All Products and product detail page
test(
  "Verify Test Cases Page",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, products, productDetails }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-6: Click on 'Products' button and Verify user is navigated to ALL PRODUCTS page successfully and The products list is visible", async () => {
      // Step 4: Click on 'Products' button
      await homePage.header.clickProductsLink();

      // Step 5: Verify user is navigated to ALL PRODUCTS page successfully
      await expect(page).toHaveURL(products.path);
      await expect(await products.getAllProductsHeading()).toBeVisible();

      // Step 6: The products list is visible
      await expect(await products.getProductListContainer()).toBeVisible();
      expect(await products.getProductCount()).toBeGreaterThan(0);
    });

    const expectedSummary = await test.step(
      "Capture the first product's listed name/price to verify against on the detail page",
      async () => products.getNthProductSummary(0),
    );

    await test.step("Steps 7-8: Click on 'View Product' of first product and Verify User is landed to product detail page", async () => {
      // Step 7: Click on 'View Product' of first product
      await products.clickViewFirstProduct();

      // Step 8: User is landed to product detail page
      await expect(page).toHaveURL(productDetails.path);
    });

    await test.step("Steps 9: Verify that product detail is visible: product name, category, price, availability, condition, brand", async () => {
      const details = await productDetails.getProductDetails();

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
