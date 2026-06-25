import { BasePage } from "./BasePage";

export class AccountDeletedPage extends BasePage {
  readonly path = "/delete_account";

  async getAccountDeletedHeading() {
    return this.page.getByRole("heading", { name: "Account Deleted!" });
  }

  async clickContinueButton() {
    const continueLink = this.page.getByRole("link", { name: "Continue" });
    await continueLink.click();
  }
}
