import { BasePage } from "./BasePage";

export class Login extends BasePage {
  readonly path = "/login";

  async getNewUserSignup() {
    return this.page.locator(".signup-form");
  }

  async getNewUserSignUpHeading() {
    return (await this.getNewUserSignup()).getByRole("heading", {
      name: "New User Signup!",
    });
  }

  async getNewUserNameInput() {
    return (await this.getNewUserSignup()).getByRole("textbox", {
      name: "Name",
    });
  }

  async setNewUserNameInput(name: string) {
    const nameInput = await this.getNewUserNameInput();
    await nameInput.fill(name);
  }

  async getNewUserEmailInput() {
    return (await this.getNewUserSignup()).getByRole("textbox", {
      name: "Email Address",
    });
  }

  async setNewUserEmailInput(email: string) {
    const emailInput = await this.getNewUserEmailInput();
    await emailInput.fill(email);
  }

  async clickSignupButton() {
    const signupButton = this.page.getByRole("button", { name: "Signup" });
    await signupButton.click();
  }
}
