import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { OrderTable } from "@components/OrderTable";

export class CheckoutModal {
  constructor(private readonly modalLocator: Locator) {}

  async getHeading() {
    return this.modalLocator.getByRole("heading", { name: "Checkout" });
  }

  async getRegisterLoginLink() {
    return this.modalLocator
      .getByRole("link", { name: "Register / Login" })
      .locator("u");
  }

  async clickRegisterLoginLink() {
    await (await this.getRegisterLoginLink()).click();
  }

  async getContinueOnCartButton() {
    return this.modalLocator.getByRole("button", { name: "Continue On Cart" });
  }

  async clickContinueOnCartButton() {
    await (await this.getContinueOnCartButton()).click();
  }
}

export class CartPage extends BasePage {
  readonly path = "/view_cart";
  readonly header: Header;
  readonly footer: Footer;
  readonly orderTable: OrderTable;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
    this.orderTable = new OrderTable(page);
  }

  async getShoppingCartHeader() {
    return this.page.getByRole("listitem").filter({ hasText: "Shopping Cart" });
  }

  // No getByRole("link"/"button") match here: the markup is an <a> with no
  // href, which has no implicit ARIA role at all.
  async getProceedToCheckoutButton() {
    return this.page.getByText("Proceed To Checkout", { exact: true });
  }

  async clickProceedToCheckoutButton() {
    await (await this.getProceedToCheckoutButton()).click();
  }

  async getCheckoutModal() {
    return new CheckoutModal(
      this.page.locator("#checkoutModal .modal-content"),
    );
  }
}
