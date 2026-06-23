import { test as base, expect, APIRequestContext } from '@playwright/test';
import { HomePage } from '@pages/Home';
import { Login } from '@pages/Login';
import { Signup } from '@pages/Signup';
import { AccountCreated } from '@pages/AccountCreated';
import { AccountDeleted } from '@pages/AccountDeleted';
import { ContactUs } from '@pages/ContactUs';

export type TestUser = {
  name: string;
  email: string;
  password: string;
};

// The createAccount API only reads classic form fields (request.POST in
// Django), not a JSON body - a JSON request gets "name parameter is missing"
// even though the field is present. It also always replies with HTTP 200;
// the real outcome is the `responseCode` field in the JSON body.
async function createUserViaApi(request: APIRequestContext, user: TestUser) {
  const response = await request.post('/api/createAccount', {
    form: {
      name: user.name,
      email: user.email,
      password: user.password,
      title: 'Mr',
      birth_date: '1',
      birth_month: '1',
      birth_year: '1990',
      firstname: 'John',
      lastname: 'Doe',
      company: 'Example Inc.',
      address1: '123 Main St',
      address2: 'Apt 4B',
      country: 'United States',
      zipcode: '90001',
      state: 'California',
      city: 'Los Angeles',
      mobile_number: '+1-555-123-4567',
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
    const response = await request.delete('/api/deleteAccount', {
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
  login: Login;
  signup: Signup;
  accountCreated: AccountCreated;
  accountDeleted: AccountDeleted;
  contactUs: ContactUs;
  testUser: TestUser;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  login: async ({ page }, use) => use(new Login(page)),
  signup: async ({ page }, use) => use(new Signup(page)),
  accountCreated: async ({ page }, use) => use(new AccountCreated(page)),
  accountDeleted: async ({ page }, use) => use(new AccountDeleted(page)),
  contactUs: async ({ page }, use) => use(new ContactUs(page)),
  testUser: async ({ request }, use) => {
    const user: TestUser = {
      name: 'John Doe',
      email: `john.doe.${Date.now()}@example.com`,
      password: 'password123',
    };

    await createUserViaApi(request, user);

    await use(user);

    await deleteUserViaApi(request, user);
  },
});

export { expect };
