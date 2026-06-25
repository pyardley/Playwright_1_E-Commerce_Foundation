import { test as base, expect, APIRequestContext } from "@playwright/test";
import { HomePage } from "@pages/HomePage";
import { LoginPage } from "@pages/LoginPage";
import { SignupPage } from "@pages/SignupPage";
import { AccountCreatedPage } from "@pages/AccountCreatedPage";
import { AccountDeletedPage } from "@pages/AccountDeletedPage";
import { ContactUsPage } from "@pages/ContactUsPage";
import { TestCasesPage } from "@pages/TestCasesPage";
import { ProductsPage } from "@pages/ProductsPage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { CartPage } from "@pages/CartPage";
import { buildRegistrationData, RegistrationData } from "@support/testData";
import { AD_DOMAIN_PATTERN } from "@support/adBlocklist";

export type TestUser = RegistrationData;

// The createAccount API only reads classic form fields (request.POST in
// Django), not a JSON body - a JSON request gets "name parameter is missing"
// even though the field is present. It also always replies with HTTP 200;
// the real outcome is the `responseCode` field in the JSON body.
async function createUserViaApi(request: APIRequestContext, user: TestUser) {
  const response = await request.post("/api/createAccount", {
    form: {
      name: user.name,
      email: user.email,
      password: user.password,
      title: user.title,
      birth_date: user.birthDate,
      birth_month: user.birthMonth,
      birth_year: user.birthYear,
      firstname: user.firstname,
      lastname: user.lastname,
      company: user.company,
      address1: user.address1,
      address2: user.address2,
      country: user.country,
      zipcode: user.zipcode,
      state: user.state,
      city: user.city,
      mobile_number: user.mobileNumber,
    },
  });

  const body = await response.json();
  if (body.responseCode !== 201) {
    throw new Error(`Failed to create test user via API: ${body.message}`);
  }
}

// 404 ("Account not found!") is expected here when the test already deleted
// the account itself (e.g. via the UI delete-account flow) - only something
// else indicates teardown actually failed to clean up. Teardown must never
// throw - an empty/malformed response (or any other cleanup hiccup) should
// be logged, not fail an otherwise-passing test.
async function deleteUserViaApi(request: APIRequestContext, user: TestUser) {
  try {
    const response = await request.delete("/api/deleteAccount", {
      form: {
        email: user.email,
        password: user.password,
      },
    });

    const body = await response.json();
    if (body.responseCode !== 200 && body.responseCode !== 404) {
      console.warn(`Failed to delete test user via API: ${body.message}`);
    }
  } catch (error) {
    console.warn(`Failed to delete test user via API: ${error}`);
  }
}

type Fixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountCreatedPage: AccountCreatedPage;
  accountDeletedPage: AccountDeletedPage;
  contactUsPage: ContactUsPage;
  testCasesPage: TestCasesPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  testUser: TestUser;
  registrationData: RegistrationData;
  blockAdDomains: void;
};

export const test = base.extend<Fixtures>({
  blockAdDomains: [
    async ({ page }, use) => {
      if (process.env.TEST_SUITE !== "e2e") {
        await page.route(AD_DOMAIN_PATTERN, (route) => route.abort());
      }
      await use();
    },
    { auto: true },
  ],
  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountCreatedPage: async ({ page }, use) => use(new AccountCreatedPage(page)),
  accountDeletedPage: async ({ page }, use) => use(new AccountDeletedPage(page)),
  contactUsPage: async ({ page }, use) => use(new ContactUsPage(page)),
  testCasesPage: async ({ page }, use) => use(new TestCasesPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  testUser: async ({ request }, use) => {
    const user: TestUser = buildRegistrationData();

    await createUserViaApi(request, user);

    await use(user);

    await deleteUserViaApi(request, user);
  },
  // API-free - unlike testUser, this doesn't create an account, since the
  // "Register User" test creates its own account through the UI and would
  // otherwise end up with a redundant duplicate account.
  registrationData: async ({}, use) => use(buildRegistrationData()),
});

export { expect };
