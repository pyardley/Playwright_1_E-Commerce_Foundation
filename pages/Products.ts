import { BasePage } from "./BasePage";

export interface ProductSummary {
  name: string;
  price: string;
}
export class Products extends BasePage {
  readonly path = "/products";

  async getAllProductsHeading() {
    return this.page.getByRole("heading", {
      name: "All Products",
    });
  }

  async getProductListContainer() {
    return this.page.locator(".features_items");
  }

  async getProductCount() {
    return (await this.getProductListContainer())
      .locator(".product-image-wrapper")
      .count();
  }

  // Scoped to .product-image-wrapper, not .single-products: the "View
  // Product" link lives in a sibling .choose block, not inside
  // .single-products, so a narrower scope would miss it.
  async getProductCard(index: number) {
    return (await this.getProductListContainer())
      .locator(".product-image-wrapper")
      .nth(index);
  }

  async clickViewProduct(index: number) {
    await (await this.getProductCard(index))
      .getByRole("link", { name: "View Product" })
      .click();
  }

  async clickViewFirstProduct() {
    await this.clickViewProduct(0);
  }

  async getNthProductSummary(index: number): Promise<ProductSummary> {
    // Isolate the specific card container
    const productCard = await this.getProductCard(index);

    // Ensure the card is rendered before scraping
    await productCard.waitFor({ state: "visible" });

    // Extract text strictly from the static info block (ignoring the hover overlay)
    const price = await productCard.locator(".productinfo h2").innerText();
    const name = await productCard.locator(".productinfo p").innerText();

    return {
      name: name.trim(),
      price: price.trim(),
    };
  }

  async getSearchInput() {
    return this.page.getByPlaceholder("Search Product");
  }

  async setSearchInput(search: string) {
    const searchInput = await this.getSearchInput();
    await searchInput.fill(search);
  }

  async getSearchButton() {
    return this.page
      .getByRole("button")
      .and(this.page.locator("#submit_search"));
  }

  async clickSearchButton() {
    await (await this.getSearchButton()).click();
  }

  async searchForProduct(search: string) {
    await this.setSearchInput(search);
    await this.clickSearchButton();
  }

  async getSearchedProductsHeader() {
    return this.page.getByRole("heading", {
      name: "Searched Products",
    });
  }

  async getAllDisplayedProductNames(): Promise<string[]> {
    // Isolate the paragraph tags directly inside the static info elements
    const nameLocators = this.page.locator(".features_items .productinfo p");

    // Directly extract all text strings into an array
    const rawNames = await nameLocators.allInnerTexts();

    // Map through the array to clean up whitespace
    return rawNames.map((name) => name.trim());
  }
}
