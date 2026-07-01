import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { OrderTable } from "@components/OrderTable";

export class AddressDetails {
  constructor(private readonly addrLocator: Locator) {}

  async getFullName() {
    return (
      await this.addrLocator.locator(".address_firstname").innerText()
    ).trim();
  }

  async getAddressLine(index: number) {
    return (
      await this.addrLocator.locator(".address_address1").nth(index).innerText()
    ).trim();
  }

  async getCityStateZip() {
    return (await this.addrLocator.locator(".address_city").innerText()).trim();
  }

  async getCountry() {
    return (
      await this.addrLocator.locator(".address_country_name").innerText()
    ).trim();
  }

  async getPhoneNumber() {
    return (
      await this.addrLocator.locator(".address_phone").innerText()
    ).trim();
  }
}

export class CheckoutPage extends BasePage {
  readonly path = "/checkout";
  readonly header: Header;
  readonly footer: Footer;
  readonly orderTable: OrderTable;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
    this.orderTable = new OrderTable(page);
  }

  async getDeliveryAddress() {
    return new AddressDetails(this.page.locator("#address_delivery"));
  }

  async getBillingAddress() {
    return new AddressDetails(this.page.locator("#address_invoice"));
  }

  async getPlaceOrderButton() {
    return this.page.getByRole("link", { name: "Place Order" });
  }

  async clickPlaceOrderButton() {
    await (await this.getPlaceOrderButton()).click();
  }

  async getCommentInput() {
    return this.page.locator("#ordermsg").getByRole("textbox");
  }

  async setCommentInput(comment: string) {
    await (await this.getCommentInput()).fill(comment);
  }
}
