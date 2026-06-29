import { Locator, Page } from "@playwright/test";

export class Category {
  constructor(
    private readonly catLocator: Locator,
    private readonly subCatLocator: Locator,
  ) {}

  // Expand/collapse state lives on the subcategory panel (it's hidden via
  // Bootstrap's .collapse class), not on the toggle link - this site never
  // applies a "collapsed" class to the link itself, so checking the link's
  // class always read as "expanded" and skipped the click.
  async expandCategory() {
    if (!(await this.subCatLocator.isVisible())) {
      await this.catLocator.click();
    }
  }

  async collapseCategory() {
    if (await this.subCatLocator.isVisible()) {
      await this.catLocator.click();
    }
  }

  async clickSubCategory(subCat: string) {
    const subcatlink = (await this.subCatLocator).getByRole("link", {
      name: subCat,
    });
    await subcatlink.click();
  }
}

export class LeftSidebar {
  constructor(private readonly page: Page) {}

  async getSideBar() {
    return await this.page.locator(".left-sidebar");
  }

  async getCategoryHeading() {
    return await this.page.getByRole("heading", { name: "Category" });
  }

  async getCategoriesContainer() {
    return (await this.getSideBar()).locator("#accordian");
  }

  async getCategory(catName: string) {
    // Anchored regex, not exact: true - the link's accessible name is
    // prefixed with an icon glyph (e.g. "<icon> Women"), so an exact match
    // against the bare category name never matches. A plain substring match
    // would work but collides "Men" with "Women"; \b...$ matches the
    // category name as a whole trailing word instead.
    const catLocator = (await this.getCategoriesContainer()).getByRole("link", {
      name: new RegExp(`\\b${catName}$`, "i"),
    });
    const subCatLocator = (await this.getCategoriesContainer()).locator(
      `#${catName}`,
    );
    return new Category(catLocator, subCatLocator);
  }
}
