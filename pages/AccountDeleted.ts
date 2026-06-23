import { BasePage } from "./BasePage";

export class AccountDeleted extends BasePage {
  readonly path = "/delete_account";

  async getAccountDeletedHeading() {
    return this.page.getByRole("heading", { name: "Account Deleted!" });
  }

  async getAccountDeletedHeadingText() {
    const heading = this.getAccountDeletedHeading();
    return (await heading).textContent();
  }

  async clickContinueButton() {
    const continueLink = this.page.getByRole("link", { name: "Continue" });
    await continueLink.click();
  }
}
