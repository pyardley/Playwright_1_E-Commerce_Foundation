import { Page } from "@playwright/test";

export class AddedToCartModal {
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
