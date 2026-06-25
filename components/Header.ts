import { Page } from "@playwright/test";
import { dismissCookieConsent } from "./dismissCookieConsent";

export class Header {
  constructor(private readonly page: Page) {}

  async getHomeLink() {
    return this.page.getByRole("link", { name: "Home" });
  }

  async getProductsLink() {
    return this.page.getByRole("link", { name: "Products" });
  }

  async clickProductsLink() {
    await dismissCookieConsent(this.page);
    const productsLink = await this.getProductsLink();
    await productsLink.click();
  }

  async getCartLink() {
    return this.page.getByRole("link", { name: "Cart" });
  }

  async clickCartLink() {
    await dismissCookieConsent(this.page);
    const cartLink = await this.getCartLink();
    await cartLink.click();
  }

  async getLoginLink() {
    return this.page.getByRole("link", { name: "Signup / Login" });
  }

  async clickLoginLink() {
    await dismissCookieConsent(this.page);
    const loginLink = await this.getLoginLink();
    await loginLink.click();
  }

  async getLogoutLink() {
    return this.page.getByRole("link", { name: "Logout" });
  }

  async clickLogoutLink() {
    const logoutlink = await this.getLogoutLink();
    await logoutlink.click();
  }

  async getDeleteAccountLink() {
    return this.page.getByRole("link", { name: "Delete Account" });
  }

  async clickDeleteAccountLink() {
    const deleteAccountLink = await this.getDeleteAccountLink();
    await deleteAccountLink.click();
  }

  async getLoggedInAs() {
    return this.page.getByText(/Logged in as .*/);
  }

  async getLoggedInName() {
    const loggedInAs = await this.getLoggedInAs();
    await loggedInAs.waitFor({ state: "visible" });
    const fullText = await loggedInAs.textContent();

    const match = fullText?.match(/Logged in as\s+(.*)/);

    return match ? match[1].trim() : "";
  }

  async getContactUsLink() {
    return this.page.getByRole("link", { name: "Contact us" });
  }

  async clickContactUsLink() {
    await dismissCookieConsent(this.page);
    const contactUsLink = await this.getContactUsLink();
    await contactUsLink.click();
  }

  async getTestCasesLink() {
    return this.page.getByRole("link", { name: " Test Cases", exact: true });
  }

  async clickTestCasesLink() {
    await dismissCookieConsent(this.page);
    const testCasesLink = await this.getTestCasesLink();
    await testCasesLink.click();
  }
}
