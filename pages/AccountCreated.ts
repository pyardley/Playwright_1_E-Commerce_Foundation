import { BasePage } from "./BasePage";

export class AccountCreated extends BasePage {
  readonly path = "/account_created";

  async getAccountCreatedHeading() {
    return this.page.getByRole("heading", { name: "Account Created!" });
  }

  async clickContinueButton() {
    const continueLink = this.page.getByRole("link", { name: "Continue" });
    await continueLink.click();
  }
}
