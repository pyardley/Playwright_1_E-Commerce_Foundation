import { Page } from "@playwright/test";

export abstract class BasePage {
  readonly page: Page;
  // string for pages with a fixed route (used directly by goto()); RegExp
  // for pages with a dynamic segment (e.g. /product_details/:id), which can
  // only be matched against, not navigated to directly.
  abstract readonly path: string | RegExp;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(options?: Parameters<Page["goto"]>[1]) {
    if (typeof this.path !== "string") {
      throw new Error(
        `Cannot goto() ${this.constructor.name}: its path (${this.path}) is dynamic - navigate to it via the UI flow instead.`,
      );
    }
    await this.page.goto(this.path, options);
  }

  async scrollToBottom() {
    // Scroll to the absolute bottom of the page
    await this.page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
  }

  async scrollToTop() {
    // Scroll to the absolute top of the page
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async getScrollToTopButton() {
    return this.page.locator("#scrollUp");
  }

  async clickScrollToTopButton() {
    await (await this.getScrollToTopButton()).click();
  }
}
