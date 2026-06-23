import { BasePage } from "./BasePage";

export class Header extends BasePage {
  readonly path = "/";

  async getHomeLink() {
    return this.page.getByRole("link", { name: "Home" });
  }

  async getProductsLink() {
    return this.page.getByRole("link", { name: "Products" });
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

  private async dismissCookieConsent() {
    const consentButton = this.page.getByRole("button", { name: "Consent" });
    if (await consentButton.isVisible()) {
      await consentButton.click();
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
    const getloggedinas = await this.getLoggedInAs();
    const fullText = await getloggedinas.textContent();

    const match = fullText?.match(/Logged in as\s+(.*)/);

    return match ? match[1].trim() : "";
  }
}
