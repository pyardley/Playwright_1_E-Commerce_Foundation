import { BasePage } from "./BasePage";

export class Products extends BasePage {
  readonly path = "/products";

  async getAllProductsHeading() {
    return this.page.getByRole("heading", {
      name: "All Products",
    });
  }
}
