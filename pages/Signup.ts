import { BasePage } from "./BasePage";

export class Signup extends BasePage {
  readonly path = "/signup";

  async getEnterAccountInformationHeading() {
    return this.page.getByRole("heading", {
      name: "Enter Account Information",
    });
  }


  async setTitleToMr() {
    const titleMrRadio = this.page.getByRole("radio", { name: "Mr." });
    await titleMrRadio.check();
  }

  async setTitleToMrs() {
    const titleMrsRadio = this.page.getByRole("radio", { name: "Mrs." });
    await titleMrsRadio.check();
  }

  async getPasswordInput() {
    return this.page.getByRole("textbox", { name: "Password" });
  }

  async setPasswordInput(password: string) {
    const passwordInput = await this.getPasswordInput();
    await passwordInput.fill(password);
  }

  // The Day/Month/Year selects have no associated <label>, aria-label, or
  // aria-labelledby, so they expose no accessible name for getByRole to match.
  // Falling back to the stable data-qa test attributes is the most robust
  // option available here.
  async getDaySelect() {
    return this.page.locator('select[data-qa="days"]');
  }

  async setDaySelect(day: string) {
    const daySelect = await this.getDaySelect();
    await daySelect.selectOption(day);
  }

  async getMonthSelect() {
    return this.page.locator('select[data-qa="months"]');
  }

  async setMonthSelect(month: string) {
    const monthSelect = await this.getMonthSelect();
    await monthSelect.selectOption(month);
  }

  async getYearSelect() {
    return this.page.locator('select[data-qa="years"]');
  }

  async setYearSelect(year: string) {
    const yearSelect = await this.getYearSelect();
    await yearSelect.selectOption(year);
  }

  async getDateOfBirth() {
    const daySelect = await this.getDaySelect();
    const monthSelect = await this.getMonthSelect();
    const yearSelect = await this.getYearSelect();

    const day = await daySelect.inputValue();
    const month = await monthSelect.inputValue();
    const year = await yearSelect.inputValue();

    return `${day}/${month}/${year}`;
  }

  async setDateOfBirth(day: string, month: string, year: string) {
    await this.setDaySelect(day);
    await this.setMonthSelect(month);
    await this.setYearSelect(year);
  }

  async getNewsletterCheckbox() {
    return this.page.getByRole("checkbox", {
      name: "Sign up for our newsletter!",
    });
  }

  async setNewsletterCheckbox(checked: boolean) {
    const newsletterCheckbox = await this.getNewsletterCheckbox();
    const isChecked = await newsletterCheckbox.isChecked();
    if (isChecked !== checked) {
      await newsletterCheckbox.click();
    }
  }

  async getOffersCheckbox() {
    return this.page.getByRole("checkbox", {
      name: "Receive special offers from our partners!",
    });
  }

  async setOffersCheckbox(checked: boolean) {
    const offersCheckbox = await this.getOffersCheckbox();
    const isChecked = await offersCheckbox.isChecked();
    if (isChecked !== checked) {
      await offersCheckbox.click();
    }
  }

  async getFirstNameInput() {
    return this.page.getByRole("textbox", { name: "First name" });
  }

  async setFirstNameInput(firstName: string) {
    const firstNameInput = await this.getFirstNameInput();
    await firstNameInput.fill(firstName);
  }

  async getLastNameInput() {
    return this.page.getByRole("textbox", { name: "Last name" });
  }

  async setLastNameInput(lastName: string) {
    const lastNameInput = await this.getLastNameInput();
    await lastNameInput.fill(lastName);
  }

  async getCompanyInput() {
    return this.page.getByRole("textbox", { name: "Company", exact: true });
  }

  async setCompanyInput(company: string) {
    const companyInput = await this.getCompanyInput();
    await companyInput.fill(company);
  }

  async getAddress1Input() {
    return this.page.getByRole("textbox", { name: /^Address \*/ });
  }

  async setAddress1Input(address1: string) {
    const address1Input = await this.getAddress1Input();
    await address1Input.fill(address1);
  }

  async getAddress2Input() {
    return this.page.getByRole("textbox", { name: "Address 2" });
  }

  async setAddress2Input(address2: string) {
    const address2Input = await this.getAddress2Input();
    await address2Input.fill(address2);
  }

  async getCountrySelect() {
    return this.page.getByRole("combobox", { name: "Country" });
  }

  async setCountrySelect(country: string) {
    const countrySelect = await this.getCountrySelect();
    await countrySelect.selectOption(country);
  }

  async getStateInput() {
    return this.page.getByRole("textbox", { name: "State" });
  }

  async setStateInput(state: string) {
    const stateInput = await this.getStateInput();
    await stateInput.fill(state);
  }

  // The application has a markup bug: the Zipcode field's <label> incorrectly
  // points to the City input's id (for="city"), so the City input's
  // accessible name absorbs both labels ("City * Zipcode *") and the Zipcode
  // input itself ends up with no accessible name at all. A prefix match on
  // "City" keeps this resilient while still being accessibility-first.
  async getCityInput() {
    return this.page.getByRole("textbox", { name: /^City \*/ });
  }

  async setCityInput(city: string) {
    const cityInput = await this.getCityInput();
    await cityInput.fill(city);
  }

  // Zipcode has no accessible name due to the mislabeled <label for="city">
  // bug described above, so we fall back to the stable data-qa attribute.
  async getZipcodeInput() {
    return this.page.locator('input[data-qa="zipcode"]');
  }

  async setZipcodeInput(zipcode: string) {
    const zipcodeInput = await this.getZipcodeInput();
    await zipcodeInput.fill(zipcode);
  }

  async getMobileNumberInput() {
    return this.page.getByRole("textbox", { name: "Mobile Number" });
  }

  async setMobileNumberInput(mobileNumber: string) {
    const mobileNumberInput = await this.getMobileNumberInput();
    await mobileNumberInput.fill(mobileNumber);
  }

  async clickCreateAccountButton() {
    const createAccountButton = this.page.getByRole("button", {
      name: "Create Account",
    });
    await createAccountButton.click();
  }
}
