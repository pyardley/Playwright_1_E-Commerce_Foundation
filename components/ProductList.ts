import { Page } from "@playwright/test";
import { ProductCard } from "@components/ProductCard";

// Shared by HomePage (both the main grid and the recommended-items
// carousel) and ProductsPage - each passes its own container selector,
// defaulting to .features_items since that's the common case.
export class ProductList {
  constructor(
    private readonly page: Page,
    private readonly containerSelector: string = ".features_items",
  ) {}

  async getContainer() {
    return this.page.locator(this.containerSelector);
  }

  // Scoped to .product-image-wrapper, not .single-products: the "View
  // Product" link lives in a sibling .choose block, not inside
  // .single-products, so a narrower scope would miss it. :visible matters
  // for carousel containers (e.g. recommended items): the rotation keeps
  // every slide's cards in the DOM, with only the current page's actually
  // displayed, so an unfiltered match can pick an off-screen clone.
  private async getProductCardLocators() {
    return (await this.getContainer()).locator(".product-image-wrapper:visible");
  }

  async getProductCount() {
    return (await this.getContainer()).locator(".col-sm-4:visible").count();
  }

  async getProductCard(index: number) {
    const cardLocator = (await this.getProductCardLocators()).nth(index);
    return new ProductCard(cardLocator);
  }

  async getAllDisplayedProductNames(): Promise<string[]> {
    // Isolate the paragraph tags directly inside the static info elements
    const nameLocators = (await this.getContainer()).locator(".productinfo p");

    // Directly extract all text strings into an array
    const rawNames = await nameLocators.allInnerTexts();

    // Map through the array to clean up whitespace
    return rawNames.map((name) => name.trim());
  }

  // Not exact: the site occasionally wraps a heading word (e.g. "Dress") in
  // injected ad/annotation markup that adds extra whitespace around it,
  // which would break an exact accessible-name match.
  async getCategoryProductsHeading(cat: string, subcat: string) {
    return (await this.getContainer()).getByRole("heading", {
      name: `${cat.toUpperCase()} - ${subcat} PRODUCTS`,
    });
  }

  async getBrandProductsHeading(brand: string) {
    return (await this.getContainer()).getByRole("heading", {
      name: `Brand - ${brand} Products`,
    });
  }
}
