import { BasePage } from "./BasePage";

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

  async getProductDetails(): Promise<ProductDetailsInfo> {
    // Isolate the specific card container
    const productDetails = this.page.locator(".product-information");

    // Ensure the card is rendered before scraping
    await productDetails.waitFor({ state: "visible" });

    // Extract text strictly from the static info block (ignoring the hover overlay)
    const price = await productDetails
      .locator("span > span")
      .first()
      .innerText();
    const productName = await productDetails.locator("h2").innerText();
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
}
