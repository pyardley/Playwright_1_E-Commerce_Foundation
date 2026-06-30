import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { LeftSidebar } from "@components/LeftSideBar";
import { ProductList } from "@components/ProductList";
import { AddedToCartModal } from "@components/AddedToCartModal";

export class HomePage extends BasePage {
  readonly path = "/";
  readonly header: Header;
  readonly footer: Footer;
  readonly leftSidebar: LeftSidebar;
  readonly productList: ProductList;
  readonly recommendedItemsList: ProductList;
  readonly addedToCartModal: AddedToCartModal;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
    this.leftSidebar = new LeftSidebar(page);
    this.productList = new ProductList(page);
    this.recommendedItemsList = new ProductList(
      page,
      "#recommended-item-carousel",
    );
    this.addedToCartModal = new AddedToCartModal(page);
  }

  async getRecommendedItemsHeader() {
    return this.page.getByRole("heading", {
      name: "recommended items",
    });
  }
}
