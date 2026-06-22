import { Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(options?: Parameters<Page['goto']>[1]) {
    await this.page.goto(this.path, options);
  }
}
