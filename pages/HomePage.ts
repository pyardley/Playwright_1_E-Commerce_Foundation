import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { ProductList } from "@components/ProductList";
import { AddedToCartModal } from "@components/AddedToCartModal";

export class HomePage extends BasePage {
  readonly path = "/";
  readonly header: Header;
  readonly footer: Footer;
  readonly productList: ProductList;
  readonly addedToCartModal: AddedToCartModal;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
    this.productList = new ProductList(page);
    this.addedToCartModal = new AddedToCartModal(page);
  }
}
