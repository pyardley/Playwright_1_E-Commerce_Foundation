import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

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
}
