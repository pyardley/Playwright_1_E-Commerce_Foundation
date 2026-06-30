import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductList } from "@components/ProductList";
import { LeftSidebar } from "@components/LeftSideBar";
import { AddedToCartModal } from "@components/AddedToCartModal";

export class ProductsPage extends BasePage {
  readonly path = "/products";
  readonly productList: ProductList;
  readonly addedToCartModal: AddedToCartModal;
  readonly leftSidebar: LeftSidebar;

  constructor(page: Page) {
    super(page);
    this.productList = new ProductList(page);
    this.addedToCartModal = new AddedToCartModal(page);
    this.leftSidebar = new LeftSidebar(page);
  }

  async getAllProductsHeading() {
    return this.page.getByRole("heading", {
      name: "All Products",
    });
  }

  async getSearchInput() {
    return this.page.getByPlaceholder("Search Product");
  }

  async setSearchInput(search: string) {
    const searchInput = await this.getSearchInput();
    await searchInput.fill(search);
  }

  async getSearchButton() {
    return this.page
      .getByRole("button")
      .and(this.page.locator("#submit_search"));
  }

  async clickSearchButton() {
    await (await this.getSearchButton()).click();
  }

  async searchForProduct(search: string) {
    await this.setSearchInput(search);
    await this.clickSearchButton();
  }

  async getSearchedProductsHeader() {
    return this.page.getByRole("heading", {
      name: "Searched Products",
    });
  }
}
