import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

export class PaymentPage extends BasePage {
  readonly path = "/payment";
  readonly header: Header;
  readonly footer: Footer;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
  }

  async getPayAndConfirmOrderButton() {
    return this.page.getByTestId("pay-button");
  }

  async clickPayAndConfirmOrderButton() {
    await (await this.getPayAndConfirmOrderButton()).click();
  }

  async getCommentInput() {
    return this.page.locator("textarea.form-control");
  }

  async setCommentInput(comment: string) {
    await (await this.getCommentInput()).fill(comment);
  }

  async getNameOnCardInput() {
    return this.page.getByTestId("name-on-card");
  }

  async setNameOnCardInput(name: string) {
    await (await this.getNameOnCardInput()).fill(name);
  }

  async getCardNumberInput() {
    return this.page.getByTestId("card-number");
  }

  async setCardNumberInput(cardNumber: string) {
    await (await this.getCardNumberInput()).fill(cardNumber);
  }

  async getCVCInput() {
    return this.page.getByTestId("cvc");
  }

  async setCVCInput(cvc: string) {
    await (await this.getCVCInput()).fill(cvc);
  }

  async getExpirationMMInput() {
    return this.page.getByTestId("expiry-month");
  }

  async setExpirationMMInput(expMM: string) {
    await (await this.getExpirationMMInput()).fill(expMM);
  }

  async getExpirationYYYYInput() {
    return this.page.getByTestId("expiry-year");
  }

  async setExpirationYYYYInput(expYYYY: string) {
    await (await this.getExpirationYYYYInput()).fill(expYYYY);
  }
}
