import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

export class HomePage extends BasePage {
  readonly path = "/";
  readonly header: Header;
  readonly footer: Footer;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
  }
}
