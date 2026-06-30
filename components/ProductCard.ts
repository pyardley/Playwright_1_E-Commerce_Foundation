import { Locator, Page } from "@playwright/test";

export interface ProductSummary {
  name: string;
  price: string;
}

export class ProductCard {
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

  // Not getByRole: this anchor has no href, so it carries no accessible
  // link role. Unlike the main grid (see hoverAndClickAddToCart above),
  // carousel cards (e.g. recommended items) render a single .add-to-cart
  // directly in .productinfo with no .product-overlay duplicate, hidden
  // until the card is hovered.
  async getAddToCartLink() {
    return this.cardLocator.locator(".add-to-cart");
  }

  async clickAddToCartLink() {
    await this.cardLocator.hover();
    await (await this.getAddToCartLink()).click();
  }
}
