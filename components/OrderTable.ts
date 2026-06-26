import { Locator, Page } from "@playwright/test";

class OrderLine {
  constructor(private readonly lineLocator: Locator) {}

  async getName() {
    return (
      await this.lineLocator.locator(".cart_description h4 a").innerText()
    ).trim();
  }

  async getPrice() {
    return (await this.lineLocator.locator(".cart_price").innerText()).trim();
  }

  async getQuantity() {
    return (
      await this.lineLocator.locator(".cart_quantity button").innerText()
    ).trim();
  }

  async getTotalPrice() {
    return (
      await this.lineLocator.locator(".cart_total_price").innerText()
    ).trim();
  }
}

// Shared by CartPage and CheckoutPage: both render an identical #cart_info
// order table. Scoped to #cart_info (the wrapping div), not the <table>
// itself - CartPage's table has id="cart_info_table", but CheckoutPage's
// equivalent table has no id at all, so #cart_info is the only container
// common to both.
export class OrderTable {
  constructor(private readonly page: Page) {}

  async getContainer() {
    return this.page.locator("#cart_info");
  }

  private async getLineLocators() {
    return (await this.getContainer()).locator('tr[id^="product-"]');
  }

  async getLineCount() {
    return (await this.getLineLocators()).count();
  }

  async getLine(index: number) {
    const lineLocator = (await this.getLineLocators()).nth(index);
    return new OrderLine(lineLocator);
  }

  async getTotalAmount() {
    return (
      await (await this.getContainer())
        .getByRole("row", { name: "Total Amount" })
        .locator(".cart_total_price")
        .innerText()
    ).trim();
  }
}
