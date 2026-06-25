import { BasePage } from "./BasePage";

export class TestCasesPage extends BasePage {
  readonly path = "/test_cases";

  async getTestCasesHeading() {
    return this.page.getByRole("heading", { name: "Test Cases", exact: true, level: 2 });
  }
}
