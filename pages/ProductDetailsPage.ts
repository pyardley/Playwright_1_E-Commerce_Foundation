import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { AddedToCartModal } from "@components/AddedToCartModal";

export interface ProductDetailsInfo {
  productName: string;
  price: string;
  category: string;
  availability: string;
  condition: string;
  brand: string;
}

export class ProductDetailsPage extends BasePage {
  // /product_details/<id> - the id is only known after navigating here via
  // a "View Product" link, so this can't be a fixed string like other pages.
  readonly path = /\/product_details\/\d+/;
  readonly addedToCartModal: AddedToCartModal;

  constructor(page: Page) {
    super(page);
    this.addedToCartModal = new AddedToCartModal(page);
  }

  async getProductInformationLocator() {
    return this.page.locator(".product-information");
  }

  async getProductDetails(): Promise<ProductDetailsInfo> {
    // Isolate the specific card container
    const productDetails = await this.getProductInformationLocator();

    // Ensure the card is rendered before scraping
    await productDetails.waitFor({ state: "visible" });

    // Extract text strictly from the static info block (ignoring the hover overlay)
    const price = await productDetails
      .locator("span > span")
      .first()
      .innerText();
    const productName = await productDetails
      .getByRole("heading", { level: 2 })
      .innerText();
    const category = await productDetails
      .locator("p", { hasText: "Category:" })
      .innerText();
    const availability = await productDetails
      .locator("p", { hasText: "Availability:" })
      .innerText();
    const condition = await productDetails
      .locator("p", { hasText: "Condition:" })
      .innerText();
    const brand = await productDetails
      .locator("p", { hasText: "Brand:" })
      .innerText();

    return {
      productName: productName.trim(),
      price: price.trim(),
      category: category.trim(),
      availability: availability.trim(),
      condition: condition.trim(),
      brand: brand.trim(),
    };
  }

  async getAddToCartButton() {
    return (await this.getProductInformationLocator()).getByRole("button", {
      name: "Add to cart",
    });
  }

  async clickAddToCartButton() {
    await (await this.getAddToCartButton()).click();
  }

  async getQuantityInput() {
    return (await this.getProductInformationLocator()).getByRole("spinbutton");
  }

  async setQuantityInput(quantity: string) {
    await (await this.getQuantityInput()).fill(quantity);
  }
}
