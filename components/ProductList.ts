import { Locator, Page } from "@playwright/test";

export interface ProductSummary {
  name: string;
  price: string;
}

class ProductCard {
  constructor(private readonly cardLocator: Locator) {}

  async getName() {
    return (
      await this.cardLocator.locator(".productinfo p").innerText()
    ).trim();
  }

  async getPrice() {
    return (
      await this.cardLocator.locator(".productinfo h2").innerText()
    ).trim();
  }

  async getSummary(): Promise<ProductSummary> {
    await this.cardLocator.waitFor({ state: "visible" });
    return { name: await this.getName(), price: await this.getPrice() };
  }

  // The "View Product" link lives in a sibling .choose block, not inside
  // .single-products - this card's own locator is already scoped to
  // .product-image-wrapper (see getProductCardLocators below) so this just
  // queries within it.
  async clickViewProduct() {
    await this.cardLocator.getByRole("link", { name: "View Product" }).click();
  }

  async hoverAndClickAddToCart() {
    await this.cardLocator.hover();
    await this.cardLocator.locator(".product-overlay .add-to-cart").click();
  }
}

// Shared by HomePage and ProductsPage: both render an identical
// .features_items block of product cards.
export class ProductList {
  constructor(private readonly page: Page) {}

  async getContainer() {
    return this.page.locator(".features_items");
  }

  // Scoped to .product-image-wrapper, not .single-products: the "View
  // Product" link lives in a sibling .choose block, not inside
  // .single-products, so a narrower scope would miss it.
  private async getProductCardLocators() {
    return (await this.getContainer()).locator(".product-image-wrapper");
  }

  async getProductCount() {
    return (await this.getProductCardLocators()).count();
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
