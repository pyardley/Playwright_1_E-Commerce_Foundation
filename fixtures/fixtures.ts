import { test as base, expect } from '@playwright/test';
import { HomePage } from '@pages/Home';
import { Login } from '@pages/Login';
import { Signup } from '@pages/Signup';
import { AccountCreated } from '@pages/AccountCreated';
import { AccountDeleted } from '@pages/AccountDeleted';

type Fixtures = {
  homePage: HomePage;
  login: Login;
  signup: Signup;
  accountCreated: AccountCreated;
  accountDeleted: AccountDeleted;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  login: async ({ page }, use) => use(new Login(page)),
  signup: async ({ page }, use) => use(new Signup(page)),
  accountCreated: async ({ page }, use) => use(new AccountCreated(page)),
  accountDeleted: async ({ page }, use) => use(new AccountDeleted(page)),
});

export { expect };
