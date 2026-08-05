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
import { CheckoutPage } from "@pages/CheckoutPage";
import { PaymentPage } from "@pages/PaymentPage";
import { PaymentDonePage } from "@pages/PaymentDonePage";
import { buildRegistrationData, RegistrationData } from "@support/testData";
import { AD_DOMAIN_PATTERN } from "@support/adBlocklist";
import { PERF_INIT_SCRIPT, WebVitalEntry } from "@support/perf";
import {
  createAccountResponseSchema,
  deleteAccountResponseSchema,
  validateResponse,
} from "@support/schemas";
import AxeBuilder from "@axe-core/playwright";

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

  const body = validateResponse(
    createAccountResponseSchema,
    await response.json(),
    "POST /api/createAccount",
  );
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

    const body = validateResponse(
      deleteAccountResponseSchema,
      await response.json(),
      "DELETE /api/deleteAccount",
    );
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
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  paymentDonePage: PaymentDonePage;
  testUser: TestUser;
  registrationData: RegistrationData;
  blockAdDomains: void;
  axeBuilder: AxeBuilder;
  capturePerf: void;
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
  accountCreatedPage: async ({ page }, use) =>
    use(new AccountCreatedPage(page)),
  accountDeletedPage: async ({ page }, use) =>
    use(new AccountDeletedPage(page)),
  contactUsPage: async ({ page }, use) => use(new ContactUsPage(page)),
  testCasesPage: async ({ page }, use) => use(new TestCasesPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
  paymentDonePage: async ({ page }, use) => use(new PaymentDonePage(page)),
  productDetailsPage: async ({ page }, use) =>
    use(new ProductDetailsPage(page)),
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
  axeBuilder: async ({ page }, use) => use(new AxeBuilder({ page })),
  // Local-only performance telemetry (see reporters/perfReporter.ts) - never
  // collected in CI, since CI has nowhere local to persist it and this would
  // just be added overhead on an already-somewhat-slow live-site run.
  capturePerf: [
    async ({ page }, use, testInfo) => {
      if (process.env.CI) {
        await use();
        return;
      }

      const entries: WebVitalEntry[] = [];
      const pending: Promise<void>[] = [];

      await page.addInitScript(PERF_INIT_SCRIPT);

      // domcontentloaded, not load: load only fires once every sub-resource
      // (every product thumbnail on an image-heavy grid page, etc.) has
      // finished - on a multi-navigation test that clicks through to the
      // next page as soon as the DOM is ready, the browser never dispatches
      // load at all for a page navigated away from first (confirmed live:
      // Products' load event never fired before the test moved on to a
      // product's detail page). domcontentloaded fires much earlier and
      // isn't subject to that race, at the cost of loadMs sometimes being 0
      // (load genuinely hadn't happened yet) - documented in the README.
      page.on("domcontentloaded", () => {
        pending.push(
          (async () => {
            try {
              if (page.url() === "about:blank") return;

              // Double rAF settle instead of waitForTimeout/networkidle -
              // flushes a paint/layout pass without an arbitrary wait.
              await page.evaluate(
                () =>
                  new Promise<void>((resolve) =>
                    requestAnimationFrame(() =>
                      requestAnimationFrame(() => resolve()),
                    ),
                  ),
              );

              const entry = await page.evaluate(() => {
                const nav = performance.getEntriesByType(
                  "navigation",
                )[0] as PerformanceNavigationTiming | undefined;
                const metrics = (
                  window as unknown as {
                    __perfMetrics?: { lcpMs: number | null; cls: number | null };
                  }
                ).__perfMetrics ?? { lcpMs: null, cls: null };
                if (!nav) return null;

                return {
                  url: location.href,
                  ttfbMs: nav.responseStart,
                  domContentLoadedMs: nav.domContentLoadedEventEnd,
                  loadMs: nav.loadEventEnd,
                  lcpMs: metrics.lcpMs,
                  cls: metrics.cls,
                };
              });

              if (entry) entries.push(entry);
            } catch {
              // A fast subsequent navigation can tear down the execution
              // context mid-evaluate - drop that sample, don't fail the test.
            }
          })(),
        );
      });

      await use();
      await Promise.allSettled(pending);

      if (entries.length > 0) {
        await testInfo.attach("perf-web-vitals.json", {
          body: JSON.stringify(entries),
          contentType: "application/json",
        });
      }
    },
    { auto: true },
  ],
});

export { expect };
