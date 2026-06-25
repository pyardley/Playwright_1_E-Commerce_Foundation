import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

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

class AddedToCartModal {
  constructor(private readonly page: Page) {}

  async getModal() {
    return this.page.locator(".modal-content");
  }

  async getHeader() {
    return (await this.getModal()).getByRole("heading", { name: "Added!" });
  }

  async getContinueShoppingBtn() {
    return (await this.getModal()).getByRole("button", {
      name: "Continue Shopping",
    });
  }

  async clickContinueShoppingBtn() {
    await (await this.getContinueShoppingBtn()).click();
  }

  async getViewCartLink() {
    return (await this.getModal()).getByRole("link", { name: "View Cart" });
  }

  async clickViewCartLink() {
    await (await this.getViewCartLink()).click();
  }
}

export class ProductsPage extends BasePage {
  readonly path = "/products";

  async getAllProductsHeading() {
    return this.page.getByRole("heading", {
      name: "All Products",
    });
  }

  async getProductListContainer() {
    return this.page.locator(".features_items");
  }

  // Scoped to .product-image-wrapper, not .single-products: the "View
  // Product" link lives in a sibling .choose block, not inside
  // .single-products, so a narrower scope would miss it.
  private async getProductCardLocators() {
    return (await this.getProductListContainer()).locator(
      ".product-image-wrapper",
    );
  }

  async getProductCount() {
    return (await this.getProductCardLocators()).count();
  }

  async getProductCard(index: number) {
    const cardLocator = (await this.getProductCardLocators()).nth(index);
    return new ProductCard(cardLocator);
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

  async getAddedToCartModal() {
    return new AddedToCartModal(this.page);
  }
}
