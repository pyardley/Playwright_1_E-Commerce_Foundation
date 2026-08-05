import { test, expect } from "@fixtures/fixtures";
import {
  validateResponse,
  productsListResponseSchema,
  brandsListResponseSchema,
  searchProductResponseSchema,
  apiErrorResponseSchema,
} from "@support/schemas";

// Unlike Accessibility.spec.ts, these are hard-fail by design: a broken API
// contract on automationexercise.com's own published endpoints (see
// https://automationexercise.com/api_list) is a real, actionable regression
// this team can act on, not noise from third-party page content it can't
// control. These endpoints are also read-only - no test data is created.
test.describe("API contract validation", () => {
  test(
    "GET /api/productsList returns a schema-valid product list",
    { tag: ["@api"] },
    async ({ request }) => {
      const response = await request.get("/api/productsList");
      const body = validateResponse(
        productsListResponseSchema,
        await response.json(),
        "GET /api/productsList",
      );

      expect(body.responseCode).toBe(200);
      expect(body.products.length).toBeGreaterThan(0);
    },
  );

  test(
    "GET /api/brandsList returns a schema-valid brand list",
    { tag: ["@api"] },
    async ({ request }) => {
      const response = await request.get("/api/brandsList");
      const body = validateResponse(
        brandsListResponseSchema,
        await response.json(),
        "GET /api/brandsList",
      );

      expect(body.responseCode).toBe(200);
      expect(body.brands.length).toBeGreaterThan(0);
    },
  );

  test(
    "POST /api/searchProduct returns a schema-valid product list for a known search term",
    { tag: ["@api"] },
    async ({ request }) => {
      const response = await request.post("/api/searchProduct", {
        form: { search_product: "top" },
      });
      const body = validateResponse(
        searchProductResponseSchema,
        await response.json(),
        "POST /api/searchProduct",
      );

      expect(body.responseCode).toBe(200);
      expect(body.products.length).toBeGreaterThan(0);
    },
  );

  test(
    "POST /api/searchProduct without search_product returns a schema-valid error",
    { tag: ["@api"] },
    async ({ request }) => {
      const response = await request.post("/api/searchProduct");
      const body = validateResponse(
        apiErrorResponseSchema,
        await response.json(),
        "POST /api/searchProduct (missing search_product)",
      );

      expect(body.responseCode).toBe(400);
    },
  );
});
