import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";

export class HomePage extends BasePage {
  readonly path = "/";
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }
}
