import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

export class PaymentDonePage extends BasePage {
  // /payment_done/<orderId> - the id is only known after submitting payment,
  // so this can't be a fixed string like other pages.
  readonly path = /\/payment_done\/\d+/;
  readonly header: Header;
  readonly footer: Footer;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
  }

  async getOrderPlacedHeader() {
    return this.page.getByTestId("order-placed").locator("b");
  }

  async getOrderConfirmation() {
    return this.page.getByText(
      "Congratulations! Your order has been confirmed!",
    );
  }

  async getDownloadInvoiceButton() {
    return this.page.getByRole("link", { name: "Download Invoice" });
  }

  async clickDownloadInvoiceButton() {
    await (await this.getDownloadInvoiceButton()).click();
  }

  async getContinueButton() {
    return this.page.getByTestId("continue-button");
  }

  async clickContinueButton() {
    await (await this.getContinueButton()).click();
  }
}
