import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

class CartLine {
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

export class CartPage extends BasePage {
  readonly path = "/view_cart";
  readonly header: Header;
  readonly footer: Footer;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
  }

  async getShoppingCartHeader() {
    return this.page.getByRole("listitem").filter({ hasText: "Shopping Cart" });
  }

  async getCartListContainer() {
    return this.page.locator("#cart_info_table");
  }

  private async getCartListItemLocators() {
    return (await this.getCartListContainer()).locator('tr[id^="product-"]');
  }

  async getCartListCount() {
    return (await this.getCartListItemLocators()).count();
  }

  async getCartLine(index: number) {
    const cardLocator = (await this.getCartListItemLocators()).nth(index);
    return new CartLine(cardLocator);
  }
}
