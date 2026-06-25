import { BasePage } from "./BasePage";

export class ContactUsPage extends BasePage {
  readonly path = "/contact_us";

  async getGetInTouchHeading() {
    return this.page.getByRole("heading", { name: "Get In Touch" });
  }

  // exact: true - without it, "Name" is fine alone, but "Email" would
  // ambiguously also match the footer's "Your email address" newsletter
  // field (both contain "email").
  async getNameInput() {
    return this.page.getByRole("textbox", { name: "Name", exact: true });
  }

  async setNameInput(name: string) {
    const nameInput = await this.getNameInput();
    await nameInput.fill(name);
  }

  async getEmailInput() {
    return this.page.getByRole("textbox", { name: "Email", exact: true });
  }

  async setEmailInput(email: string) {
    const emailInput = await this.getEmailInput();
    await emailInput.fill(email);
  }

  async getSubjectInput() {
    return this.page.getByRole("textbox", { name: "Subject", exact: true });
  }

  async setSubjectInput(subject: string) {
    const subjectInput = await this.getSubjectInput();
    await subjectInput.fill(subject);
  }

  // The message textarea has no <label>/aria-label, so its accessible name
  // falls back to its placeholder text.
  async getMessageInput() {
    return this.page.getByRole("textbox", { name: "Your Message Here" });
  }

  async setMessageInput(message: string) {
    const messageInput = await this.getMessageInput();
    await messageInput.fill(message);
  }

  async setFileUpload(fileName: string, content: string) {
    const fileInput = this.page.locator('input[name="upload_file"]');
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: Buffer.from(content),
    });
  }

  async clickSubmitButton() {
    // Submitting triggers a native browser confirm() dialog ("Press OK to
    // proceed!"). The listener must be registered before the click, since
    // Playwright can't react to a dialog that's already in progress.
    this.page.once("dialog", (dialog) => dialog.accept());

    const submitButton = this.page.getByRole("button", { name: "Submit" });
    await submitButton.click();
  }

  // Scoped to #contact-page: the footer's newsletter widget has its own
  // hidden element with the exact same default success text.
  async getSuccessMessage() {
    return this.page
      .locator("#contact-page")
      .getByText("Success! Your details have been submitted successfully.");
  }

  // Scoped to #form-section: the global nav also has a "Home" link, and this
  // is the distinct button shown only after a successful submission.
  async clickHomeButton() {
    const homeButton = this.page
      .locator("#form-section")
      .getByRole("link", { name: "Home" });
    await homeButton.click();
  }
}
