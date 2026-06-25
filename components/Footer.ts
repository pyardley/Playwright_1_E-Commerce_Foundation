import { Page } from "@playwright/test";
import { dismissCookieConsent } from "./dismissCookieConsent";

export class Footer {
  constructor(private readonly page: Page) {}

  async getSubscriptionHeader() {
    return this.page.getByRole("heading", {
      name: "Subscription",
    });
  }

  // No <label>/aria-label on this input, so its accessible name falls back
  // to its placeholder text.
  async getSubscriptionInput() {
    return this.page.getByRole("textbox", { name: "Your email address" });
  }

  // Dismissed here rather than in clickSubscribeButton: this is the first
  // interaction in the subscribe flow, and the cookie consent overlay sitting
  // over the page during fill() was silently swallowing the typed value in
  // Firefox/WebKit (Chromium happened to tolerate it) - confirmed by reading
  // the input's value back after fill() returned empty in those browsers.
  async setSubscriptionInput(email: string) {
    await dismissCookieConsent(this.page);
    const subscriptionInput = await this.getSubscriptionInput();
    await subscriptionInput.fill(email);
  }

  // The submit button has only an icon, no accessible name, so it's matched
  // by its stable id instead.
  async getSubscribeButton() {
    return this.page.getByRole("button").and(this.page.locator("#subscribe"));
  }

  async clickSubscribeButton() {
    const subscribeButton = await this.getSubscribeButton();
    await subscribeButton.click();
  }

  async getSubscribedMessage() {
    return this.page.getByText("You have been successfully subscribed!");
  }
}
