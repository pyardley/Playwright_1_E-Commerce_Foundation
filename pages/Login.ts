import { BasePage } from "./BasePage";

export class Login extends BasePage {
  readonly path = "/login";

  async getLoginForm() {
    return this.page.locator(".login-form");
  }
  async getLoginToYourAccountHeading() {
    return (await this.getLoginForm()).getByRole("heading", {
      name: "Login to your account",
    });
  }

  async getEmailInput() {
    return (await this.getLoginForm()).getByRole("textbox", {
      name: "email",
    });
  }

  async setEmailInput(email: string) {
    const input = await this.getEmailInput();
    await input.fill(email);
  }

  async getPasswordInput() {
    return (await this.getLoginForm()).getByRole("textbox", {
      name: "password",
    });
  }

  async setPasswordInput(password: string) {
    const input = await this.getPasswordInput();
    await input.fill(password);
  }

  async clickLoginButton() {
    const signupButton = this.page.getByRole("button", { name: "Login" });
    await signupButton.click();
  }

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

  async getEmailOrPasswordInvalidError() {
    return (await this.getLoginForm()).getByText(
      "Your email or password is incorrect!",
      { exact: true },
    );
  }
}
