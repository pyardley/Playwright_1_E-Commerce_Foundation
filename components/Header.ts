import { Page } from "@playwright/test";

export class Header {
  constructor(private readonly page: Page) {}

  async getHomeLink() {
    return this.page.getByRole("link", { name: "Home" });
  }

  async getProductsLink() {
    return this.page.getByRole("link", { name: "Products" });
  }

  async clickProductsLink() {
    await this.dismissCookieConsent();
    const productsLink = await this.getProductsLink();
    await productsLink.click();
  }

  async getCartLink() {
    return this.page.getByRole("link", { name: "Cart" });
  }

  async getLoginLink() {
    return this.page.getByRole("link", { name: "Signup / Login" });
  }

  async clickLoginLink() {
    await this.dismissCookieConsent();
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

  private async dismissCookieConsent() {
    const consentButton = this.page.getByRole("button", { name: "Consent" });

    try {
      // Wait up to 3000ms for the button to appear and click it
      await consentButton.click({ timeout: 3000 });
      console.log("Cookie consent dismissed.");
    } catch (e) {
      // If it times out, the pop-up didn't appear (like in Firefox).
      // We safely log it and let the test continue.
      console.log("Cookie consent banner did not appear, skipping.");
    }
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
    const fullText = await loggedInAs.textContent();

    const match = fullText?.match(/Logged in as\s+(.*)/);

    return match ? match[1].trim() : "";
  }

  async getContactUsLink() {
    return this.page.getByRole("link", { name: "Contact us" });
  }

  async clickContactUsLink() {
    await this.dismissCookieConsent();
    const contactUsLink = await this.getContactUsLink();
    await contactUsLink.click();
  }

  async getTestCasesLink() {
    return this.page.getByRole("link", { name: " Test Cases", exact: true });
  }

  async clickTestCasesLink() {
    await this.dismissCookieConsent();
    const testCasesLink = await this.getTestCasesLink();
    await testCasesLink.click();
  }
}
